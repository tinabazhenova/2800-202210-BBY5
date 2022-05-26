let gameCount = 0;
let gamePlays = 2;

let currentBBScore = 0;
let currentXScore = 0;
let currentYScore = 0;
let currentZScore = 0;

socket.on("displayGameContainer", (display) => {
  if (display){
    document.getElementById("startGame").style.display = "none";
    document.getElementById("gameContainer").style.display = "grid";
    startWordMatch();
  } else {
    document.getElementById("resultsContainer").classList.add("hide");
    document.getElementById("startGame").style.display = "inline-block";
    document.getElementById("gameContainer").style.display = "none";
  }
});

socket.on("sendWordmatchCorrect", (btnDiv, history) => {
  if (btnDiv) {
      document.getElementById("explanation").innerHTML = "Here is some interesting history on the phrase: " + history;
  }
});

document.getElementById("continueGame").onclick = () => {
  if (gameCount < gamePlays) {
    startWordMatch();
  } else {
    let socketContents = {B: currentBBScore, X: currentXScore, Y: currentYScore, Z: currentZScore};
    socket.emit("sendWordmatchFinished", socketContents, code);
    gameCount = 0;
    currentBBScore = 0;
    currentXScore = 0;
    currentYScore = 0;
    currentZScore = 0;
  }
}

socket.on("wordmatchFinished", (results) => {
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("resultsContainer").classList.remove("hide");
  document.getElementById("continueGame").classList.add("hide");
  document.getElementById("endGame").style.display = "inline-block";
  document.getElementById("resultsText").innerHTML = `Points earned<br>B-points: ${results.B}<br>X-points: ${results.X}<br>Y-points: ${results.Y}<br>Z-points: ${results.Z}`;

  addUserPoints(results.B, results.X, results.Y, results.Z);
  
  document.getElementById("bbPoints").innerHTML =
    "Current BB Points: " + 0;
  document.getElementById("xPoints").innerHTML =
    "Current X Points: " + 0;
  document.getElementById("yPoints").innerHTML =
    "Current Y Points: " + 0;
  document.getElementById("zPoints").innerHTML =
    "Current Z Points: " + 0;
  document.getElementById("bbPoints").classList.add("hide");
  document.getElementById("xPoints").classList.add("hide");
  document.getElementById("yPoints").classList.add("hide");
  document.getElementById("zPoints").classList.add("hide");
});

function startWordMatch() {
  gameCount++;
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          let socketContents = {
            data: data,
            randomNumber: Math.floor(Math.random() * 4 + 1)
          };
          socket.emit("sendWordmatchFetched", socketContents, code);
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

socket.on("wordmatchFetched", (results) => {
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

  document.getElementById("continueGame").classList.add("hide");

  //Question is placed in div4,
  document.getElementById("questionButton").classList.remove("hide");
  let genPhrase = document.getElementById("questionButton");
  genPhrase.innerHTML = "Guess this phrase: " + results.data.rows[0].phrase;

  let randomAnswerBtn = "";
  randomAnswerBtn = document.getElementById("btn" + results.randomNumber);
  randomAnswerBtn.innerHTML = results.data.rows[0].meaning;
  randomAnswerBtn.onclick = () => correctAnswer(results.randomNumber, results.data.rows[0]);

  // for each result after the first (first is the answer)
  for (j = results.data.rows.length; j > 1; j--) {
    //if div is empty (has no answer) then a random meaning is placed there
    if (document.getElementById("btn" + (j - 1)) != randomAnswerBtn) {
      let i = document.getElementById("btn" + (j - 1));
      i.innerHTML = results.data.rows[j - 1].meaning;
      let e = (j - 1);
      i.onclick = () => wrongAnswer(e);
    }
  }
});

socket.on("wordmatchCorrect", (btnDiv, values) => {
    document.getElementById("btn" + btnDiv).classList.add("correct"); //add css for correct answer to change div background color to green
    document.getElementById("btn" + btnDiv).classList.remove("incorrect");
  
    document.getElementById("bbPoints").classList.remove("hide");
    document.getElementById("xPoints").classList.remove("hide");
    document.getElementById("yPoints").classList.remove("hide");
    document.getElementById("zPoints").classList.remove("hide");
  
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
  
    document.getElementById("bbPoints").innerHTML =
      "Current BB Points: " + currentBBScore;
    document.getElementById("xPoints").innerHTML =
      "Current X Points: " + currentXScore;
    document.getElementById("yPoints").innerHTML =
      "Current Y Points: " + currentYScore;
    document.getElementById("zPoints").innerHTML =
      "Current Z Points: " + currentZScore;
  
    document.getElementById("btn1").disabled = true;
    document.getElementById("btn2").disabled = true;
    document.getElementById("btn3").disabled = true;
    document.getElementById("btn4").disabled = true;
  
    if (sessionStorage.getItem("isHost")) document.getElementById("continueGame").classList.remove("hide");
});

socket.on("wordmatchWrong", (e) => {
  document.getElementById("btn" + e).classList.add("incorrect");

  document.getElementById("btn1").disabled = true;
  document.getElementById("btn2").disabled = true;
  document.getElementById("btn3").disabled = true;
  document.getElementById("btn4").disabled = true;

  if (sessionStorage.getItem("isHost")) document.getElementById("continueGame").classList.remove("hide");
});

function correctAnswer(btnDiv, values) {
  if (sessionStorage.getItem("isHost")) socket.emit("sendWordmatchCorrect", btnDiv, values, code);
}

function wrongAnswer(e) {
  if (sessionStorage.getItem("isHost")) socket.emit("sendWordmatchWrong", e, code);
}

function toggleExplanation() {
  var popup = document.getElementById("explanation");
  popup.classList.toggle("show");
}

function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}