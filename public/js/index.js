ready(function () {

    function ajaxPOST(url, callback, data) {

        let params = typeof data == 'string' ? data : Object.keys(data).map(
            function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
            }
        ).join('&');
        console.log("params in ajaxPOST", params);

        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                callback(this.responseText);

            } else {
                console.log(this.status);
            }
        }
        xhr.open("POST", url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
    }

    // POST TO THE SERVER
    document.querySelector("#submit").addEventListener("click", function (e) {
        e.preventDefault();
        let username = document.getElementById("username");
        let password = document.getElementById("password");
        let queryString = "username=" + username.value + "&password=" + password.value;
        ajaxPOST("/login", function (data) {
            if (data) {
                let dataParsed = JSON.parse(data);
                console.log(dataParsed);
                if (dataParsed.status == "fail") {
                    document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                } else {
                    if (dataParsed.isAdmin) {
                        sessionStorage.setItem("isAdmin", true);
                    } else {
                        sessionStorage.setItem("isAdmin", false);
                    }
                    window.location.replace("/main");
                }
            }

        }, queryString);
    });

    document.querySelector("#guest").addEventListener("click", function (e) {
        e.preventDefault();
        ajaxPOST("/guest_login", function (data) {
            window.location.replace("/main");
        }, "");
    });
});

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}