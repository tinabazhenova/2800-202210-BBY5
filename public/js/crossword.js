function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("Listener was invoked");
    }
}

ready(function() {
    let rects = new Array();
    let rect = document.getElementById("box0");
    let crossword = document.getElementById("crossword0");
    rects.push(rect);
    for (let i = 1; i < 5 * 7; ++i) {
        rects.push(rect.cloneNode(true));
        crossword.appendChild(rects[i]);
    }
})

$('#crossword0').on('input', function() {
    var self = $(this)
    console.log("input received")
    
});