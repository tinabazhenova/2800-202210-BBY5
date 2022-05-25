let gWords = {}

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

function ingestWordInfo(letterBox, dir) {
    let wordLen = parseInt(letterBox.getAttribute("wordLen" + dir));
    if (wordLen) {
        let wordId = parseInt(letterBox.getAttribute("wordId" + dir));
        gWords[wordId] = new Array(wordLen);
    }
}

async function guess(wordId, word) {    
    let contents = { wordId: wordId, word: word };
    let check = await fetch('/try_crossword', {
        method: 'POST',
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(contents)
    });
    let parsed = await check.json();
    console.log(parsed);
}

function editWord(dir, ev) {
    let letterBox = ev.srcElement;
    let wordId = parseInt(letterBox.getAttribute("wordId" + dir));
    if (!wordId)
        return;
    let wordCoord = parseInt(letterBox.getAttribute("wordCoord" + dir));
    if (ev.inputType == "deleteContentBackward") {
        gWords[wordId][wordCoord] = null;
    } else if (ev.inputType == "insertText") {
        let wordArr = gWords[wordId];
        wordArr[wordCoord] = ev.data;
        let filledCount = 0;
        for(let i = 0; i < wordArr.length && wordArr[i] != null; ++i) {
            filledCount++;
        }
        if (filledCount == wordArr.length) {
            let word = "";
            for(let i = 0; i < wordArr.length; ++i)
                word += wordArr[i];
            guess(wordId, word);
        }
    }
}

ready(function() {
    let rects = document.getElementsByClassName("letterContainer");
    for(let i = 0; i < rects.length; i++) {
        let letterBox = rects[i].getElementsByTagName("input")[0];
        ingestWordInfo(letterBox, "Horiz");
        ingestWordInfo(letterBox, "Vert");
        letterBox.addEventListener("click", ev => {
            let self = ev.srcElement;
            self.select();
            let starting = self.getAttribute("startingvert");
            if(starting != null) {
                self.setAttribute("vertical", starting);
            }
        })
        letterBox.addEventListener("input", function(ev) {
            let row = parseInt(ev.srcElement.getAttribute("row"));
            let col = parseInt(ev.srcElement.getAttribute("col"));
            editWord("Horiz", ev);
            editWord("Vert", ev);
            let vert = ev.srcElement.getAttribute("vertical");
            if(vert == 0) {
                col = getNewCoord(col, ev.inputType);
            } else {
                row = getNewCoord(row, ev.inputType);
            }
            if(ev.inputType == "deleteContentBackward") {
                ev.srcElement.value = " ";
            }
            if (!moveToCoord(row, col, vert))
                ev.srcElement.select();
        })
    }
})
