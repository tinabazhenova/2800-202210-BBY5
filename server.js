var util = require('util');
var encoder = new util.TextEncoder('utf-8');
const express = require("express");
const session = require("express-session");
const app = express();
const bodyparser = require('body-parser');
const multer = require('multer');
const path = require('path');
const ejs = require("ejs");
const fs = require("fs");
const { JSDOM } = require('jsdom');
const { BlockList } = require("net");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let rooms = [];

io.on("connection", socket => {
    console.log(socket.id + " socket connection successful");
    socket.on("joinRoom", (code, game) => {
        if (rooms.some(r => r.code == code)) {
            console.log(socket.id + " joined room " + code);
            socket.join(code);
        } else {
            console.log("room " + code + " created");
            rooms.push({
                "code": code,
                "users": [socket.id],
                "game": game
            });
            console.log(socket.id + " joined room " + code);
            socket.join(code);
        }
    });
    socket.on("sendMessage", (message, room) => {
        socket.to(room).emit("readMessage", message);
    });
});

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/imgs/")
    },
    filename: function(req, file, callback) {
        callback(null, "my-app-" + file.originalname.split('/').pop().trim());
    }
});
const upload = multer({ storage: storage });


app.set("view engine", "ejs");
// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/imgs", express.static("./public/imgs"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));
// body-parser middleware use
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: false,
    // create a unique identifier for that client
    saveUninitialized: true
}));


app.get("/", function(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/main");
    } else {

        let doc = fs.readFileSync("./app/html/index.html", "utf8");
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(doc);
    }
});

const mysql = require("mysql2");
const { runInNewContext } = require("vm");
const { redirect } = require("express/lib/response");
const res = require("express/lib/response");
const connection = mysql.createConnection({
    host: "10.27.240.3",
    port: 3306,
    user: "root",
    password: "",
    database: "COMP2800"
});

const userTable = 'BBY_5_user';


function wrap(filename, session) {
    let template = fs.readFileSync("./app/html/template.html", "utf8");
    let dom = new JSDOM(template);
    dom.window.document.getElementById("templateContent").innerHTML = fs.readFileSync(filename, "utf8");
    if (session.username == null) {
        dom.window.document.getElementById("name").innerHTML = "Guest";
    } else {
        dom.window.document.getElementById("name").innerHTML = session.username;
    }

    return dom;
}

app.get("/wordguess", function(req, res) {
    if (req.session.loggedIn) {
        let dom = wrap("./app/html/wordguess.html", req.session);
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
        let mainDOM = wrap("./app/html/main.html", req.session);
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(mainDOM.serialize());
    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

app.get("/admin", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn && req.session.isAdmin) {

        let main = fs.readFileSync("./app/html/admin.html", "utf8");
        let mainDOM = new JSDOM(main);

        connection.query(`SELECT * FROM ${userTable} WHERE ${userTable}.first_name = '${req.session.username}'`, function(error, results) {
            console.log(error);
            console.log(results);
            // great time to get the user's data and put it into the page!
            mainDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Admin Page";

            res.set("Server", "Wazubi Engine");
            res.set("X-Powered-By", "Wazubi");
            res.send(mainDOM.serialize());
        });


    } else {
        // not admin - no session and no access, redirect to home!
        res.redirect("/");
        //res.send({ status: "fail", msg: "Access is denied." });
    }

});

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
            req.session.userID = results[0].ID;
            req.session.username = results[0].first_name;
            req.session.isAdmin = results[0].is_admin;
            req.session.userImage = results[0].user_image;
            req.session.pass = results[0].password;
            req.session.save(function(err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        }

    });
});

app.post("/guest_login", function(req, res) {
    req.session.loggedIn = true;
    res.send({});
});
// Notice that this is a "POST"
app.post("/loginAsAdmin", function(req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.username, req.body.password);
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function(error, results) {
        console.log(req, results);
        if (error || !results || !results.length) {
            res.send({ status: "fail", msg: "User account not found." });
            console.log(error);
        } else if (!results[0].is_admin) {
            res.send({ status: "fail", msg: "User is not admin." });
            console.log(error);
        } else {
            // user authenticated, create a session
            req.session.loggedIn = true;
            req.session.lastname = results[0].last_name;
            req.session.name = results[0].user_name;
            req.session.userID = results[0].ID;
            req.session.username = results[0].first_name;
            req.session.isAdmin = results[0].is_admin;
            req.session.userImage = results[0].user_image;
            req.session.pass = results[0].password;
            req.session.save(function(err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        }

    });
});

app.post('/upload', upload.single("image"), function(req, res) {
    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://127.0.0.1:8000/imgs/' + req.file.filename
        var insertData = `UPDATE ${userTable} SET user_image = ? WHERE ${userTable}.ID = '${req.session.userID}'`
        connection.query(insertData, [imgsrc], (err, result) => {
            if (err) throw err
            console.log("file uploaded")
            console.log(result)
        })
        req.session.userImage = imgsrc
        res.redirect("/profile")
    }
});

app.get("/profile", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn) {

        let profile = fs.readFileSync("./app/html/profile.html", "utf8");
        let profileDOM = new JSDOM(profile);
        console.log(profileDOM.window.document.getElementById("profile_name").innerHTML);

        profileDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Profile";
        profileDOM.window.document.getElementById("profile_name").innerHTML = "Welcome " + req.session.username;
        profileDOM.window.document.getElementById("picture_src").src = req.session.userImage;
        profileDOM.window.document.getElementById("user_name").innerHTML = req.session.name;
        profileDOM.window.document.getElementById("password").innerHTML = req.session.pass;

        console.log(req.session.username);

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(profileDOM.serialize());
    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

// we are changing stuff on the server!!!
app.post('/update-user', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.connect();
    console.log("update values", req.session.user, req.session.pass)
    connection.query(`UPDATE ${userTable} SET user_name = ? AND password = ? WHERE ID = ?`, [req.session.user, req.session.pass, req.session.userID],
        function(error, results, fields) {
            if (error) {
                console.log(error);
            }
            //console.log('Rows returned are: ', results);
            res.send({ status: "success", msg: "Record updated." });

        });
    connection.end();
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

app.get("/createLobby", (req, res) => {
    if (req.session.loggedIn) {
        res.setHeader("Content-Type", "application/json");
        res.send({ code: Math.floor((Math.random() * 1000)) });
    } else {
        res.redirect("/");
    }
});

app.post("/joinLobby", (req, res) => {
    if (req.session.loggedIn) {
        let code = req.body.code;
        let gameType = "";
        if (rooms.some(r => {
                gameType = r.game;
                return r.code == code
            })) {
            res.send({ found: true, game: gameType })
        } else {
            res.send({ found: false })
        }
    } else {
        res.redirect("/");
    }
});

// RUN SERVER
let port = 8080;
server.listen(port, function() {
    console.log("Listening on port " + port + "!");
});