
function showDetails() {
    for (var i = 0; i < arguments.length; i++) {
      var e = document.getElementById(arguments[i]);
      e.style.display = e.style.display == "block" ? "none" : "block";
    }
  }

  function displayPhrase() {
    const genPhrase = document.getElementById("div3")
    genPhrase.innerHTML += results[0].phrase;
  }