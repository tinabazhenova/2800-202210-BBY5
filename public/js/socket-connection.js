async function createLobby(game) {
    if (!sessionStorage.getItem("inRoom")) {
        try {
            let response = await fetch("/createLobby", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            let parsed = await response.json();
            sessionStorage.setItem("code", parsed.code);
            sessionStorage.setItem("game", game);
            sessionStorage.setItem("isHost", true);
            window.location.href = "/" + game;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("You are already in a room");
    }
}

async function joinLobby(code) {
    if (!sessionStorage.getItem("inRoom")) {
        try {
            let response = await fetch("/joinLobby", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({code: code}),
            });
            let parsed = await response.json();
            let game = parsed.game;
            sessionStorage.setItem("game", game);
            sessionStorage.setItem("isHost", false);
            if (parsed.approved) {
                window.location.href = "/" + game;
            } else {
                document.getElementById("error").innerHTML = parsed.errorMessage;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        document.getElementById("error").innerHTML = "You are already in a room";
    }
}

document.getElementById("wordguess").addEventListener("click", (e) => {
    createLobby("wordguess");
});

document.getElementById("wordmatch").addEventListener("click", (e) => {
  createLobby("wordmatch");
});

document.getElementById("crossword").addEventListener("click", (e) => {
    createLobby("crossword");
});

document.getElementById("logOut").addEventListener("click", (e) => {
    createLobby("logOut");
});

document.getElementById("profile").addEventListener("click", (e) => {
    createLobby("profile");
})

let modal = document.getElementById("modalBackground");

document.getElementById("openModal").addEventListener("click", (e) => {
    modal.style.display = "block";
});

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById("error").innerHTML = "";
    }
};

document.getElementById("findLobbyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    let input = document.getElementById("codeInput");
    sessionStorage.setItem("code", input.value);
    joinLobby(sessionStorage.getItem("code"));
    input.value = "";
});

document.getElementById("shop").addEventListener("click", (e) => {
    window.location.href = "/shop";
});