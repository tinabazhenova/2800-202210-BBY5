const socket = io();

const form = document.getElementById("chat-form");

let code = sessionStorage.getItem("code")
socket.emit("joinRoom", code);

socket.on("readMessage", message => {
  displayMessage(message);
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value;
  socket.emit("sendMessage", message, code);
  input.value = "";
  displayMessage(message);
});

function displayMessage(message) {
  const dialog = document.getElementById("chat-dialog");
  dialog.innerHTML += "<br>" + message;
};