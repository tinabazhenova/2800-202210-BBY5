function editCell(e) {

  // add a listener for clicking on the field to change email
  // span's text
  let spanText = e.target.innerHTML;
  // span's parent (td)
  let parent = e.target.parentNode;
  // create a new input, and add a key listener to it
  let input = document.createElement("input");
  input.value = spanText;
  input.addEventListener("keyup", function(e) {
      let s = null;
      let v = null;
      // pressed enter
      if(e.which == 13) {
          s = input.value;
          v = input.value;
          let newSpan = document.createElement("span");
          // have to wire an event listener to the new element
          newSpan.addEventListener("click", editCell);
          newSpan.innerHTML = s;
          newSpan.innerHTML = v;
          parent.innerHTML = "";
          parent.appendChild(newSpan);
          let dataToSend = {user_name:s,
                            password: v};

          // now send
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
              if (this.readyState == XMLHttpRequest.DONE) {

                  // 200 means everthing worked
                  if (xhr.status === 200) {
                    // document.getElementById("status").innerHTML = "Record updated.";
                    // getCustomers();
                    console.log(this.status);

                  } else {

                    // not a 200, could be anything (404, 500, etc.)
                    console.log(this.status);

                  }

              } else {
                  console.log("ERROR", this.status);
              }
          }
          xhr.open("POST", "/update-user");
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          //console.log("dataToSend", "id=" + dataToSend.id + "&email=" + dataToSend.email);
          xhr.send("user_name=" + dataToSend.user_name + "&password=" + dataToSend.password);

      }
  });
  parent.innerHTML = "";
  parent.appendChild(input);

}