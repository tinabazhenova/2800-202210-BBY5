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

    window.addEventListener('keydown', function(event) {
        if (position < 5) {
            if (event.keyCode >= 65 && event.keyCode <= 90) {
                letters[word * 5 + position].innerHTML = event.key;
                position++;

            } else if (event.keyCode == 8 && position != 0) {
                position--;
                letters[word * 5 + position].innerHTML = '';
            } else {
                this.alert('Enter the letter from A- Z');
            }
        } else {
            if (event.keyCode == 13) {
                if (word < 4) {
                    ++word;
                    position = 0;
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