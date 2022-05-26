class Matcher {
    constructor() {
        this.word = 0;
        let rec = document.querySelector(".rectangle");
        this.letters = [rec];
        this.tempEnteredWord = '';
        this.position = 0;

        let grid = document.querySelector(".wordguess_grid");
        this.word_length = grid.getAttribute("word_length");
        this.guess_attempts = grid.getAttribute("guess_attempts");
        let r = document.querySelector(':root');
        r.style.setProperty('--gridWidth', this.word_length);

        for (let i = 1; i < this.word_length * this.guess_attempts; ++i) {
            this.letters[i] = rec.cloneNode(true);
            grid.appendChild(this.letters[i]);
            this.letters[i].id = 'rec' + (i + 1);
        }
    }

    onInput(event) {
        if (document.getElementById("gameContainer").style.display == "block" && sessionStorage.getItem("isHost")) {
            if (this.position < this.word_length || event.keyCode == 8) {
                if (event.keyCode >= 65 && event.keyCode <= 90) { //checks if the user entered a letter
                    this.letters[this.word * this.word_length + this.position].innerHTML = event.key; // fill array in a line
                    this.tempEnteredWord += event.key.toUpperCase(); //records a letter into string
                    this.position++; // increase position
    
                } else if (event.keyCode == 8 && this.position != 0) { // if user hits BS 
                    this.position--; // decrease position
                    this.tempEnteredWord = this.tempEnteredWord.substring(0, this.position);
                    this.letters[this.word * this.word_length + this.position].innerHTML = ''; //rewrite an indec in an array with empty char
                } else {
                    alert('Enter the letter from A- Z'); //the user entered the worng character
                }
            } else {
                if (event.keyCode == 13) { //the user hit enter
                    this.guess(this.word, this.letters, this.tempEnteredWord);
                }
            }
        }
    }

    reset() {
        this.word = 0;
        this.tempEnteredWord = '';
        this.position = 0;
        Array.from(document.getElementsByClassName("rectangle")).forEach((e) => {
                e.className = "rectangle";
                e.innerHTML = "";
            }
        );
        Array.from(document.getElementsByClassName("letter")).forEach((e) => {
                e.className = "letter";
            }
        );
    }

    async guess() {
        try {
            let contents = { word: this.tempEnteredWord };
            let check = await fetch('/try_word', {
                method: 'POST',
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(contents)
            });
            let parsed = await check.json();
            let socketContents = {keyLetters: [], keyColors: [], attempt: this.word};
            for (let i = 0; i < this.word_length; i++) {
                socketContents.keyLetters.push(this.tempEnteredWord[i]);
                if (parsed.matches[i] == 2) {
                    socketContents.keyColors.push("green");
                } else if (parsed.matches[i] == 1) {
                    socketContents.keyColors.push("yellow");
                } else {
                    socketContents.keyColors.push("discard");
                }
            }

            socket.emit("sendWordguessAttempted", socketContents, code);

            if (parsed.meaning) {
                socket.emit("sendWordguessResult", true, parsed.word, code);
                document.getElementById("endGame").style.display = "inline-block";
            } else if (this.word < 4) {
                ++this.word; // we give one more option to enter the word
                this.position = 0; //start the position from 0
                this.tempEnteredWord = '';
            } else {
                socket.emit("sendWordguessResult", false, parsed.word, code);
                document.getElementById("endGame").style.display = "inline-block";
            }
        } catch (error) {
            console.log(error);
        }
    }

}

let matcher = new Matcher();

ready(function() {
    let elements = document.getElementsByClassName("letter");
    let click = function() {
        let content = this.innerHTML;
        let event = { key: content, keyCode: content.charCodeAt(0) };
        matcher.onInput(event);
    }
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', click, false);
        elements[i].id = 'letter' + elements[i].innerHTML;
        elements[i].classList.add("originalKey");
    }
    let bkspc = document.getElementById("backspace");
    bkspc.addEventListener('click', function() {
        matcher.onInput({ keyCode: 8 });
    });
    document.getElementById("enter").addEventListener('click', function() {
        matcher.onInput({ keyCode: 13 });
    });
    window.addEventListener('keydown', function(event) {

        if (event.target === this.document.getElementById("chatInput")) {
            return;
        }
        matcher.onInput(event);
    })

})

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("Listener was invoked");
    }
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

// below here are the codes required to run the game online

socket.on("displayGameContainer", (display) => {
    if (display){
      document.getElementById("startGame").style.display = "none";
      document.getElementById("gameContainer").style.display = "block";
      document.getElementById("resultsText").style.display = "none";
      document.getElementById("explanation").innerHTML = "Guess first";
      matcher.reset();
    } else {
      document.getElementById("startGame").style.display = "inline-block";
      document.getElementById("gameContainer").style.display = "none";
    }
});

socket.on("wordguessAttempted", (results) => {
    console.log(results);
    for (let i = 0; i < matcher.word_length; i++) {
        document.getElementById("rec" + (results.attempt * matcher.word_length + i + 1)).classList.add(results.keyColors[i]);
        document.getElementById("rec" + (results.attempt * matcher.word_length + i + 1)).innerHTML = results.keyLetters[i];
        document.getElementById("letter" + results.keyLetters[i]).classList.remove("originalKey");
        document.getElementById("letter" + results.keyLetters[i]).classList.add(results.keyColors[i]);
    }
});

socket.on("wordguessCompleted", (guessed, word) => {
    document.getElementById("resultsText").style.display = "inline-block";
    console.log(word);
    if (guessed) {
        let bb = x = y = z = 0;
        if (word.generation == "B") {
            bb = word.value;
        } else if (word.generation == "X") {
            x = word.value;
        } else if (word.generation == "Y") {
            y = word.value;
        }else if (word.generation == "Z") {
            z = word.value;
        }
        document.getElementById("resultsText").innerHTML = `You guessed right! You earned ${word.value} ${word.generation}-points.<br>Click the history button to learn this word.`
        document.getElementById("explanation").innerHTML = word.meaning;
        console.log("points:" + bb, x, y, z);
        addUserPoints(bb, x, y, z);
    } else {
        document.getElementById("resultsText").innerHTML = `You failed!<br>Better luck next time.`
    }
});
