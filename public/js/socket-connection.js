async function createLobby(game) {
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
        window.location.href = "/" + game;
    } catch (error) {
        console.log(error);
    }
}

async function joinLobby(code) {
    try {
        let response = await fetch("/joinLobby", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(code),
        });
        let parsed = await response.json();
        let game = parsed.game;
        sessionStorage.setItem("game", game);
        if (parsed.found) {
            window.location.href = "/" + game;
        } else {
            document.getElementById("error").innerHTML = "Room not found";
        }
    } catch (error) {
        console.log(error);
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
    }
};

document.getElementById("findLobbyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sessionStorage.setItem("code", document.getElementById("code-input").value);
    joinLobby({
        code: sessionStorage.getItem("code"),
    });
});

document.getElementById("shop").addEventListener("click", (e) => {
    window.location.href = "/shop";
});