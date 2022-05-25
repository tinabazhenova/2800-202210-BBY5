var util = require('util');
var encoder = new util.TextEncoder('utf-8');
const express = require("express");
const session = require("express-session")({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: true,
    // create a unique identifier for that client
    saveUninitialized: true
});
const app = express();
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { BlockList } = require("net");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const moment = require("moment");
const schedule = require("node-schedule");
const EventEmitter = require('events');

const mysql = require("mysql2");
const { runInNewContext } = require("vm");
const { redirect } = require("express/lib/response");
const res = require("express/lib/response");
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "COMP2800"
});

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
    //socket.on functions are used to determine how to respond to upcoming messages
    socket.on("joinRoom", (code, game) => {
        /* socket.join() function is used to let users join a room
        Notice how socket.join() also creates a room
        This means rooms are not created - not by you - Socket will do the work for you */
        if (!rooms.some(r => r.code == code)) {
            rooms.push({
                "code": code,
                "users": [],
                "host": session.username,
                "game": game,
                "inGame": false
            });
        }
        socket.join(code);
        rooms[rooms.length - 1].users.push(session.username);
        // use emit() to send messages to clients. see the document for detials. 
        io.to(code).emit("updateUserlist", rooms[rooms.length - 1].users);
        io.to(code).emit("announceMessage", session.username + " joined the room.");
        // prints all recorded chat messages to the client
        connection.query(`SELECT * FROM BBY_5_chat WHERE room = ?`,
        [code], (error, results) => {
            if (error) console.log(error);
            results.forEach(m => socket.emit("postMessage", m.username + ": " + m.content, m.title));
        })
    });
    socket.on("preventDuplicates", (code) => {
        rooms.forEach(r => {
            if (r.code == code) io.to(r.code).emit("forceDisconnect", "You joined a room in another tab", session.username);
        });
    });
    socket.on("updateGameStatus", (code, isInGame) => {
        rooms.forEach(r => {
            if (r.code == code) r.inGame = isInGame;
        });
        io.to(code).emit("displayGameContainer", isInGame);
    });
    //receives a message from one client and sends it to all other clients so that everyone (in the same room) can see the message
    socket.on("sendMessage", (message, room) => {
        connection.query(`INSERT INTO BBY_5_chat VALUES (?, ?, ?, ?, ?)`,
        [null, session.username, session.title, message, room], (error) => {
            if (error) console.log(error);
            io.to(room).emit("postMessage", session.username + ": " + message, session.title);
        });
    });
    socket.on("sendWordguessAttempted", (results, room) => {
        io.to(room).emit("wordguessAttempted", results);
    });
    socket.on("sendWordguessResult", (guessed, word, room) => {
        io.to(room).emit("wordguessCompleted", guessed, word);
    });
    socket.on("sendWordmatchFetched", (results, room) => {
        io.to(room).emit("wordmatchFetched", results);
    });
    socket.on("sendWordmatchCorrect", (btnDiv, values, room) => {
        io.to(room).emit("wordmatchCorrect", btnDiv, values);
    });
    socket.on("sendWordmatchWrong", (e, room) => {
        io.to(room).emit("wordmatchWrong", e);
    });
    socket.on("sendWordmatchFinished", (results, room) => {
        io.to(room).emit("wordmatchFinished", results);
    });
    socket.on("disconnect", () => {
        /* I wish I could send the user's current room code as a parameter here but I can't
        so I had to iterating through the list of rooms to find the room the user was in */
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].users.includes(session.username)) {
                rooms[i].users.splice(rooms[i].users.indexOf(session.username), 1);
                io.to(rooms[i].code).emit("updateUserlist", rooms[i].users, rooms[i].host);
                io.to(rooms[i].code).emit("announceMessage", session.username + " left the room.");
                /* if the user (that just disconnected from socket) was the host of the room
                or the last user in that room, remove it from the list */
                if (rooms[i].host == session.username || rooms[i].users.length == 0) {
                    io.to(rooms[i].code).emit("forceDisconnect", "The host has left the room");
                    rooms.slice(i--, 1);
                }
            }
        }
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
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

app.use(session);
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

const userTable = 'BBY_5_user';
const itemTable = 'BBY_5_item';

function wrap(filename, session) {
    let template = fs.readFileSync("./app/html/template.html", "utf8");
    let dom = new JSDOM(template);
    dom.window.document.getElementById("templateContent").innerHTML = fs.readFileSync(filename, "utf8");
    dom.window.document.getElementById("name").innerHTML = "WELCOME " + session.username.toUpperCase();

  return dom;
}

function respondWithWord(guessWord, req, res) {
    let dom = wrap("./app/html/wordguess.html", req.session);
    let grid = dom.window.document.querySelector(".wordguess_grid");
    grid.setAttribute("word_length", guessWord.length);
    grid.setAttribute("guess_attempts", 5);
    res.send(dom.serialize());
}

let guessWord = null;
let crossword = null;

app.get("/wordguess", async function(req, res) {
    if (req.session.loggedIn) {
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");

        respondWithWord(guessWord.phrase, req, res);
    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }
});

function respondWithCrossword(crossword, req, res) {
    let dom = wrap("./app/html/crossword.html", req.session);
    let rect = dom.window.document.getElementById("box0");
    let grid = dom.window.document.getElementById("crossword0");
    let legendAcross = dom.window.document.getElementById("legendAcross");
    let legendDown = dom.window.document.getElementById("legendDown");
    let results = crossword.words;
    let w = crossword.width;
    let h = crossword.height;
    let legendNum = 0;

    let letters = new Array(w * h);
    for(let i = 0; i < results.length; ++i) {
        let col = results[i].col;
        let row = results[i].row_num;
        let vert = results[i].vertical;
        for(let j = 0; j < results[i].phrase.length; ++j) {
            let arrInd = row * w + col;
            if(letters[arrInd]) {
                let wasStarting = letters[arrInd].node.getAttribute("startingVert");
                if(j == 0 && (wasStarting == null || vert == 0) || wasStarting == null && vert == 0) {
                    letters[arrInd].node.setAttribute("vertical", vert);
                }
                if(letters[arrInd].letter !== results[i].phrase[j]) {
                    console.log("Malformed crossword at row " + row + ", col " + col);
                }
            } else {
                let newNodeContainer = rect.cloneNode(true);
                let newNode = newNodeContainer.getElementsByTagName("input")[0];
                let hintNum = newNodeContainer.getElementsByTagName("div")[0];
                letters[arrInd] = {letter: results[i].phrase[j], node: newNode, hintNumNode: hintNum};
                newNode.setAttribute("row", row);
                newNode.setAttribute("col", col);
                newNode.setAttribute("vertical", results[i].vertical);
                newNodeContainer.setAttribute("style", `grid-row: ${row + 1}; grid-column: ${col + 1};`);
                newNodeContainer.id = null;
                grid.appendChild(newNodeContainer);
            }
            if(j == 0) {
                letters[arrInd].node.setAttribute("startingVert", letters[arrInd].node.getAttribute("vertical", vert));
                if(letters[arrInd].legendNum == null) {
                    letters[arrInd].legendNum = ++legendNum;
                }
                let hint = dom.window.document.createElement("div");
                hint.innerHTML = legendNum + ". " + results[i].meaning;
                if(vert == 1) {
                    letters[arrInd].node.setAttribute("wordLenVert", results[i].phrase.length);
                    legendDown.appendChild(hint);
                }
                else {
                    letters[arrInd].node.setAttribute("wordLenHoriz", results[i].phrase.length);
                    legendAcross.appendChild(hint);
                }
                letters[arrInd].hintNumNode.classList.remove("hintNumInvis");
                letters[arrInd].hintNumNode.innerHTML = legendNum;
            }
            if(vert == 1) {
                letters[arrInd].node.setAttribute("wordIdVert", results[i].word_id);
                letters[arrInd].node.setAttribute("wordCoordVert", j);
            }
            else {
                letters[arrInd].node.setAttribute("wordIdHoriz", results[i].word_id);
                letters[arrInd].node.setAttribute("wordCoordHoriz", j);
            }
            if(results[i].vertical == 1) {
                row++;    
            } else {
                col++;
            }
        }
    }
    rect.remove();
    grid.setAttribute("style", `grid-template-columns: repeat(${w}, 1fr);`);

    rect.setAttribute("visible", false);
    res.send(dom.serialize());
}

function sanitizeWord(phrase) {
    return phrase.replace(/[\s`'-]/g, "").toUpperCase();
}

app.get("/crossword", function(req, res) {
    if (req.session.loggedIn) {
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        respondWithCrossword(crossword, req, res);
    } else {
        res.redirect("/");
    }
})

app.post("/try_crossword", function(req, res) {
    let word = req.body.word.toUpperCase();
    let word_id = parseInt(req.body.wordId);
    let correctWord = crossword.words[crossword.wordRecs[word_id]].phrase;
    let result = { match: word === correctWord };
    res.send(result);
})

app.post("/try_word", function(req, res) {
    let hardCodedWord = guessWord.phrase;
    let tempEnteredWord = req.body.word.toUpperCase();
    let checkResult = Array.apply(null, Array(hardCodedWord.length)).map(function(x, i) {
        let temp = tempEnteredWord[i];
        let result = 0;
        for (let j = 0; j < hardCodedWord.length; j++) {
            if (temp == hardCodedWord[j]) {
                if (i == j)
                    return 2;
                result = 1;
            }
        }
        return result;
    });
    let strictMatches = 0;
    for (let i = 0; i < checkResult.length; ++i)
        if (checkResult[i] == 2)
            strictMatches++;
    let result = { matches: checkResult, word: guessWord };
    if (strictMatches == hardCodedWord.length)
        result.meaning = guessWord.meaning;
    res.send(result);
})

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
            if (error) console.log(error);
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
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Notice that this is a "POST"
app.post("/login", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function(error, results) {
        if (error || !results || !results.length) {
            if (error) console.log(error);
            res.send({ status: "fail", msg: "User account not found." });
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
            req.session.title = results[0].title;
            req.session.isGuest = false;
            req.session.save((error) => {
                if (error) console.log(error);
            });

        // all we are doing as a server is telling the client that they
        // are logged in, it is up to them to switch to the profile page
        res.send({
          status: "success",
          msg: "Logged in.",
        });
      }
    }
  );
});

let guest = 10;
app.post("/guest_login", function(req, res) {
    req.session.loggedIn = true;
    req.session.isGuest = true;
    req.session.username = "Guest_" + (guest++);
    req.session.save((error) => {
        if (error) console.log(error);
    })
    res.send({});
});
// Notice that this is a "POST"
app.post("/loginAsAdmin", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    connection.query(` SELECT * FROM ${userTable} WHERE user_name = "${req.body.username}" AND password = "${req.body.password}" `, function(error, results) {
        if (error || !results || !results.length) {
            console.log(error);
            res.send({ status: "fail", msg: "User account not found." });
        } else if (!results[0].is_admin) {
            res.send({ status: "fail", msg: "User is not admin." });
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
            req.session.title = results[0].title;
            req.session.save((error) => {
                if (error) console.log(error);
            });

        // all we are doing as a server is telling the client that they
        // are logged in, it is up to them to switch to the profile page
        res.send({
          status: "success",
          msg: "Logged in.",
        });
      }
    }
  );
});

app.post('/upload', upload.single("image"), function(req, res) {
    if (!req.file) {
        console.log("No file uploaded");
    } else {
        console.log(req.file.filename);
        var imgsrc = 'http://127.0.0.1:8000/imgs/' + req.file.filename;
        var insertData = `UPDATE ${userTable} SET user_image = ? WHERE ${userTable}.ID = '${req.session.userID}'`;
        connection.query(insertData, [imgsrc], (err, result) => {
            if (err) throw err;
            console.log("File uploaded");
            console.log(result);
        });
        req.session.userImage = imgsrc;
        res.redirect("/profile");
    }
});

app.get("/profile", function(req, res) {
    // check for a session first!
    if (req.session.loggedIn && !req.session.isGuest) {

        let profileDOM = wrap("./app/html/profile.html",req.session);
        // let profile = fs.readFileSync("./app/html/profile.html", "utf8");
        // let profileDOM = new JSDOM(profile);
        console.log(profileDOM.window.document.getElementById("profile_name").innerHTML);

        profileDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.username + "'s Profile";
        // profileDOM.window.document.getElementById("profile_name").innerHTML = "Welcome " + req.session.username;
            if (req.session.name== "adult" && req.session.pass== "sk8terboi") {
                profileDOM.window.document.getElementById("picture_src").src = "/imgs/sk8rboi.jpg";
                profileDOM.window.document.querySelector(".banner").style.display = "block";
            } else if(req.session.userImage == "NULL") {
                profileDOM.window.document.getElementById("picture_src").src = "/imgs/dummy.jpg";
            } else {
                profileDOM.window.document.getElementById("picture_src").src = req.session.userImage;
            }
        
        profileDOM.window.document.getElementById("user_name").innerHTML = req.session.name;
        profileDOM.window.document.getElementById("password").innerHTML = req.session.pass;

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(profileDOM.serialize());
        
    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }
});

// we are changing stuff on the server!!!
app.post('/update-username', function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("username", req.body.user_name);
    console.log("user ID", req.session.userID);
    connection.query(`UPDATE ${userTable} SET user_name = ? WHERE ID = ?`, [req.body.user_name, req.session.userID],
        function(error, results, fields) {
            if (error) console.log(error);
            res.send({ status: "success", msg: "Record updated." });

        });
});

app.post('/update-password', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`UPDATE ${userTable} SET password = ? WHERE ID = ?`, [req.body.password, req.session.userID],
        function(error, results, fields) {
            if (error) console.log(error);
            res.send({ status: "success", msg: "Record updated." });

        });
    
});

app.post('/delete-image', function(req, res) {
    // res.setHeader('Content-Type', 'application/json');
    connection.query(`UPDATE  ${userTable} SET user_image = "NULL" WHERE ID = ?`, [req.session.userID],
        function(error, results, fields) {
            if (error) console.log(error);
            req.session.userImage = null;
            res.send({ status: "success", msg: "Record updated." });

        });

});

app.get('/get-username', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT user_name FROM ${userTable} WHERE ID = ? `, [req.session.userID],
        function(error, results, field) {
            if (error) console.log(error);
            req.session.name = results[0].user_name;
            res.send({ status: "success", username: results[0].user_name });
        }
    )
});

app.get('/get-password', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT password FROM ${userTable} WHERE ID = ? `, [req.session.userID],
        function(error, results, field) {
            if (error) console.log(error);
            req.session.pass = results[0].password;

            res.send({ status: "success", password: results[0].password });
        }
    )
});

app.get('/get-users', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`SELECT * FROM ${userTable} `,
        function(error, results, field) {
            if (error) console.log(error);
            res.send({ status: "success", rows: results });
        }
    )
});

app.post('/add-user', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`INSERT INTO ${userTable} (user_name, first_name, last_name, password, is_admin) values (?, ?, ?, ?, ?)`, [req.body.user_name, req.body.first_name, req.body.last_name, req.body.password, req.body.is_admin],
        function(error, results, fields) {
            if (error) console.log(error);
            res.send({ status: "success", msg: "Record added." });
        }
    )
});

app.post('/edit-user', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`UPDATE ${userTable} SET user_name = ?, first_name = ?, last_name = ?, password = ?, is_admin = ? WHERE ID = ?`, [req.body.user_name, req.body.first_name, req.body.last_name, req.body.password, req.body.is_admin, req.body.id],
        function(error, results, fields) {
            if (error) console.log(error);
            console.log('Rows returned are: ', results);
            res.send({ status: "success", msg: "Record edited." });
        }
    )
});

app.post('/delete-users', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    connection.query(`DELETE FROM ${userTable} WHERE (user_name) = ? `, [req.body.user_name],
        function(error, results, fields) {
            if (error) console.log(error);
            res.send({ status: "success", msg: "Record deleted." });
        }
    )

});

app.get("/logout", function (req, res) {
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        res.status(400).send("Unable to log out");
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
        while (rooms.some(r => r.code == newCode && rooms[i].users.length > 0)) {
            newCode = Math.floor((Math.random() * 900)) + 100;
        }
        // delete all chat record from that room and remove the room
        connection.query(`DELETE FROM BBY_5_chat WHERE room = ?`,
        [newCode], (error) => {
            if (error) console.log(error);
        });
        res.send({ code: newCode });
    } else {
        res.redirect("/");
    }
});

app.post("/joinLobby", (req, res) => {
    if (req.session.loggedIn) {
        let gameType = "";
        let isInGame = false;
        if (rooms.some(r => {
                gameType = r.game;
                isInGame = r.inGame;
                return r.code == req.body.code;
            })) {
                if (!isInGame) {
                    res.send({ approved: true, game: gameType })
                } else {
                    res.send({ approved: false, errorMessage: "The game is in progress" })
                }
        } else {
            res.send({ approved: false, errorMessage: "Room not found" });
        }
  } else {
    res.redirect("/");
  }
});

app.get("/wordmatch", function (req, res) {
  if (req.session.loggedIn) {
    let dom = wrap("./app/html/wordmatch.html", req.session);
    res.set("Server", "Wazubi Engine");
    res.set("X-Powered-By", "Wazubi");
    res.send(dom.serialize());
  } else {
    // not logged in - no session and no access, redirect to home!
    res.redirect("/");
  }
});

app.get("/startWordMatch", function (req, res) {
    connection.query(
      "SELECT * FROM BBY_5_master ORDER BY rand() LIMIT 5;",
      function (error, results, fields) {
        if (error) {
          console.log(error);
        }
        console.log("Rows returned are: ", results);
        res.send({
          status: "success",
          rows: results //data or rows?
        });
      }
    );
  });
  
app.post("/addUserPoints", function(req, res) {
    connection.query(`UPDATE BBY_5_user SET bbscore = bbscore + ?, xscore = xscore + ?, yscore = yscore + ?,
     zscore = zscore + ? WHERE ID = ?`,
    [req.body.bb, req.body.x, req.body.y, req.body.z, req.session.userID], (error, results) => {
        if (error) console.log(error);
    });
});

app.get("/shop", function(req, res) {
    if (req.session.loggedIn && !req.session.isGuest) {
        let dom = wrap("./app/html/shop.html", req.session);
        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(dom.serialize());
    } else {
        res.redirect("/");
    }
});

app.get("/getUserPoints", (req, res) => {
    connection.query(`SELECT bbscore, xscore, yscore, zscore FROM BBY_5_user WHERE ID = ?`,
    [req.session.userID], (error, results) => {
        if (error) console.log(error);
        res.send({ points: results[0] });
    });
});

app.get("/getShopItems", (req, res) => {
    connection.query(`SELECT * FROM ${itemTable}`, (error, results) => {
        if (error) console.log(error);
        res.send({ itemList: results });
    });
});

app.get("/getCartItems", (req, res) => {
    connection.query(`SELECT * FROM BBY_5_cart_item
    LEFT JOIN BBY_5_item ON BBY_5_item.ID = BBY_5_cart_item.item_ID
    WHERE BBY_5_cart_item.user_ID = ?;`,
    [req.session.userID], (error, results) => {
        if (error) console.log(error);
        res.send({ cartList: results });
    });
});

app.post("/addToCart", (req, res) => {
    connection.query(`INSERT INTO bby_5_cart_item VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
    [req.session.userID, req.body.itemID, req.body.quantity, req.body.quantity], (error, results) => {
        if (error) console.log(error);
    });
    res.send();
});

app.post("/removeFromCart", (req, res) => {
    connection.query(`DELETE FROM BBY_5_cart_item WHERE user_ID = ? AND item_ID = ?`,
    [req.session.userID, req.body.itemID], (error, results) => {
        if (error) console.log(error);
    });
    res.send();
});

app.post("/emptyCart", (req, res) => {
    connection.query(`DELETE FROM BBY_5_cart_item WHERE user_ID = ?`, [req.session.userID], (error, results) => {
        if (error) console.log(error);
    });
    res.send();
});

app.post("/purchaseCart", (req, res) => {
    connection.query(`SELECT bbscore, xscore, yscore, zscore FROM BBY_5_user WHERE ID = ?`,
    [req.session.userID], (error, results) => {
        if (error) console.log(error);
        if (results[0].bbscore < req.body.total.B) {
            res.send({ approved: false, errorMessage: "Not enough B-points!" });
        } else if (results[0].xscore < req.body.total.X) {
            res.send({ approved: false, errorMessage: "Not enough X-points!" });
        } else if (results[0].yscore < req.body.total.Y) {
            res.send({ approved: false, errorMessage: "Not enough Y-points!" });
        } else if (results[0].zscore < req.body.total.Z) {
            res.send({ approved: false, errorMessage: "Not enough Z-points!" });
        } else {
            connection.query(`SELECT * FROM bby_5_cart_item WHERE user_ID = ?`,
            [req.session.userID], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    if (results.length > 0) {
                        results.forEach(cartItem => {
                            connection.query(`INSERT INTO bby_5_has_item VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                            [req.session.userID, cartItem.item_ID, cartItem.quantity, cartItem.quantity], (error, results) => {
                                if (error) console.log(error);
                            });
                        });
                        connection.query(`UPDATE bby_5_user SET bbscore = bbscore - ?, xscore = xscore - ?, yscore = yscore - ?, zscore = zscore - ? WHERE ID = ?`,
                            [req.body.total.B, req.body.total.X, req.body.total.Y, req.body.total.Z, req.session.userID], (error, results) => {
                                if (error) console.log(error);
                            });
                        res.send({ approved: true });
                    } else {
                        res.send({ approved: false, errorMessage: "Cart is empty!" });
                    }
                }
            });
        }
    });
});

app.post("/shopCheat", (req, res) => {
    connection.query(`UPDATE bby_5_user SET bbscore = ?, xscore = ?, yscore = ?, zscore = ? WHERE ID = ?`,
    [10000, 10000, 10000, 10000, req.session.userID], (error) => {
        if (error) console.log(error);
    });
    res.send();
});

app.get("/getInventoryItems", (req, res) => {
    connection.query(`SELECT * FROM BBY_5_has_item
    LEFT JOIN BBY_5_item ON BBY_5_item.ID = BBY_5_has_item.item_ID
    WHERE BBY_5_has_item.user_ID = ?;`,
    [req.session.userID], (error, results) => {
        if (error) console.log(error);
        res.send({ itemList: results });
    });
});

app.post("/useItem", (req, res) => {
    let baseTitle;
    let baseLevel;
    switch (req.body.item.ID) {
        case 1:
            baseTitle = "Boomer";
            baseLevel = "bblevel";
            break;
        case 2:
            baseTitle = "Gen X";
            baseLevel = "xlevel";
            break;
        case 3:
            baseTitle = "Millennial";
            baseLevel = "ylevel";
            break;
        case 4:
            baseTitle = "Zoomer";
            baseLevel = "zlevel";
            break;
        default:
            console.log("Item ID not found: " + req.body.item.ID);
    }
    connection.query(`UPDATE bby_5_user SET ${baseLevel} = ${baseLevel} + 1 WHERE ID = ?`,
    [req.session.userID], (error) => {
        if (error) {
            console.log(error);
        }
        if (req.session.title.includes(baseTitle)) {
            let newTitle = `Lv. ${parseInt(req.session.title.substring(4)) + 1} ${baseTitle}`;
            connection.query(`UPDATE bby_5_user SET title = ? WHERE ID = ?`,
            [newTitle, req.session.userID], (error) => {
                    if (error) console.log(error);
                }
            );
            req.session.title = newTitle;
            req.session.save();
        }
    });
    connection.query(`UPDATE bby_5_has_item SET quantity = quantity - 1 WHERE user_ID = ? AND item_ID = ?`,
    [req.session.userID, req.body.item.ID], (error) => {
        if (error) console.log(error);
    });
    connection.query(`DELETE FROM bby_5_has_item WHERE user_ID = ? AND item_ID = ? AND quantity <= 0`,
    [req.session.userID, req.body.item.ID], (error) => {
        if (error) console.log(error);
    });
    res.send();
});

app.get("/getUserLevels", (req, res) => {
    connection.query(`SELECT bblevel, xlevel, ylevel, zlevel, title FROM BBY_5_user WHERE ID = ?;`,
    [req.session.userID], (error, results) => {
        if (error) console.log(error);
        res.send({ levels: results[0] });
    });
});

app.post("/setTitle", (req, res) => {
    connection.query(`UPDATE bby_5_user SET title = ? WHERE ID = ?`,
    [req.body.title, req.session.userID], (error) => {
        if (error) console.log(error);
    });
    req.session.title = req.body.title;
    res.send();
});

// RUN SERVER

let port = process.env.PORT || 8000;

function wordguessExpiry(prep, word_id, callback) {
    return function() {
      return callback(prep, word_id);
    }
}

const wordguessExpiryPeriod = 12;
const wordguessExpiryUnit = 'h';

class Preparation extends EventEmitter {
    performCrossword() {
        connection.query(`SELECT cr.word_id, cr.row_num, cr.col, cr.vertical, ma.phrase, ma.meaning FROM BBY_5_crossword as cr, BBY_5_master ma WHERE cr.word_id = ma.word_ID and crossword_id = 2`, (error, results) => {
            if (error || !results || !results.length) {
                console.log(error);
                // Need to handle errors properly
                let dom = wrap("./app/html/wordguess_wait.html", req.session);
                res.send(dom.serialize());

            } else {
                for(let i = 0; i < results.length; ++i) {
                    results[i].phrase = sanitizeWord(results[i].phrase);
                }
                let w = 0;
                let h = 0;
                for(let i = 0; i < results.length; ++i) {
                    let minw = results[i].col + (results[i].vertical === 1 ? 1 : results[i].phrase.length);
                    if(minw > w)
                        w = minw;
                    let minh = results[i].row_num + (results[i].vertical === 0 ? 1 : results[i].phrase.length);
                    if(minh > h)
                        h = minh;
                }
                
                results.sort(function(a, b) {
                    if(a.row_num == b.row_num)
                        return a.col - b.col;
                    return a.row_num - b.row_num;
                })
                let wordRecsById = {};
                for(let i = 0; i < results.length; ++i) {
                    wordRecsById[parseInt(results[i].word_id)] = i;
                }

                crossword = {words: results, wordRecs: wordRecsById, width: w, height: h};
                console.log("Crossword prepared")
                this.emit("crosswordPrepared");
            }
        });
    }

    performWordguess() {
        connection.query(`SELECT wg.word_id, start_time, phrase, meaning, value, generation FROM BBY_5_wordguess as wg, BBY_5_master as master where wg.word_id = master.word_id order by start_time desc limit 1`, (error, results) => {
            if (error || !results) {
                if (error) console.log(error);
            } else
            if (results.length) {
                let startDate = new Date(results[0].start_time);
                results[0].start_date = startDate;
                let expiryMoment = moment(startDate).add(wordguessExpiryPeriod, wordguessExpiryUnit);
                let expiry = expiryMoment.toDate();
                let nowMoment = moment(new Date());
                let now = nowMoment.toDate();
                if(now.getTime() >= expiry.getTime()) {
                    this.emit("wordguessCreateAndLaunch", results[0].word_id);
                } else {
                    this.beforeReady(results[0]);
                    this.emit("ready", results[0]);
                }
            } else {
                this.emit("wordguessCreateAndLaunch", 0);
            }
        });
    }

    beforeReady(result) {
        result.phrase = sanitizeWord(result.phrase);
        guessWord = result;
        console.log("Wordguess today: " + guessWord.phrase);
        this.launchScheduler(result);
    }

    launchScheduler(result) {
        let expiryMoment = moment(result.start_date).add(wordguessExpiryPeriod, wordguessExpiryUnit);
        let expiry = expiryMoment.toDate();
        let nowMoment = moment(new Date());
        // let now = nowMoment.toDate();
        let diff = expiryMoment.diff(nowMoment, 'seconds');
        console.log("Planning wordguess expiry later in " + diff + " seconds at " + expiry);
        var schJob = schedule.scheduleJob(expiry, wordguessExpiry(this, result.word_id, function(prep, word_id){
            console.log("Scheduled wordguess expiry was triggered");
            prep.emit("wordguessUpdate", word_id);
        }));
    }

    updateWordguess(word_id, launchAfter) {
        connection.query(`SELECT word_id, phrase, meaning FROM BBY_5_master WHERE word_id > ${word_id} order by word_id asc limit 1`, (error, results) => {
            if (error || !results || !results.length) {
                console.log("Failed to update wordguess");
                if (error)
                    console.log(error);
            } else {
                this.emit("selectedNewGuessWord", results[0], launchAfter);
            }
        });
    }

    insertWordguess(result, launchAfter) {
        let thisDate = new Date();
        let thisMoment = moment(thisDate).format("YYYY-MM-DD HH:mm:ss");
        console.log("Selected new guessWord, passing result " + result.phrase);
        console.log("launchAfter: " + launchAfter);
        result.start_date = thisDate;
        connection.query(`INSERT into BBY_5_wordguess (word_id, start_time) values (${result.word_id}, "${thisMoment}")`, (error, results, fields) => {
            if (error) {
                console.log("Failed to insert new wordguess into the DB: " + error);
            } else {
                this.beforeReady(result);
                if(launchAfter) {
                    this.emit("ready", result);
                }
            }
        });
    }
}

let prep = new Preparation();
prep.on("crosswordPrepared", () => {
    prep.performWordguess();
});
prep.on("ready", function(result) {
    server.listen(port, function() {
        console.log("Listening on port " + port + "!");
    });
});
prep.on("wordguessCreateAndLaunch", function(word_id) {
    console.log("wordguessCreateAndLaunch");
    prep.updateWordguess(word_id, true);
});
prep.on("wordguessUpdate", function(word_id) {
    console.log("wordguessUpdate");
    prep.updateWordguess(word_id, false);
});
prep.on("selectedNewGuessWord", function(result, launchAfter) {
    console.log("wordguessUpdate");
    prep.insertWordguess(result, launchAfter);
});
prep.performCrossword();
