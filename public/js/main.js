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
        sessionStorage.setItem("isHost", true);
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
            body: JSON.stringify({code: code}),
        });
        let parsed = await response.json();
        sessionStorage.setItem("code", code);
        sessionStorage.setItem("game", parsed.game);
        sessionStorage.setItem("isHost", false);
        if (parsed.approved) {
            window.location.href = "/" + parsed.game;
        } else {
            document.getElementById("error").innerHTML = parsed.errorMessage;
        }
    } catch (error) {
        console.log(error);
    }
}

document.getElementById("wordguess").onclick = () => createLobby("GuessIt");
document.getElementById("wordmatch").onclick = () => createLobby("MatchIt");
document.getElementById("crossword").onclick = () => createLobby("CrossIt");
document.getElementById("logOut").onclick = () => createLobby("logOut");
document.getElementById("profile").onclick = () => window.location.href = "/profile";
document.getElementById("admin").onclick = () => window.location.href = "/admin";

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

document.getElementById("div7").style.display = "none";
if (sessionStorage.getItem("isAdmin") == "true") document.getElementById("div7").style.display = "block";

document.getElementById("back").style.visibility = "hidden";