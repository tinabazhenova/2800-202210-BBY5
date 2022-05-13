function addEventListeners() {
  let firstNameRecords = document.querySelectorAll("td[class='FirstName'] span");
  for (let j = 0; j < firstNameRecords.length; j++) {
    records[j].addEventListener("click", editFirstName);
  }

  let lastNameRecords = document.querySelectorAll("td[class='LastName'] span");
  for (let j = 0; j < lastNameRecords.length; j++) {
    records[j].addEventListener("click", editLastName);
  }

  let userNameRecords = document.querySelectorAll("td[class='UserName'] span");
  for (let j = 0; j < userNameRecords.length; j++) {
    records[j].addEventListener("click", editUsername);
  }

  let passwordRecords = document.querySelectorAll("td[class='Password'] span");
  for (let j = 0; j < passwordRecords.length; j++) {
    records[j].addEventListener("click", editPassword);
  }

  let isAdminRecords = document.querySelectorAll("td[class='IsAdmin'] span");
  for (let j = 0; j < isAdminRecords.length; j++) {
    records[j].addEventListener("click", editIsAdmin);
  }

}

addEventListeners();

function getUsers() {
  const xhr = new XMLHttpRequest();
  console.log("get username called");
  xhr.onload = function () {

    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        let data = JSON.parse(this.responseText);
        if (data.status == "success") {
          console.log("get username success");

          // document.getElementById("user_name").innerHTML = data.username;
          let str = `<tr>
                      <th class="IDHeader"><span>ID</span></th>
                      <th class="FNHeader"><span>First Name</span></th>
                      <th class="LNHeader"><span>Last Name</span></th> 
                      <th class="UNHeader"><span>Username</span></th>
                      <th class="PassHeader"><span>Password</span></th>
                      <th class="IAHeader"><span>isAdmin</span></th>
                    </tr>`;
          for (let i = 0; i < data.rows.length; i++) {
            let row = data.rows[i];
            //console.log("row", row);
            str += ("<tr><td class='id'>"
              + row.ID
              + "<td class='FirstName'><span>"
              + row.first_name
              + "<span></td><td class='LastName'><span>"
              + row.last_name
              + "<span></td><td class='UserName'><span>"
              + row.user_name
              + "<span></td><td class='Password'><span>"
              + row.password
              + "<span></td><td class='IsAdmin'><span>"
              + row.is_admin
              + "</span></td></tr>");
          }

          document.getElementById("users_table").innerHTML = str;

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
  xhr.open("GET", "/get-users");
  xhr.send();
}

getUsers();

document.getElementById("add-submit").addEventListener("click", function (e) {
  e.preventDefault();

  let formData = {
    first_name: document.getElementById("addfirstname").value,
    last_name: document.getElementById("addlastname").value,
    user_name: document.getElementById("addusername").value,
    password: document.getElementById("addpassword").value,
    is_admin: document.getElementById("addisAdmin").value
  };

  document.getElementById("addfirstname").value = "";
  document.getElementById("addlastname").value = "";
  document.getElementById("addusername").value = "";
  document.getElementById("addpassword").value = "";
  document.getElementById("addisAdmin").value = "";

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        getUsers();
        console.log("DB updated.");

      } else {

        // not a 200, could be anything (404, 500, etc.)
        console.log(this.status);

      }

    } else {
      console.log("ERROR", this.status);
    }
  }
  xhr.open("POST", "/add-user");
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("first_name=" + formData.first_name + "&last_name=" + formData.last_name +
    "&user_name=" + formData.user_name + "&password=" + formData.password +
    "&is_admin=" + formData.is_admin);

});

document.getElementById("edit-submit").addEventListener("click", function (e) {
  e.preventDefault();

  let editData = {
    id: document.getElementById("id").value,
    first_name: document.getElementById("editfirstname").value,
    last_name: document.getElementById("editlastname").value,
    user_name: document.getElementById("editusername").value,
    password: document.getElementById("editpassword").value,
    is_admin: document.getElementById("editisAdmin").value
  };

  // document.getElementById("addfirstname").value = "";
  // document.getElementById("addlastname").value = "";
  // document.getElementById("addusername").value = "";
  // document.getElementById("addpassword").value = "";
  // document.getElementById("addisAdmin").value = "";

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        getUsers();
        console.log("DB edited.");

      } else {

        // not a 200, could be anything (404, 500, etc.)
        console.log(this.status);

      }

    } else {
      console.log("ERROR", this.status);
    }
  }
  xhr.open("POST", "/edit-user");
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("id=" + editData.id + "&first_name=" + editData.first_name + "&last_name=" + editData.last_name +
    "&user_name=" + editData.user_name + "&password=" + editData.password +
    "&is_admin=" + editData.is_admin);

});

document.getElementById("delete-submit").addEventListener("click", function (e) {

  let deleteData = { user_name: document.getElementById("delusername").value };

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.readyState == XMLHttpRequest.DONE) {

      // 200 means everthing worked
      if (xhr.status === 200) {

        getUsers();
        console.log("All records deleted.");

      } else {

        // not a 200, could be anything (404, 500, etc.)
        console.log(this.status);

      }

    } else {
      console.log("ERROR", this.status);
    }
  }
  xhr.open("POST", "/delete-users");
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("user_name=" + deleteData.user_name);
});