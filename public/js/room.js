const socket = io();

let code = sessionStorage.getItem("code");
let game = sessionStorage.getItem("game");
document.getElementById("roomInfo").innerHTML = game + " " + code;

socket.emit("preventDuplicates", code);
socket.emit("joinRoom", code, game);

const form = document.getElementById("chatForm");

//sends a message to the server using socket.emit()
form.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message) socket.emit("sendMessage", message, code);
  input.value = "";
  const dialog = document.getElementById("chatDialog");
  dialog.scrollTop = dialog.scrollHeight;
});

//server can send messages to its clients too - use socket.on() to respond
socket.on("postMessage", (message, title) => {
  displayMessage(message, title);
});

socket.on("announceMessage", message => {
  displayMessage(message, "System");
});

socket.on("updateUserlist", (members, host) => {
  const list = document.getElementById("userList");
  list.innerHTML = "Users in this room:";
  members.forEach(m => {
    if (m == host) {
      list.innerHTML += "<br>" + m + " (host)";
    } else {
      list.innerHTML += "<br>" + m;
    }
  });
})

socket.on("forceDisconnect", (message, username) => {
  if (!username || (username && username.toUpperCase() == document.getElementById("name").innerHTML.substring(7))) {
    socket.disconnect();
    document.getElementById("modalBackground").style.display = "block";
    document.getElementById("modalText").innerHTML = message;
  }
});

function displayMessage(message, title) {
  const dialog = document.getElementById("chatDialog");
  dialog.innerHTML += "<br>";
  if (title && title != "None") {
    dialog.innerHTML += `[${title}] `
  }
  dialog.innerHTML += message;
};

document.getElementById("startGame").onclick = () => {
  socket.emit("updateGameStatus", code, true);
};

document.getElementById("endGame").onclick = () => {
  socket.emit("updateGameStatus", code, false);
  document.getElementById("endGame").style.display = "none";
};

async function addUserPoints(bb, x, y, z) {
  try {
    let response = await fetch("/addUserPoints", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bb, x, y, z }),
    });
    let parsed = await response.json();
    if (!parsed.approved) {
      console.log("Error: " + error);
    }
  } catch (error) {
    console.log(error);
  }
}