const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { JSDOM } = require('jsdom');
const { BlockList } = require("net");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", socket => {
    console.log("socket connection was succcessful");
    socket.on('sendMessage', message => {
        socket.broadcast.emit("readMessage", message);
    });
});

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/imgs", express.static("./public/imgs"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));

app.use(session({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: false,
    // create a unique identifier for that client
    saveUninitialized: true
}));


app.get("/", function(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else {

        let doc = fs.readFileSync("./app/html/index.html", "utf8");

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(doc);
    }
});

const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb"
});

const userTable = 'user';
app.get("/profile", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn) {

        let profile = fs.readFileSync("./app/html/profile.html", "utf8");
        let profileDOM = new JSDOM(profile);

        connection.query(`SELECT * FROM ${userTable} WHERE ${userTable}.first_name = '${req.session.username}'`, function(error, results) {
            console.log(error);
            console.log(results);
            // great time to get the user's data and put it into the page!
            profileDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Profile";
            profileDOM.window.document.getElementById("profile_name").innerHTML = "Welcome back " + req.session.username;

            res.set("Server", "Wazubi Engine");
            res.set("X-Powered-By", "Wazubi");
            res.send(profileDOM.serialize());
        });


    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

function wrap(filename) {
    let template = fs.readFileSync("./app/html/template.html", "utf8");
    let lol = fs.readFileSync(filename, "utf8");
    let dom = new JSDOM(template);
    dom.window.document.getElementById("templateContent").innerHTML = lol;
    return dom;
}

app.get("/lol", function(req, res) {
    if (req.session.loggedIn) {

        let dom = wrap("./app/html/lol.html");
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(dom.serialize());


    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }
});

app.get("/main", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn) {

        let main = fs.readFileSync("./app/html/main.html", "utf8");
        let mainDOM = new JSDOM(main);

        connection.query(`SELECT * FROM ${userTable} WHERE ${userTable}.first_name = '${req.session.username}'`, function(error, results) {
            console.log(error);
            console.log(results);
            // great time to get the user's data and put it into the page!
            mainDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Profile";

            res.set("Server", "Wazubi Engine");
            res.set("X-Powered-By", "Wazubi");
            res.send(mainDOM.serialize());
        });


    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

app.get("/wordguess", function(req, res) {
    if (req.session.loggedIn) {

        let dom = wrap("./app/html/lol.html");
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(dom.serialize());


    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }
});

app.get("/main", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn) {

        let main = fs.readFileSync("./app/html/main.html", "utf8");
        let mainDOM = new JSDOM(main);

        connection.query(`SELECT * FROM ${userTable} WHERE ${userTable}.first_name = '${req.session.username}'`, function(error, results) {
            console.log(error);
            console.log(results);
            // great time to get the user's data and put it into the page!
            mainDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Profile";

            res.set("Server", "Wazubi Engine");
            res.set("X-Powered-By", "Wazubi");
            res.send(mainDOM.serialize());
        });


    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

// app.get("/wordguess", function(req, res) {
//     // check for a session first!
//     if (req.session.loggedIn) {

//         let wordguess = fs.readFileSync("./app/html/wordguess.html", "utf8");
//         let wordguessDOM = new JSDOM(wordguess);
//         res.set("Server", "Wazubi Engine");
//         res.set("X-Powered-By", "Wazubi");
//         res.send(wordguessDOM.serialize());

//     } else {
//         // not logged in - no session and no access, redirect to home!
//         res.redirect("/");
//     }

// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//connection.connect();

// Notice that this is a "POST"
app.post("/login", function(req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.username, req.body.password);
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function(error, results) {
        console.log(req, results);
        if (error || !results || !results.length) {
            res.send({ status: "fail", msg: "User account not found." });
            console.log(error);
        } else {
            // user authenticated, create a session
            req.session.loggedIn = true;
            req.session.lastname = results[0].last_name;
            req.session.name = results[0].user_name;
            req.session.userID = results[0].id;
            req.session.username = results[0].first_name;
            req.session.save(function(err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        }

    });
});

app.get("/logout", function(req, res) {

    if (req.session) {
        req.session.destroy(function(error) {
            if (error) {
                res.status(400).send("Unable to log out")
            } else {
                // session deleted, redirect to home
                res.redirect("/");
            }
        });
    }
});

app.get("/chat", function(req, res) {
    if (req.session.loggedIn) {

        let profile = fs.readFileSync("./app/html/chat.html", "utf8");
        let profileDOM = new JSDOM(profile);

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(profileDOM.serialize());
    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }
});

// RUN SERVER
let port = 8000;
server.listen(port, function() {
    console.log("Listening on port " + port + "!");
});