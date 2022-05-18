document.getElementById("start").onClick = () => startWordMatch();

function startWordMatch() {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          console.log(data);
          let genPhrase = document.getElementById("div3");
          //Answer phrase is placed in div3, answer meaning is placed randomly in div4-6
          let randomNumber = Math.floor((Math.random() * 3 + 4));
          console.log(randomNumber);
          let randomAnswerDiv = document.getElementById("div" + randomNumber);
          console.log(randomAnswerDiv);
          randomAnswerDiv.innerHTML = data.rows[0].meaning;
          genPhrase.innerHTML += data.rows[0].phrase;

          randomAnswerDiv.addEventListener("click", correctAnswer(randomAnswerDiv, data.rows[0]));

          // console.log(genPhrase, answer);

          // connection.connect();
          // connection.query('SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 3;',
          //   function (error, data, fields) {
          //     if (error) {
          //       console.log(error);
          //     }
          console.log('Rows returned are: ', data);

          // for each result after the first (first is the answer)
          for (j = 1; j < data.rows.length; j++) {
            console.log("row", data.rows);
            //if div is empty (has no answer) then a random meaning is placed there
            if (document.getElementById("div" + (j + 4)).innerHTML = "") {
              let i = document.getElementById("div" + (j + 4));
              i.innerHTML = data[j].meaning;
              
              i.addEventListener("click", wrongAnswer(i));
            }
          }
        } else {
          console.log("Error with for loop.");
        }
      } else {
        console.log(this.status);
      }
    } else {
      console.log("error", this.status);
    }
  };
  xhr.open("GET", "/get-phrase");
  xhr.send();

  // res.send({
  //   status: "success",
  //   rows: data
  // });
}
// connection.end();
startWordMatch();

// Need to add function to change CSS to green on correct guess, and add score to player's count
function correctAnswer(e, f) {
  e.classList.add('correct'); //add css for correct answer to change div background color to green

  let currentBBScore = 0;
  let currentXScore = 0;
  let currentYScore = 0;
  let currentZScore = 0;
  
  currentBBScore += f.bbvalue;
  currentXScore += f.xvalue;
  currentYScore += f.yvalue;
  currentZScore += f.zvalue;

  // Need to add more divs to the page
  document.getElementById("div9").innerHTML = "Current BB Points: " + currentBBScore;
  document.getElementById("div10").innerHTML = "Current X Points: " + currentXScore;
  document.getElementById("div11").innerHTML = "Current Y Points: " + currentYScore;
  document.getElementById("div12").innerHTML = "Current Z Points: " + currentZScore;
}

// Optional: add function to display history of the word after guessing 
// (something like "wrong answer"--> eventlistener on click --> remove "hide" class from history div
// add a div2.innerHTML = answer result[0].history)
function wrongAnswer(e) {
  i.classList.add('incorrect'); //add css for correct answer to change div background color to red
}

// not working code, first attempt:
// app.get("/wordmatch", function (req, res) {
//     // check for a session first!
//     if (req.session.loggedIn) {

//         let wordMatchPage = fs.readFileSync("./app/html/wordmatch.html", "utf8");
//         let wordMatchDOM = new JSDOM(wordMatchPage);

//         connection.execute(
//             "SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 1;",
//             //"TABLESAMPLE (10 PERCENT)" if we want to speed up the search with larger db, does not round up though
//             function (error, data, fields) {
//                 console.log("data: ", data);

//                 if (error) {
//                     console.log(error);
//                 }
//                 let wordMatchStart = data[0].phrase;
//                 connection.end();         
//             });

//         let display = wordMatchDOM.getElementById('div3');
//         display.innerHTML += data[0].phrase;

//         res.set("Server", "Wazubi Engine");
//         res.set("X-Powered-By", "Wazubi");
//         res.send(mainDOM.serialize());
//             // res.send(wordMatchStart);
//     } else {
//         // not logged in - no session and no access, redirect to home!
//         res.redirect("/");
//     }

// });

// Need to add function to play again
function nextQuestion() {
  // all this function does is remove hidden class from a "next question" button so it appears on the page. 
  // when clicked, it does startWordMatch() again
}

function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}