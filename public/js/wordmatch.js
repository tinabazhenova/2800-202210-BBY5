function showDetails() {
  for (var i = 0; i < arguments.length; i++) {
    var e = document.getElementById(arguments[i]);
    e.style.display = e.style.display == "block" ? "none" : "block";
  }
}

function getPhrase() {
  const genPhrase = document.getElementById("div3")
  const answer = document.getElementById("div" + Math.random() * 3 + 4)
  connection.connect();
  connection.query('SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 1;'),
    function (error, results, fields) {
      if(error) {
        console.log(error);
      }
      genPhrase.innerHTML += results[0].phrase;

      
    }
}
getPhrase()


// May not work asynchronously with getPhrase(). Might need to add promise or await function
app.get('/wordmatch', function (req, res) {
  connection.connect();
  connection.query('SELECT * FROM BBY_5_user ORDER BY rand() LIMIT 2;', function (error, results, fields) {
    if (error) {
      console.log(error);
    }
    console.log('Rows returned are: ', results);
    res.send({
      status: "success",
      rows: results
    });
    for (j=0; j<results.length; j++) {
      //if (element is empty)
      document.getElementById("div" + j + 4).innerHTML = results[j].meaning;
      results[j].addEventListener("click", guessMeaning());
    }
   
  });
  connection.end();
});

// Need to add function to change CSS to green on correct guess, and add score to player's count
function guessMeaning() {

}

// Need to add function to play again

// Optional: add function to display history of the word after guessing