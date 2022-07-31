

let localDOM = document.getElementById("local");



document.getElementById("local").onchange = function () {
    let val = localDOM.checked.toString();


    config.local = val;
    if (val == "false") {
        let remote = prompt("Enter the URL", "https://glistening-square-fenugreek.glitch.me");
        let remoteWOport = prompt("Enter the URL without the port number", remote);
        localStorage.setItem("remote", remote);
        localStorage.setItem("remoteWOport", remoteWOport);

        config.remote = remote;
        config.remoteWOport = remoteWOport;


        localStorage.setItem("local", "false");
        window.location = "index.html";



    } else {
        localStorage.setItem("local", "true");

    }


};

document.getElementById("local").checked = (localStorage.getItem("local") === 'true');

function applyTheme() {
    var themeColorL = localStorage.getItem("themecolor");
    if (themeColorL && themeColorL != undefined && themeColorL != null) {
        document.documentElement.style.setProperty('--theme-color', themeColorL);
    } else {
        document.documentElement.style.setProperty('--theme-color', "#4b4bc2");

    }

}

applyTheme();

function changeEngine() {
    let val = localStorage.getItem("currentEngine");
    if (val == null || val == "1") {
        localStorage.setItem("currentEngine", 0);

    } else {
        localStorage.setItem("currentEngine", 1);

    }
}

function changeTheme() {
    let promptT = prompt("Enter the theme color", "#4b4bc2");
    if (promptT.trim() != "" && promptT != null && promptT != undefined) {
        localStorage.setItem("themecolor", promptT);
        applyTheme()
    } else {

    }
}

applyTheme();