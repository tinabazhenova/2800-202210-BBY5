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

    window.addEventListener('keydown', function(event) {
        if (position < 25) {
            letters[position].innerHTML = event.key;
            position++;
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