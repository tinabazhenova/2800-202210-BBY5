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
    /*
    let rects = new Array();
    let rect = document.getElementById("box0");
    let crossword = document.getElementById("crossword0");
    rect.setAttribute("row", 0);
    rect.setAttribute("col", 0);
    rects.push(rect);
    let rows = 5;
    let cols = 7;
    for (let i = 1; i < rows * cols; ++i) {
        let newNode = rect.cloneNode(true);
        newNode.setAttribute("row", parseInt(i / cols));
        newNode.setAttribute("col", i % cols);
        rects.push(newNode);
        crossword.appendChild(rects[i]);
    }
    for (let i = 1; i < rows * cols; ++i) {
        rects[i].addEventListener("input", function() {
            var self = $(this);
            console.log("input received");
            let focusRow = 2;
            let focusCol = 2;
            let str = 'input[row="' + focusRow + '"][col="' + focusCol + '"]';

            let newFocus = $(str);
            newFocus[0].focus();
        })
    }
    */
})