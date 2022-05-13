
// May not work asynchronously with getPhrase(). Might need to add promise or await function
function startWordMatch() {

  const mysql = require("mysql2");
  // const {
  //   runInNewContext
  // } = require("vm");
  // const {
  //   redirect
  // } = require("express/lib/response");
  // const res = require("express/lib/response");
 
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "COMP2800"
  });

  connection.connect();
  connection.query('SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 3;',
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      console.log('Rows returned are: ', results);

      for (j = 0; j < results.length; j++) {
        //if (element is empty)
        document.getElementById("div" + (j + 4)).innerHTML = results[j].meaning;
        results[j].addEventListener("click", guessMeaning());
      }

      res.send({
        status: "success",
        rows: results
      });


    });
  connection.end();
}

startWordMatch();

// function getPhrase() {
//   const genPhrase = document.getElementById("div3")
//   const answer = document.getElementById("div" + Math.random() * 3 + 4)
//   connection.connect();
//   connection.query('SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 1;'),
//     function (error, results, fields) {
//       if (error) {
//         console.log(error);
//       }
//       genPhrase.innerHTML += results[0].phrase;


//     }
// }
// getPhrase()

// Need to add function to change CSS to green on correct guess, and add score to player's count
function guessMeaning() {

}

// Need to add function to play again

// Optional: add function to display history of the word after guessing

// app.get("/wordmatch", function (req, res) {
//     // check for a session first!
//     if (req.session.loggedIn) {

//         let wordMatchPage = fs.readFileSync("./app/html/wordmatch.html", "utf8");
//         let wordMatchDOM = new JSDOM(wordMatchPage);

//         connection.execute(
//             "SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 1;",
//             //"TABLESAMPLE (10 PERCENT)" if we want to speed up the search with larger db, does not round up though
//             function (error, results, fields) {
//                 console.log("results: ", results);

//                 if (error) {
//                     console.log(error);
//                 }
//                 let wordMatchStart = results[0].phrase;
//                 connection.end();         
//             });

//         let display = wordMatchDOM.getElementById('div3');
//         display.innerHTML += results[0].phrase;

//         res.set("Server", "Wazubi Engine");
//         res.set("X-Powered-By", "Wazubi");
//         res.send(mainDOM.serialize());
//             // res.send(wordMatchStart);
//     } else {
//         // not logged in - no session and no access, redirect to home!
//         res.redirect("/");
//     }

// });

function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}