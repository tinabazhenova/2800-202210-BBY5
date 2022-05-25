let gameCount = 0;
let gamePlays = 5;

document.getElementById("start").onclick = () => {
  startGame();
};

function startGame() {
  console.log("gameCount is: " + gameCount);
  gameCount++;
  startWordMatch();
}

function finishGame() {
  console.log("BB Score is: " + currentBBScore);
  console.log("X Score is: " + currentXScore);
  console.log("Y Score is: " + currentYScore);
  console.log("Z Score is: " + currentZScore);
  document.getElementById("start").innerHTML = "Play Again";

  gameCount = 0;
  console.log("Game Count is: " + gameCount);
  document.getElementById("start").onclick = () => startGame();

  addUserPoints(currentBBScore, currentXScore, currentYScore, currentZScore);

  currentBBScore = 0;
  currentXScore = 0;
  currentYScore = 0;
  currentZScore = 0;

  document.getElementById("div9").innerHTML =
    "Current BB Points: " + currentBBScore;
  document.getElementById("div10").innerHTML =
    "Current X Points: " + currentXScore;
  document.getElementById("div11").innerHTML =
    "Current Y Points: " + currentYScore;
  document.getElementById("div12").innerHTML =
    "Current Z Points: " + currentZScore;
}

async function addUserPoints(bb, x, y, z) {
  try {
    let response = await fetch("/addUserPoints", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bb, x, y, z }),
    });
    let parsed = await response.json();
    if (parsed.approved) {
      console.log("User scores added!");
      console.log("body: " + body);
    } else {
      console.log("Error: " + error);
    }
  } catch (error) {
    console.log(error);
  }
}

function startWordMatch() {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {
      // 200 means everthing worked
      if (xhr.status === 200) {
        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          // console.log(data);

          document.getElementById("btn1").disabled = false;
          document.getElementById("btn2").disabled = false;
          document.getElementById("btn3").disabled = false;
          document.getElementById("btn4").disabled = false;

          //shows hidden answer divs and resets correct/incorrect values
          document
            .getElementById("btn1")
            .classList.remove("hide", "correct", "incorrect");
          document
            .getElementById("btn2")
            .classList.remove("hide", "correct", "incorrect");
          document
            .getElementById("btn3")
            .classList.remove("hide", "correct", "incorrect");
          document
            .getElementById("btn4")
            .classList.remove("hide", "correct", "incorrect");

          document.getElementById("start").classList.add("hide");

          //Question is placed in div4,
          document.getElementById("div4").classList.remove("hide");
          let genPhrase = document.getElementById("div4");
          genPhrase.innerHTML = "Guess this phrase: " + data.rows[0].phrase;

          // //Answer meaning is placed randomly in button 1-4
          let randomNumber = Math.floor(Math.random() * 4 + 1);
          let randomAnswerBtn = "";

          randomAnswerBtn = document.getElementById("btn" + randomNumber);
          console.log(randomAnswerBtn);
          randomAnswerBtn.innerHTML = data.rows[0].meaning;

          randomAnswerBtn.onclick = () => {
            correctAnswer(randomAnswerBtn, data.rows[0]);
          };

          // // for each result after the first (first is the answer)
          for (j = data.rows.length; j > 1; j--) {
            //if div is empty (has no answer) then a random meaning is placed there
            if (document.getElementById("btn" + (j - 1)) != randomAnswerBtn) {
              let i = document.getElementById("btn" + (j - 1));
              i.innerHTML = data.rows[j - 1].meaning;
              i.onclick = () => wrongAnswer(i);
            }
          }
        }
      } else {
        console.log(this.status);
      }
    } else {
      console.log("error", this.status);
    }
  };
  xhr.open("GET", "/startWordMatch");
  xhr.send();
}

let currentBBScore = 0;
let currentXScore = 0;
let currentYScore = 0;
let currentZScore = 0;

// function toggleExplanation() {
//   var popup = document.getElementById("explanation");
//   popup.classList.toggle("show");
// }

function correctAnswer(btnDiv, values) {
  btnDiv.classList.add("correct"); //adds css for correct answer to change div background color to green
  btnDiv.classList.remove("incorrect");
  btnDiv.classList.add("popup");


  document.getElementById("div9").classList.remove("hide");
  document.getElementById("div10").classList.remove("hide");
  document.getElementById("div11").classList.remove("hide");
  document.getElementById("div12").classList.remove("hide");

  if (values.generation == "B") {
    currentBBScore += values.value;
  }
  if (values.generation == "X") {
    currentXScore += values.value;
  }
  if (values.generation == "Y") {
    currentYScore += values.value;
  }
  if (values.generation == "Z") {
    currentZScore += values.value;
  }

  document.getElementById("div9").innerHTML =
    "Current BB Points: " + currentBBScore;
  document.getElementById("div10").innerHTML =
    "Current X Points: " + currentXScore;
  document.getElementById("div11").innerHTML =
    "Current Y Points: " + currentYScore;
  document.getElementById("div12").innerHTML =
    "Current Z Points: " + currentZScore;

  document.getElementById("btn1").disabled = true;
  document.getElementById("btn2").disabled = true;
  document.getElementById("btn3").disabled = true;
  document.getElementById("btn4").disabled = true;

  document.getElementById("start").classList.remove("hide");

  if (gameCount < gamePlays) {
    document.getElementById("start").innerHTML = "NEXT QUESTION";
    document.getElementById("start").onclick = () => startGame();
  } else {
    document.getElementById("start").innerHTML = "Collect Score";
    document.getElementById("start").onclick = () => finishGame();
  }
}

// Optional: add function to display history of the word after guessing

function wrongAnswer(e) {
  e.classList.add("incorrect"); //added css for correct answer to change div background color to red

  document.getElementById("btn1").disabled = true;
  document.getElementById("btn2").disabled = true;
  document.getElementById("btn3").disabled = true;
  document.getElementById("btn4").disabled = true;

  document.getElementById("start").classList.remove("hide");

  if (gameCount < gamePlays) {
    document.getElementById("start").innerHTML = "NEXT QUESTION";
    document.getElementById("start").onclick = () => startGame();
  } else {
    document.getElementById("start").innerHTML = "Collect Score";
    document.getElementById("start").onclick = () => finishGame();
  }
}

function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}
