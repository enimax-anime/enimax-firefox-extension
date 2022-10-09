function createElement(x) {
    let temp;
    if ("element" in x) {
        temp = document.createElement(x.element);

    } else {
        temp = document.createElement("div");

    }
    let attributes = x.attributes;

    for (value in attributes) {
        temp.setAttribute(value, attributes[value]);
    }


    
    for (value in x.style) {

        temp.style[value] = x.style[value];
    }


    if ("id" in x) {
        temp.id = x.id;
    }

    if ("class" in x) {
        temp.className = x.class;
    }

    if ("innerText" in x) {
        temp.textContent = x.innerText;
    }

    if ("innerHTML" in x) {
        temp.innerHTML = x.innerHTML;
    }

    let listeners = x.listeners;

    for (value in listeners) {
        temp.addEventListener(value, listeners[value]);
    }

    return temp;

}


try{
    const styleEl = document.createElement('style');
     document.head.appendChild(styleEl);
    if(localStorage.getItem("outlineWidth") && isNaN(parseInt(localStorage.getItem("outlineColor")))){
        document.getElementsByTagName("style")[0].sheet.insertRule(`*:focus {
            outline-width: ${parseInt(localStorage.getItem("outlineWidth"))}px !important;
            outline-style: solid !important;
            outline-color: ${(localStorage.getItem("outlineColor"))} !important;
        }`,0);
    }
}catch(err){

}

function applyTheme() {
    var themeColorL = localStorage.getItem("themecolor");
    if (themeColorL && themeColorL != undefined && themeColorL != null) {
        document.documentElement.style.setProperty('--theme-color', themeColorL);
    } else {
        document.documentElement.style.setProperty('--theme-color', "#4b4bc2");

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