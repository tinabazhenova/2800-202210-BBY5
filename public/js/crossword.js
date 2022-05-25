function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("Listener was invoked");
    }
}

function getNewCoord(coord, inputType) {
    console.log(inputType);
    if (inputType == "insertText") {
        return coord + 1;
    } else if (inputType == "deleteContentBackward") {
        if(coord > 0)
            return coord - 1;
        return coord;    
    }
}

function moveToCoord(row, col, vert) {
    let str = 'input[row="' + row + '"][col="' + col + '"]';
    let newFocus = $(str);
    if(newFocus.length == 1) {
        newFocus[0].setAttribute("vertical", vert);
        newFocus[0].focus();
        newFocus[0].select();
        return true;
    }
    return false;
}

ready(function() {
    let rects = document.getElementsByClassName("letterContainer");
    for(let i = 0; i < rects.length; i++) {
        let letterBox = rects[i].getElementsByTagName("input")[0];
        letterBox.addEventListener("click", ev => {
            let self = ev.srcElement;
            self.select();
            let starting = self.getAttribute("startingvert");
            if(starting != null) {
                self.setAttribute("vertical", starting);
            }
        })
        letterBox.addEventListener("input", function(ev) {
            // var self = $(this);
            console.log("inputType: " + ev.inputType);
            let row = parseInt(ev.srcElement.getAttribute("row"));
            let col = parseInt(ev.srcElement.getAttribute("col"));
            console.log(row);
            console.log(col);
            let vert = ev.srcElement.getAttribute("vertical");
            if(vert == 0) {
                col = getNewCoord(col, ev.inputType);
            } else {
                row = getNewCoord(row, ev.inputType);
            }
            if(ev.inputType == "deleteContentBackward") {
                ev.srcElement.value = " ";
            }
            moveToCoord(row, col, vert);

        })
    }
})
