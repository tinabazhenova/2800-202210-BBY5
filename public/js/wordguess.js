ready(function() {
    //alert('LOL');
    let rec = document.querySelector(".rectangle");
    let letters = [rec];

    //rec.innerHTML = "A";
    for (let i = 1; i < 25; ++i) {
        letters[i] = rec.cloneNode(true);
        document.querySelector(".wordguess_grid").appendChild(letters[i]);

    }

    let position = 0;
    let word = 0;
    let hardCodedWord = 'youth'.toUpperCase();
    let tempEnteredWord = '';

    window.addEventListener('keydown', function(event) {
        if (position < 5) {
            if (event.keyCode >= 65 && event.keyCode <= 90) { //checks if the user entered a letter
                letters[word * 5 + position].innerHTML = event.key; // fill array in a line
                tempEnteredWord += event.key.toUpperCase(); //records a letter into string
                position++; // increase position

            } else if (event.keyCode == 8 && position != 0) { // if user hits BS 
                position--; // decrease position
                letters[word * 5 + position].innerHTML = ''; //rewrite an indec in an array with empty char
            } else {
                this.alert('Enter the letter from A- Z'); //the user entered the worng character
            }
        } else {
            if (event.keyCode == 13) { //the user hit enter
                console.log(tempEnteredWord);
                if (hardCodedWord == tempEnteredWord) {
                    console.log("tempEnteredWord: " + tempEnteredWord + ", hardCodedWord: " + hardCodedWord);
                    this.alert('Victory');

                } else if (word < 4) {
                    ++word; // we give one more option to enter the word
                    position = 0; //start the position from 0
                    tempEnteredWord = '';
                } else {
                    this.alert('Game over');
                }
            } else {
                this.alert('Please hit enter');
            }
        }
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