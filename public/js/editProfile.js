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
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function (e) {
        let v = null;
        // pressed enter
        if (e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            newSpan.id = "user_name";
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editUsername);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {
                user_name: v
            };

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                        getUsername();
                    } else {
                        console.log(this.status);

                    }

                }
            }
            xhr.open("POST", "/update-username");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send("user_name=" + dataToSend.user_name);

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
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function (e) {
        let v = null;
        // pressed enter
        if (e.which == 13) {
            console.log("which=13");
            v = input.value;
            let newSpan = document.createElement("span");
            newSpan.id = "password";
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editPassword);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {
                password: v
            };

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                        getPassword();

                    } else {
                        console.log(this.status);

                    }

                }
            }
            xhr.open("POST", "/update-password");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send("password=" + dataToSend.password);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);
}

function getUsername() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {

        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

                let data = JSON.parse(this.responseText);
                if (data.status == "success") {

                    document.getElementById("user_name").innerHTML = data.username;

                }

            } else {
                console.log(this.status);
            }

        }

    }
    xhr.open("GET", "/get-username");
    xhr.send();
}

function getPassword() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {

        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

                let data = JSON.parse(this.responseText);
                if (data.status == "success") {

                    document.getElementById("password").innerHTML = data.password;

                }

            } else {
                console.log(this.status);
            }

        }

    }
    xhr.open("GET", "/get-password");
    xhr.send();

}

document.getElementById("remove").addEventListener("click", function (e) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {
                document.getElementById("picture_src").src = "/imgs/dummy.jpg";
            } else {
                console.log(this.status);

            }

        }
    }
    xhr.open("POST", "/delete-image");
    xhr.send();
});