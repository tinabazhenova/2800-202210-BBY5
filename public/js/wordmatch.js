// document.getElementById("start").onclick(()=>startWordMatch());
// document.getElementById("start").addEventListener("click", startWordMatch());

// document.getElementById("start").addEventListener("click", (e) => {
//   startWordMatch();
// });

document.getElementById("start").onclick = () => {
  startWordMatch();
};

function startWordMatch() {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {
      // 200 means everthing worked
      if (xhr.status === 200) {
        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          console.log(data);

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
          console.log(randomNumber);
          let randomAnswerBtn = "";
          randomAnswerBtn = document.getElementById("btn" + randomNumber);
          console.log(randomAnswerBtn);
          randomAnswerBtn.innerHTML = data.rows[0].meaning;

          // use this function when css works again so we can change color of randomAnswerBtn

          randomAnswerBtn.onclick = () => {
            correctAnswer(randomAnswerBtn, data.rows[0]);
          };

          // let newCorrectAnswer = () =>
          //   correctAnswer(randomAnswerBtn, data.rows[0]);

          // randomAnswerBtn.addEventListener("click", newCorrectAnswer);

          // randomAnswerBtn.addEventListener(
          //   "click",
          //   (e) => {
          //     correctAnswer(randomAnswerBtn, data.rows[0]);
          //   },
          //   (once = true)
          // );

          // trying to remove the event listener with removeEventListener(e, var, capture = true) but didn't work
          // randomAnswerBtn.addEventListener(
          //   "click",
          //   (e) => {
          //     correctAnswer(randomAnswerBtn, data.rows[0]);
          //   },
          //   (capture = true)
          // );

          // // for each result after the first (first is the answer)
          for (j = data.rows.length; j > 1; j--) {
            console.log("row", data.rows);
            //if div is empty (has no answer) then a random meaning is placed there
            if (document.getElementById("btn" + (j - 1)) != randomAnswerBtn) {
              let i = document.getElementById("btn" + (j - 1));
              console.log("wrong answer");

              i.innerHTML = data.rows[j - 1].meaning;

              i.onclick = () => wrongAnswer(i);

              // i.addEventListener(
              //   "click",
              //   (e) => {
              //     wrongAnswer(i);
              //   },
              //   (once = true)
              // );
            } else {
              console.log("correct answer");
            }
          }

          // score doesn't add properly, removing event listener makes it count twice as fast?
          // randomAnswerBtn.removeEventListener("click", (e) => correctAnswer());

          //attempt at show history button after a correct or incorrect guess
          // let addButton = document.createElement("button");
          // addButton.id = "showHistory"
          // genPhrase.appendChild(addButton)
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

// Need to add function to change CSS to green on correct guess, and add score to player's count
// function correctAnswer(e, f) {

let currentBBScore = 0;
let currentXScore = 0;
let currentYScore = 0;
let currentZScore = 0;

function correctAnswer(btnDiv, values) {
  btnDiv.classList.add("correct"); //add css for correct answer to change div background color to green
  btnDiv.classList.remove("incorrect");

  console.log(btnDiv, values);

  document.getElementById("div9").classList.remove("hide");
  document.getElementById("div10").classList.remove("hide");
  document.getElementById("div11").classList.remove("hide");
  document.getElementById("div12").classList.remove("hide");

  currentBBScore += values.bbvalue;
  currentXScore += values.xvalue;
  currentYScore += values.yvalue;
  currentZScore += values.zvalue;

  // // Need to add more divs to the page
  document.getElementById("div9").innerHTML =
    "Current BB Points: " + currentBBScore;
  document.getElementById("div10").innerHTML =
    "Current X Points: " + currentXScore;
  document.getElementById("div11").innerHTML =
    "Current Y Points: " + currentYScore;
  document.getElementById("div12").innerHTML =
    "Current Z Points: " + currentZScore;

  btnDiv.disabled = true;

  document.getElementById("start").classList.remove("hide");
  document.getElementById("start").innerHTML = "NEXT QUESTION";

  // btnDiv.removeEventListener("click", newCorrectAnswer);

  // btnDiv.removeEventListener("click", correctAnswer, capture = true);
  // btnDiv.removeEventListener("click", () => correctAnswer());
  // btnDiv.onclick(this.disabled = true);

  //Validation code goes here
}

// Optional: add function to display history of the word after guessing
// (something like "wrong answer"--> eventlistener on click --> remove "hide" class from history div
// add a div2.innerHTML = answer result[0].history)

function wrongAnswer(e) {
  e.classList.add("incorrect"); //added css for correct answer to change div background color to red
  // document.getElementById("btn1").classList.add("hide");
  // document.getElementById("btn2").classList.add("hide");
  // document.getElementById("btn3").classList.add("hide");
  // document.getElementById("btn4").classList.add("hide");

  document.getElementById("start").classList.remove("hide");
  document.getElementById("start").innerHTML = "NEXT QUESTION";
}

// Need to add function to play another round of 3
// function nextQuestion() {
//   // all this function does is remove hidden class from a "next question" button so it appears on the page.
//   // when clicked, it does startWordMatch() again
//   document.getElementById("div3").addEventListener("click", (e) => {
//     newFunction();
//   });

//   document.getElementById("start").classList.add("hide");

//   currentBBScore = 0;
//   currentXScore = 0;
//   currentYScore = 0;
//   currentZScore = 0;

//   startWordMatch();
// }

function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}
