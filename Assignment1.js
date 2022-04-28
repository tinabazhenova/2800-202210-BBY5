
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { JSDOM } = require('jsdom');
const { BlockList } = require("net");

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/imgs", express.static("./public/imgs"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));

app.use(session(
    {
        secret: "extra text that no one will guess",
        name: "wazaSessionID",
        resave: false,
        // create a unique identifier for that client
        saveUninitialized: true
    })
);


app.get("/", function (req, res) {

    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else {

        let doc = fs.readFileSync("./app/html/index.html", "utf8");

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(doc);
    }
});


app.get("/profile", function (req, res) {

    // check for a session first!
    if (req.session.loggedIn) {

        let profile = fs.readFileSync("./app/html/profile.html", "utf8");
        let profileDOM = new JSDOM(profile);

            // great time to get the user's data and put it into the page!
            profileDOM.window.document.getElementsByTagName("title")[0].innerHTML
                = req.session.name + "'s Profile";
            profileDOM.window.document.getElementById("profile_name").innerHTML
                = "Welcome back " + req.session.name;
            
            res.set("Server", "Wazubi Engine");
            res.set("X-Powered-By", "Wazubi");
            res.send(profileDOM.serialize());
 

    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Notice that this is a "POST"
app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.email, req.body.password);

        if (req.body.email == "test@bcit.ca" && req.body.password == "abc123") {
            // user authenticated, create a session
            req.session.loggedIn = true;
            req.session.email = "test@BlockList.ca";
            req.session.name = "Test";
            req.session.save(function (err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        } else {
            // server couldn't find that, so use AJAX response and inform
            // the user. when we get success, we will do a complete page
            // change. Ask why we would do this in lecture/lab :)
            res.send({ status: "fail", msg: "User account not found." });
        }
    });

app.get("/logout", function (req, res) {

    if (req.session) {
        req.session.destroy(function (error) {
            if (error) {
                res.status(400).send("Unable to log out")
            } else {
                // session deleted, redirect to home
                res.redirect("/");
            }
        });
    }
});


// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log("Listening on port " + port + "!");
});
