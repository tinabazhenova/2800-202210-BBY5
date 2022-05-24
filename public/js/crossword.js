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
            var self = $(this);
            let row = ev.srcElement.getAttribute("row");
            let col = ev.srcElement.getAttribute("col");
            let vert = ev.srcElement.getAttribute("vertical");
            if(vert == 0) {
                col++;
            } else {
                row++;
            }
            let str = 'input[row="' + row + '"][col="' + col + '"]';
            console.log(str);
            let newFocus = $(str);
            console.log(newFocus);
            if(newFocus.length == 1) {
                newFocus[0].setAttribute("vertical", vert);
                newFocus[0].focus();
                newFocus[0].select();
            }
        })
    }
})
