ready(function() {
    let rec = document.querySelector(".rectangle");
    for (let i = 0; i < 24; ++i) {
        const clone = rec.cloneNode(true);
        document.querySelector(".wordguess_grid").appendChild(clone);
    }

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