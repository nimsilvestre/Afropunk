const express = require("express");
const app = express();
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

//image to s3
const s3 = require("./s3.js");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const config = require("./config.json");

// db
const db = require("./db.js");

//cookieSession
app.use(cookieParser());
app.use(
    cookieSession({
        secret: "Muito secreto",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

//Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

// csurf (add to client side!)
app.use(csurf());

app.use(function(req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});
//CODE TO CHECK IF WE ARE IN DEVELOPMEMT (BUNDLE.JS)
if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({ target: "http://localhost:8081/" })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

//Serve Static
app.use("/public", express.static(__dirname + "/public"));

//MULTER STORAGE
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads"); //null is waiting for an error in node, if theres no error, null will be ignored.
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            //uidSafe generate un unique name with 24 caracters
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//WELCOME ROUTE
app.get("/welcome/", function(req, res) {
    //res.sendFile(__dirname + "/index.html");
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

//REGISTER ROUTE
app.post("/register", (req, res) => {
    console.log(req.body);

    db
        .hashPassword(req.body.password)
        .then(password => {
            db
                .register(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    password
                )
                .then(id => {
                    // set cookies on register
                    req.session.user = {
                        id: id,
                        first: req.body.first,
                        last: req.body.last,
                        email: req.body.email,
                        password: req.body.password
                    };
                    res.json({ success: true });
                });
        })
        .catch(err => {
            req.session = null;
            console.log(req.session);
            res.json({ success: false });
        });
});

//LOGIN ROUTE
app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        // error: true;
        res.json("Error: Empty input");
    } else {
        //compare against email to  check get password
        db
            .getUserInfo(req.body.email)
            .then(results => {
                console.log("login", results);
                return db
                    .checkPassword(req.body.password, results.password)
                    .then(match => {
                        if (match) {
                            //set cookies on login
                            req.session.user = {
                                id: results.id,
                                first: results.first,
                                last: results.last,
                                email: results.email,
                                bio: results.bio
                            };
                            res.json({ success: true });
                        } else {
                            res.json({
                                errorMessage: "email/password not a match"
                            });
                        }
                    });
            })
            .catch(err => {
                res.json("email/password not a match");
                console.log(
                    "error in post /Login",
                    err,
                    "cookies are: ",
                    req.session
                );
            });
    }
});

// user
app.get("/user", (req, res) => {
    db.getProfileInfo(req.session.user.id).then(data => {
        var imageUrl;
        if (data.imageurl) {
            imageUrl = config.s3Url + data.imageurl;
        }
        res.json({
            first: data.first,
            last: data.last,
            email: data.email,
            imageUrl: imageUrl,
            bio: data.bio
        });
    });
});

app.post("/pic-upload", uploader.single("file"), (req, res) => {
    if (req.file) {
        console.log("Uploading some pics");
        s3
            .uploadToS3(req.file)
            .then(() => {
                return db.updateProfilePic(
                    req.file.filename,
                    req.session.user.id
                );
            })
            .then(image => {
                res.json({
                    success: true,
                    imageUrl: config.s3Url + req.file.filename
                });
            })
            .catch(err => {
                console.log("error on upload", err);
            });
    } else {
        res.json({ success: false, message: "Failed to Upload" });
    }
});

// UPDATE BIO
app.post("/updateBio", (req, res) => {
    db
        .updateUserBio(req.body.bio, req.session.user.id)
        .then(results => {
            res.json({
                success: true
            });
        })
        .catch(err => {
            console.log(
                "There was an erro with app post submit-bio in index.js",
                err
            );
            res.json({
                success: false
            });
        });
});

//OTHER USERS PROFILE PAGE ROUTE
app.get("/user/info/:id", (req, res) => {
    //DO NOT USE THE SAME PATH - will sk
    const otherUserId = req.params.id;
    db
        .getUserInfoById(otherUserId)
        .then(data => {
            if (data.imageUrl == null) {
                data.imageUrl = "./public/default.png";
            } else {
                data.imageUrl = config.s3Url + data.imageUrl;
            }
            res.json({
                sucess: true,
                imageUrl: data.imageUrl,
                first: data.first,
                last: data.last,
                bio: data.bio
            });
        })
        .catch(err => {
            console.log("An err in getting other user id", err);
        });
});

//ROUTER FOR GETTING THE RELSTATUS:
app.post("/getRelStatus", (req, res) => {
    //get userid of whose profile we want to see
    const user1_id = req.session.user.id;
    const user2_id = req.body.userId;
    let relStatus;
    console.log(user1_id, user2_id);
    //in first query check logged in user id with user1_id, indirectly checking whether
    //the logged in person sent the friend request to this other user or not
    db.sendRequestStatus(user1_id, user2_id).then(result => {
        console.log(result);
        if (!result) {
            relStatus = "none";
            res.json({
                status: relStatus
            });
        } else {
            if (result.curr_status == 1) {
                console.log("pending");
                relStatus = "pending";
                res.json({
                    status: relStatus,
                    user2_id: result.user2_id
                });
            } else {
                if (result.curr_status == 2) {
                    console.log("accepted");
                    res.json({
                        status: "accept"
                    });
                } else {
                    if (result.curr_status == 3) {
                        console.log("cancel");
                        res.json({
                            status: "none"
                        });
                    }
                }
            }
        }
    });
});
//END OF POST ROUTER FOR GETTING THE RELATION STATUS

//ROUTER FOR GETTING THE CHANGE RELATION STATUS:
app.post("/changeRelStatus", (req, res) => {
    const { action, userId } = req.body;
    const user1_id = req.session.user.id;
    const user2_id = userId;
    let relStatus;
    if (action === "send") {
        //insert new row with status pending
        db.addFriendReq(user1_id, user2_id, 1).then(result => {
            res.json({
                success: true,
                relStatus: "pending"
            });
        });
        console.log(action);
    } else if (action === "cancel") {
        //delete exist row
        db.cancelFriendReq(user1_id, user2_id).then(result => {
            res.json({
                success: true,
                relStatus: "cancel"
            });
        });
    } else if (action == "accept") {
        //update status to friends
        db.acceptFriendReq(user1_id, user2_id, 2).then(result => {
            res.json({
                success: true,
                relStatus: "friends"
            });
        });
    } else if (action == "unfriend") {
        //in case of unfriend there the query differs because the query depends on who initiated the friendship
        //because the one who initiated has his id stored in user1_id coloumn and hence the where clause will thus differ
        db.deleteFriend(user1_id, user2_id).then(result => {
            res.json({
                success: true
            });
        });
    }
});

//ACTIONS ROUTING:

/*app.get('/getfriendrequests', (req, res) => {
    let userId = req.session.user.id
    //console.log('app.get /friends');
    db.getFriends(userId).then((results) => {
        //console.log('get friends for page || index.js', results)
        res.json({
            success : true,
            data: results
        })
    }).catch(err => { console.log('Error in index.js app.get friends line 323 ', err) })
})
*/

app.get("/getfriends", (req, res) => {
    let userId = req.session.user.id;
    console.log("CHECKING GETFRIENDS ROUTE", userId);
    db.getFriends(userId).then(result => {
        console.log("getFriends FROM DB:", result);
        response.json({
            friends: result
        });
    });
});
/*
app.get('/getfriendrequests', (req, res) => {
    let userId = req.session.user.id;
    db.getFriendRequests(userId).then((result) => {
        console.log("friend requests", result);
        response.json({
            friendRequests: result // go to reducers/reducers_friends.js
        })
    })
})
*/

/*
app.post('/unfriend', (request, response) => {
    const { userid } = request.body; // this userid is from the person we want to unfriend.
    console.log(userid);
    let params = [request.session.user.id, userid];
    let q = "DELETE FROM friends WHERE (user1_id = $1 AND user2_id = $2) OR (user2_id = $1 AND user1_id = $2)";
    db.query(q, params).then((data) => {
        getFriends(request.session.user.id).then((result) => { // once the user is deleted we call the function getFriends again!
            // now that we had deleted the row please send me my new friend, so that I can change the redux store, in order to change the data!
            console.log('friends are ', result);
            response.json({
                friends: result
            })
        })
    })
})

app.post('/acceptRequest', (request, response) => {
    let friends= [];
    let friendRequests = [];
    const { userid } = request.body;
    console.log(userid);
    let params = [request.session.user.id , userid, "friends"];
    let q = "UPDATE friends SET curr_status = $3 WHERE user1_id = $2 AND user2_id = $1";
    db.query(q, params).then((result) => {
        getFriends(request.session.user.id).then((result) => {
            friends = result;
            getFriendRequests(request.session.user.id).then((result) => {
                friendRequests = result;
                response.json({
                    friends : friends,
                    friendRequests : friendRequests
                })
            })
        })
    })
})
*/

//LOG OUT OF HEREEEE
app.get("/logout", function(req, res) {
    req.session.user = null;
    res.redirect("/");
});

//ROUTER GET
app.get("*", function(req, res) {
    //catch all paths
    if (!req.session.user) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.listen(process.env.PORT || 8080, () =>
    console.log(`I'm listening on 8080.`)
);
