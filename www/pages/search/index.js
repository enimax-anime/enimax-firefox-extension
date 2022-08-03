
let sourcesNames = extensionNames;

for (var i = 0; i < extensionList.length; i++) {
    let atr = {
        "value": i,
    };

    if (i == parseInt(localStorage.getItem("currentEngine")) || (isNaN(parseInt(localStorage.getItem("currentEngine"))) && i == 0)) {
        atr.selected = "";
    }
    let tempDiv = createElement({
        "element": "option",
        "attributes": atr,
        "innerHTML": sourcesNames[i]
    });

    document.getElementById("sources").append(tempDiv);
}

document.getElementById("sources").onchange = function () {
    localStorage.setItem("currentEngine", document.getElementById("sources").value);

};

document.getElementById("searchBox").onclick = function () {
    openSearch();
}

document.getElementById("s_c").onclick = function () {
    close_search();

}


document.getElementById("search_x").onkeydown = function (event) {
    console.log(event);
    if (event.keyCode == 13) {
        search();
    }

}





function openSearch() {
    document.getElementsByClassName('searchInput')[0].style.width = 'calc(100% - 90px)';
    document.getElementsByClassName('searchBox')[0].style.width = 'calc(100% - 40px)';
    document.getElementById('s_c').style.display = 'flex';
    document.getElementsByClassName('searchInput')[0].style.paddingLeft = '40px';
    document.getElementsByClassName('searchButton')[0].onclick = function () { search(); }
}
function close_search() {
    document.getElementById('s_c').style.display = 'none';
    document.getElementsByClassName('searchInput')[0].style.width = '0';
    document.getElementsByClassName('searchBox')[0].style.width = '40px';
    document.getElementsByClassName('searchInput')[0].style.paddingLeft = '0';
    document.getElementsByClassName('searchButton')[0].onclick = function () { };
    event.stopPropagation();
}




function search() {
    document.getElementById("mainConSearch").innerHTML = "<div style='margin:auto;'>Loading...</div>";

    let currentEngine;
    if (localStorage.getItem("currentEngine") == null) {
        localStorage.setItem("currentEngine", 0);
        currentEngine = extensionList[0];
    } else {
        currentEngine = parseInt(localStorage.getItem("currentEngine"));
        if (currentEngine == 0) {
            currentEngine = extensionList[0];
        } else {
            currentEngine = extensionList[currentEngine];
        }
    }

    currentEngine.searchApi(document.getElementById('search_x').value).then(function (x) {

        let main_div = x.data;

        if (main_div.length == 0) {
            document.getElementById("mainConSearch").innerHTML = "<div style='margin:auto;'>No results :(</div>";
        } else {
            document.getElementById("mainConSearch").innerHTML = "";
        }

        for (var i = 0; i < main_div.length; i++) {
            let tempDiv1 = createElement({ "class": "s_card" });



            let tempDiv2 = createElement({ "class": "s_card_bg" });
            let tempDiv3 = createElement({ "class": "s_card_title" });
            let tempDiv4 = createElement({ "class": "s_card_title_main", "innerText": main_div[i].name });
            let tempDiv5 = createElement({
                "element": "div", "class": "s_card_play",
                "attributes": {
                    "data-href": `pages/episode/index.html?watch=${main_div[i].link}`
                },
                "listeners": {
                    "click": function () {
                        window.parent.postMessage({ "action": 500, data: this.getAttribute("data-href") }, "*");

                    }
                }
            });
            let tempDiv6 = createElement({ "class": "s_card_img_search", "style": { "backgroundImage": `url("${main_div[i].image}")` } });



            tempDiv3.append(tempDiv4);
            tempDiv2.append(tempDiv3);
            tempDiv2.append(tempDiv5);
            tempDiv1.append(tempDiv6);
            tempDiv1.append(tempDiv2);


            document.getElementById("mainConSearch").append(tempDiv1);

        }


    }).catch(function (x) {
        console.log(x);
        document.getElementById("mainConSearch").innerHTML = "Error";

        sendNoti([0, null, "Message", x.data]);

    });


}



// function applyTheme() {
//     var themeColorL = localStorage.getItem("themecolor");
//     if (themeColorL && themeColorL != undefined && themeColorL != null) {
//         document.documentElement.style.setProperty('--theme-color', themeColorL);
//     } else {
//         document.documentElement.style.setProperty('--theme-color', "#4b4bc2");

//     }

// }


// function changeTheme() {
//     let promptT = prompt("Enter the theme color", "#4b4bc2");
//     if (promptT.trim() != "" && promptT != null && promptT != undefined) {
//         localStorage.setItem("themecolor", promptT);
//         applyTheme()
//     } else {

//     }
// }

// applyTheme();