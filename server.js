const express = require("express");
const session = require("express-session")({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: true,
    // create a unique identifier for that client
    saveUninitialized: true
});
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

app.use(session);

//Socket part
let rooms = [];
const sharedsession = require("express-socket.io-session");
io.use(sharedsession(session)); 
io.on("connection", socket => {
    var session = socket.handshake.session;
    console.log(session.username + " socket connection successful");
    //socket.on functions are used to determine how to respond to upcoming messages
    socket.on("joinRoom", (code, game) => {
        /* socket.join() function is used to let users join a room
        Notice how socket.join() also creates a room
        This means rooms are not created by you - Socket will do the work for you */
        if (!rooms.some(r => r.code == code)) {
            rooms.push({
                "code" : code,
                "users" : [],
                "game" : game
            });
        }
        socket.join(code);
        rooms[rooms.length - 1].users.push(session.username);
        // use emit() to send messages to clients. see the document for detials. 
        io.to(code).emit("updateUserlist", rooms[rooms.length - 1].users);
        io.to(code).emit("announceMessage", session.username + " joined the room.");
    });
    //receives a message from one client and sends it to all other clients so that everyone (in the same room) can see the message
    socket.on("sendMessage", (message, room) => {
        io.to(room).emit("postMessage", message);
    });
    socket.on("disconnect", () => {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].users.includes(session.username)) {
                rooms[i].users.splice(rooms[i].users.indexOf(session.username), 1);
                if (rooms[i].users.length == 0) {
                    console.log("Room " + rooms[i].code + " was removed");
                    rooms.splice(i, 1);
                    i--;
                } else {
                    io.to(rooms[i].code).emit("updateUserlist", rooms[rooms.length - 1].users);
                    io.to(rooms[i].code).emit("announceMessage", session.username + " left the room.");
                }
            }
        }
    });
});

app.get("/", function (req, res) {

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
    host: "localhost",
    user: "root",
    password: "",
    database: "COMP2800"
});

const userTable = 'BBY_5_user';
const itemTable = 'BBY_5_item';

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

app.get("/wordguess", function (req, res) {
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

app.get("/main", function (req, res) {
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

app.get("/admin", function (req, res) {
    // check for a session first!
    if (req.session.loggedIn && req.session.isAdmin) {

        let main = fs.readFileSync("./app/html/admin.html", "utf8");
        let mainDOM = new JSDOM(main);

        connection.query(`SELECT * FROM ${userTable} WHERE ${userTable}.first_name = "${req.session.username}"`, function(error, results) {
            console.log(error);
            console.log(results);
            // great time to get the user's data and put it into the page!
            mainDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Admin Page";
            mainDOM.window.document.getElementById("profile_name").innerHTML = "Welcome Admin " + req.session.username;

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
app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.username, req.body.password);
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function(error, results) {
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
            req.session.save(function (err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        }

    });
});

app.post("/guest_login", function (req, res) {
    req.session.loggedIn = true;
    res.send({});
});
// Notice that this is a "POST"
app.post("/loginAsAdmin", function (req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.username, req.body.password);
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function (error, results) {
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
            req.session.save(function (err) {
                // session saved. For analytics, we could record this in a DB
            });

            // all we are doing as a server is telling the client that they
            // are logged in, it is up to them to switch to the profile page
            res.send({ status: "success", msg: "Logged in." });
        }

    });
});

app.post('/upload', upload.single("image"), function (req, res) {
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

app.get("/profile", function (req, res) {
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

// we are changing stuff on the server!!!
app.post('/update-username', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("username", req.body.user_name);
    //connection.connect();
    console.log("user ID", req.session.userID);
    connection.query(`UPDATE ${userTable} SET user_name = ? WHERE ID = ?`,
          [req.body.user_name, req.session.userID],
          function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({ status: "success", msg: "Record updated." });

    });
    //connection.end();
});

app.post('/update-password', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("password", req.body.password);
    //connection.connect();
    console.log("user ID", req.session.userID);
    connection.query(`UPDATE ${userTable} SET password = ? WHERE ID = ?`,
          [req.body.password, req.session.userID],
          function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({ status: "success", msg: "Record updated." });

    });
    //connection.end();
});

app.get('/get-username', function (req, res){
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT user_name FROM ${userTable} WHERE ID = ? `, [req.session.userID],
    function (error, results, field){
        if (error) {
            console.log(error);
        }
        req.session.name = results[0].user_name;
        res.send({ status: "success", username: results[0].user_name});   
    }
    )
});

app.get('/get-password', function (req, res){
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT password FROM ${userTable} WHERE ID = ? `, [req.session.userID],
    function (error, results, field){
        if (error) {
            console.log(error);
        }
        req.session.pass = results[0].password;
        
        res.send({ status: "success", password: results[0].password});   
    }
    )
});

app.get('/get-users', function (req, res){
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT * FROM ${userTable} `,
    function (error, results, field){
        if (error) {
            console.log(error);
        }
        // req.session.name = results[0].user_name;
        res.send({ status: "success", rows: results});   
    }
    )
});

app.post('/add-user' , function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`INSERT INTO ${userTable} (user_name, first_name, last_name, password, is_admin) values (?, ?, ?, ?, ?)`,
            [req.body.user_name, req.body.first_name, req.body.last_name, req.body.password, req.body.is_admin],
            function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        //console.log('Rows returned are: ', results);
        res.send({ status: "success", msg: "Record added." });
    }
    )
});

app.post('/edit-user' , function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`UPDATE ${userTable} SET user_name = ?, first_name = ?, last_name = ?, password = ?, is_admin = ? WHERE ID = ?`,
            [req.body.user_name, req.body.first_name, req.body.last_name, req.body.password, req.body.is_admin, req.body.id],
            function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log('Rows returned are: ', results);
        res.send({ status: "success", msg: "Record edited." });
    }
    )
});

app.post('/delete-users' , function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`DELETE FROM ${userTable} WHERE (user_name) = ? `,
    [req.body.user_name],
    function (error, results, fields) {
if (error) {
    console.log(error);
}
//console.log('Rows returned are: ', results);
res.send({ status: "success", msg: "Record deleted." });
}
)

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
        let newCode = Math.floor((Math.random() * 900)) + 100;
        while (rooms.some(r => r.code = newCode)) {
            newCode = Math.floor((Math.random() * 900)) + 100;
        }
        res.send({ code: newCode });
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

app.get("/shop", function(req, res) {
    if (req.session.loggedIn) {
        let dom = wrap("./app/html/shop.html", req.session);
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(dom.serialize());
    } else {
        res.redirect("/");
    }
});

app.get("/getShopItems", (req, res) => {
    connection.query(`SELECT * FROM ${itemTable}`, (error, results) => {
        if (error) console.log(error);
        res.send({ itemList: results });
    });
});

app.get("/getCartItems", (req, res) => {
    connection.query(`SELECT * FROM ${itemTable} WHERE ID IN (SELECT item_ID FROM BBY_5_cart_item WHERE user_ID = ?);`, [req.session.userID], (error, results) => {
        if (error) console.log(error);
        res.send({ cartList: results });
    });
});

app.post("/shopItem", (req, res) => {
    connection.query(`SELECT * FROM BBY_5_cart_item WHERE user_ID = ? AND item_ID = ?;`, [req.session.userID, req.body.itemID], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length == 0) {
                connection.query(`INSERT INTO BBY_5_cart_item (ID, user_ID, item_ID, quantity) VALUES (?, ?, ?, ?);`,
                [null, req.session.userID, req.body.itemID, 1], (error, results) => {
                    if (error) console.log(error);
                });
            } else {
                connection.query(`UPDATE BBY_5_cart_item SET quantity = quantity + ? WHERE user_ID = ? AND item_ID = ?;`,
                [req.body.quantity, req.session.userID, req.body.itemID], (error, results) => {
                    if (error) console.log(error);
                });
            }
        }
    });
    res.send();
});

app.post("/emptyCart", (req, res) => {
    connection.query(`DELETE FROM BBY_5_cart_item WHERE user_ID = ?`, [req.session.userID], (error, results) => {
        if (error) console.log(error);
    });
    res.send();
});

app.post("/removeItemFromCart", (req, res) => {
    connection.query(`DELETE FROM BBY_5_cart_item WHERE user_ID = ? AND item_ID = ?`, [req.session.userID, req.body.itemID], (error, results) => {
        if (error) console.log(error);
    });
    res.send();
});

// RUN SERVER
let port = 8000;
server.listen(port, function () {
    console.log("Listening on port " + port + "!");
});