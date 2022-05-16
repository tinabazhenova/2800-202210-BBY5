function addEventListeners() {

  document.getElementById("user_name").addEventListener("click", editUsername);

  document.getElementById("password").addEventListener("click", editPassword);
}

addEventListeners();


function editUsername(e) {

  // add a listener for clicking on the field to change email
  // span's text
  let spanText = e.target.innerHTML;
  // span's parent (td)
  let parent = e.target.parentNode;
  console.log(parent);
  // create a new input, and add a key listener to it
  let input = document.createElement("input");
  input.value = spanText;
  input.addEventListener("keyup", function (e) {
    console.log("EditUsername was called");
    //let s = null;
    let v = null;
    // pressed enter
    if (e.which == 13) {
      console.log("which=13");
      //s = input.value;
      v = input.value;
      let newSpan = document.createElement("span");
      newSpan.id = "user_name";
      // have to wire an event listener to the new element
      newSpan.addEventListener("click", editUsername);
      //newSpan.innerHTML = s;
      newSpan.innerHTML = v;
      parent.innerHTML = "";
      parent.appendChild(newSpan);
      let dataToSend = {
        user_name: v
      };
      console.log(dataToSend);

      // now send
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

          // 200 means everthing worked
          if (xhr.status === 200) {
            // document.getElementById("status").innerHTML = "Record updated.";
            getUsername();
            console.log(this.status);

          } else {

            // not a 200, could be anything (404, 500, etc.)
            console.log(this.status);

          }

        } else {
          console.log("ERROR", this.status);
        }
      }
      xhr.open("POST", "/update-username");
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      //console.log("dataToSend", "id=" + dataToSend.id + "&email=" + dataToSend.email);
      xhr.send("user_name=" + dataToSend.user_name);
      // + "&password=" + dataToSend.password

    }
  });
  parent.innerHTML = "";
  parent.appendChild(input);

}

function editPassword(e) {
  // add a listener for clicking on the field to change email
  // span's text
  let spanText = e.target.innerHTML;
  // span's parent (td)
  let parent = e.target.parentNode;
  console.log(parent);
  // create a new input, and add a key listener to it
  let input = document.createElement("input");
  input.value = spanText;
  input.addEventListener("keyup", function (e) {
    console.log("EditPassword was called");
    //let s = null;
    let v = null;
    // pressed enter
    if (e.which == 13) {
      console.log("which=13");
      //s = input.value;
      v = input.value;
      let newSpan = document.createElement("span");
      newSpan.id = "password";
      // have to wire an event listener to the new element
      newSpan.addEventListener("click", editPassword);
      //newSpan.innerHTML = s;
      newSpan.innerHTML = v;
      parent.innerHTML = "";
      parent.appendChild(newSpan);
      let dataToSend = {
        password: v
      };
      console.log(dataToSend);

      // now send
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

          // 200 means everthing worked
          if (xhr.status === 200) {
            // document.getElementById("status").innerHTML = "Record updated.";
            getPassword();
            console.log(this.status);

          } else {

            // not a 200, could be anything (404, 500, etc.)
            console.log(this.status);

          }

        } else {
          console.log("ERROR", this.status);
        }
      }
      xhr.open("POST", "/update-password");
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      //console.log("dataToSend", "id=" + dataToSend.id + "&email=" + dataToSend.email);
      xhr.send("password=" + dataToSend.password);
      // + "&password=" + dataToSend.password

    }
  });
  parent.innerHTML = "";
  parent.appendChild(input);
}

function getUsername() {
  const xhr = new XMLHttpRequest();
  console.log("get username called");
  xhr.onload = function () {

    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          console.log("get username success");

          document.getElementById("user_name").innerHTML = data.username;

        } else {
          console.log("Error!");
        }

      } else {

        // not a 200, could be anything (404, 500, etc.)
        console.log(this.status);
      }

    } else {
      console.log("ERROR", this.status);
    }

  }
  xhr.open("GET", "/get-username");
  xhr.send();
}

function getPassword() {
  const xhr = new XMLHttpRequest();
  console.log("get password called");
  xhr.onload = function () {

    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          console.log("get password success");
          console.log(data.password);

          document.getElementById("password").innerHTML = data.password;

        } else {
          console.log("Error!");
        }

      } else {

        // not a 200, could be anything (404, 500, etc.)
        console.log(this.status);
      }

    } else {
      console.log("ERROR", this.status);
    }

  }
  xhr.open("GET", "/get-password");
  xhr.send();

}