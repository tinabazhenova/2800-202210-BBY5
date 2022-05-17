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

        //rec.innerHTML = "A";
        for (let i = 1; i < this.word_length * this.guess_attempts; ++i) {
            this.letters[i] = rec.cloneNode(true);
            grid.appendChild(this.letters[i]);
        }
    }

    onInput(event) {
        if (this.position < this.word_length || event.keyCode == 8) {
            if (event.keyCode >= 65 && event.keyCode <= 90) { //checks if the user entered a letter
                this.letters[this.word * this.word_length + this.position].innerHTML = event.key; // fill array in a line
                this.tempEnteredWord += event.key.toUpperCase(); //records a letter into string
                this.position++; // increase position

            } else if (event.keyCode == 8 && position != 0) { // if user hits BS 
                this.position--; // decrease position
                this.tempEnteredWord = this.tempEnteredWord.substring(0, this.position);
                this.letters[this.word * this.word_length + this.position].innerHTML = ''; //rewrite an indec in an array with empty char
            } else {
                alert('Enter the letter from A- Z'); //the user entered the worng character
            }
        } else {
            if (event.keyCode == 13) { //the user hit enter
                this.guess(this.word, this.letters, this.tempEnteredWord);
            } else {
                alert('Please hit enter');
            }
        }
    }

    async guess() {
        try {
            let contents = { word: this.tempEnteredWord };
            let check = await fetch('/try_word', {
                method: 'POST',
                //body: JSON.stringify(contents)
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(contents)
            });
            console.log(check.body);
            let parsed = await check.json();
            console.log(parsed);
            let strictMatches = 0;
            for (let i = 0; i < this.word_length; i++) {
                if (parsed[i] == 2) {
                    this.letters[this.word * this.word_length + i].classList.add("green");
                    strictMatches++;
                } else if (parsed[i] == 1) {
                    this.letters[this.word * this.word_length + i].classList.add("yellow");
                }
            }

            if (strictMatches == this.word_length) {
                alert('Victory');

            } else if (this.word < 4) {
                ++this.word; // we give one more option to enter the word
                this.position = 0; //start the position from 0
                this.tempEnteredWord = '';
            } else {
                alert('Game over');
            }
        } catch (error) {
            console.log(error);
        }
    }

}

ready(function() {
    //alert('LOL');
    let matcher = new Matcher();

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