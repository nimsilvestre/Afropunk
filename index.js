const express = require("express");
const app = express();
const compression = require("compression");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

// db
const db = require('./db.js');

//cookieSession
app.use(cookieParser());
app.use(cookieSession({
    secret: 'Top-secret secret',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

//Body-Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

// ====== CODE TO CHECK IF WE ARE IN DEVELOPMEMT (BUNDLE.JS) ======
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
        console.log("error in post /register", err, "cookies are: ", req.session);
        res.json({success: false});
    });
});

//USER ROUTE
/*app.get('/user', (req, res) => {
    req.session.user = {
        id: id,
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
        image: req.body.image,
        bio: req.body.bio

        if (req.session.user) {
            res.json()
        }
    };
});
*/


app.get("*", function(req, res) {
    //will redirect ANY URL TO THE WELCOME PAGE
    res.sendFile(__dirname + "/index.html");
});

app.listen(8080, function() {
    console.log("I'm listening.");
});
