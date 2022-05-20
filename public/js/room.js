const socket = io();

let code = sessionStorage.getItem("code")
let game = sessionStorage.getItem("game");
document.getElementById("roomInfo").innerHTML = game + " " + code;

socket.emit("joinRoom", code, game);

const form = document.getElementById("chatForm");

//sends a message to the server using socket.emit()
form.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value;
  socket.emit("sendMessage", message, code);
  input.value = "";
});

//server can send messages to its clients too - use socket.on() to respond
socket.on("postMessage", (message, title) => {
  displayMessage(message, title);
});

socket.on("updateUserlist", members => {
  const list = document.getElementById("userList");
  list.innerHTML = "Users in this room:";
  members.forEach(m => {
    list.innerHTML += "<br>" + m;
  });
})

socket.on("announceMessage", message => {
  displayMessage(message);
});

function displayMessage(message, title) {
  const dialog = document.getElementById("chat-dialog");
  dialog.innerHTML += "<br>";
  if (title && title != "None") {
    dialog.innerHTML += `[${title}] `
  }
  dialog.innerHTML += message;
};

document.getElementById("leaveRoom").addEventListener("click", () => {
  window.location.href = "/main";
});