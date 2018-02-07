const express = require("express");
const app = express();
const compression = require("compression");
const bodyParser = require('body-parser');
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
const db = require('./db.js');

//cookieSession
app.use(cookieParser());
app.use(cookieSession({
    secret: 'Muito secreto',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

//Body-Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

// csurf (add to client side!)
app.use(csurf());

app.use(function(req, res, next){
    res.cookie('mytoken', req.csrfToken());
    next();
});
//CODE TO CHECK IF WE ARE IN DEVELOPMEMT (BUNDLE.JS)
if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
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

    db.hashPassword(req.body.password).then((password) => {
        db.register(req.body.first, req.body.last, req.body.email, password).then((id) => {
            // set cookies on register
            req.session.user = {
                id: id,
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                password: req.body.password
            };
            res.json({success: true});
        });
    }).catch((err) => {
        req.session = null;
        console.log(req.session);
        res.json({success: false});
    });
});

//this is to make sure that logged out users cannot do anything if they are logged in
/*function requireUser(req, res, next) {
    if (!req.session.user) {
        res.sendStatus(403);
    } else {
        next();
    }
}
*/

//LOGIN ROUTE
app.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        // error: true;
        res.json('Error: Empty input');
    } else {
        //compare against email to  check get password
        db.getUserInfo(req.body.email).then((results) => {
            return db.checkPassword(req.body.password, results.password).then((match) => {
                if (match) {
                    //set cookies on login
                    req.session.user = {
                        id: results.id,
                        first: results.first,
                        last: results.last,
                        email: results.email,
                        bio: results.bio
                    };
                    res.json({success: true});
                } else {
                    res.json({errorMessage: 'email/password not a match'});
                }
            });

        }).catch((err) => {
            res.json('email/password not a match');
            console.log("error in post /register", err, "cookies are: ", req.session);
        });
    }
});


// user
app.get('/user', (req, res) => {
    db.getProfileInfo(req.session.user.id).then(data => {
        res.json({
            first: data.first,
            last: data.last,
            email: data.email,
            imageUrl: config.s3Url + data.imageurl,
            bio: data.bio
        });
    });
});


app.post('/pic-upload', uploader.single('file'), (req, res) => {
    if (req.file) {
        console.log('Uploading some pics');
        s3.uploadToS3(req.file)
            .then(() => {
                return db.updateProfilePic(req.file.filename, req.session.user.id);
            }).then((image) => {
                res.json({
                    success: true,
                    imageUrl: config.s3Url + req.file.filename
                });
            }).catch((err) => {
                console.log("error on upload",err);
            });
    } else {
        res.json({
            success: false,
            message: "Failed to Upload"});
    }
});

// UPDATE BIO
app.post('/updateBio', (req, res) => {
    db.updateBio(req.body.bio, req.session.user.id)
        .then(results => {
            res.json({
                success: true,
                bio: req.body.bio
            });
        });
});

/*
//OTHER USERS PROFILE PAGE ROUTE
app.get('/user/:id/info', requireUser, function () { //DO NOT USE THE SAME PATH - will sk
    if(req.params.id == req.session.user.id) {
        return res.json({
            redirect: true
        })
    }
    db.getUserInfoById(req.session.user.id) {
        //do somthing
    }
})
*/

//LOG OUT OF HEREEEE
app.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('/');
})


app.get("*", function(req, res) {  //catch all paths
    if (!req.session.user) {
        res.redirect('/welcome')
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.listen(8080, function() {
    console.log("I'm listening.");
});
