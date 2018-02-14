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
    db.updateBio(req.body.bio, req.session.user.id).then(results => {
        res.json({ success: true, bio: req.body.bio });
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
    const user2_id = req.params.id;
    let relStatus;
    //in first query check logged in user id with user1_id, indirectly checking whether
    //the logged in person sent the friend request to this other user or not
    db.sendRequestStatus(user1_id, user2_id, relStatus).then(result => {
        if (!result) {
            relStatus = "none";
            res.json({
                status: relStatus});
        } else {
            if (result.curr_status === "pending") {
                relStatus = "accept";
                res.json({
                    status: relStatus});
            } else {
                if ((relStatus = result.curr_status)) {
                    res.json({
                        status: relStatus});
                } else {
                    if ((relStatus = result.curr_status)) {
                        res.json({
                            status: relStatus
                        });
                    }
                }
            }
        }
    });
});
//END OF POST ROUTER FOR GETTING THE RELSTATUS

//ROUTER FOR GETTING THE CHANGERELSTATUS:
app.post("/changeRelStatus", (req, res) => {
    const {action, userId} = req.body;
    const user1_id = req.session.user.id;
    const user2_id = userId;
    let relStatus;
console.log(action);
    if (action === "send") {
        //insert new row with status pending
        db.addFriendReq( user1_id, user2_id, 1 ).then(result => {
            res.json({
                success: true,
                relStatus: "pending"
            });
        });
    } else if (action === "cancel") {
        //delete exist row
        db.cancelFriendReq(user1_id, user2_id).then(result => {
            res.json({
                success: true,
                relStatus: "cancel"
            });
        });
    } else if (action === "accept") {
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

app.listen(8080, function() {
    console.log("I'm listening.");
});
