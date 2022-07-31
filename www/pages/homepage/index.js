window.parent.postMessage({ "action": 1, data: "any" }, "*");


function resetOfflineQual() {
    let qual = [360, 480, 720, 1080];
    while (true) {
        let choice = parseInt(prompt(`What quality do you want the downloaded videos to be of? \n1. 360 \n2. 480\n3. 720 \n4. 1080`));
        if (!isNaN(choice) && choice >= 1 && choice <= 4) {
            localStorage.setItem("offlineQual", qual[choice - 1]);
            break;
        }
    }
}

document.getElementById("resetQuality").onclick = function(){
    resetOfflineQual();
}

document.getElementById("accessability").onclick = function(){
    document.getElementById("accessabilityCon").style.display = "flex";
}



document.getElementById("restoreData").onclick = function(){
    let res = prompt("Are you sure you want to do this? Doing this multiple time may result in duplication of your local data. Type \"YES\" to proceed.")

    if(res === "YES"){
        window.parent.dexieToSQLite();
    }else{
        alert("Aborting");
    }
}


document.getElementById("queueButton").setAttribute("data-paused",(localStorage.getItem("downloadPaused") === 'true').toString());

if(document.getElementById("queueButton").getAttribute("data-paused") === 'true'){
    document.getElementById("queueButton").className = "queuePlay";
}else{
    document.getElementById("queueButton").className = "queuePause";

}

document.getElementById("queueButton").onclick = function(){
    let downloadQueue = window.parent.returnDownloadQueue();
    if(document.getElementById("queueButton").getAttribute("data-paused") === 'true'){
        let bool = downloadQueue.playIt(downloadQueue);
        if(bool){
            document.getElementById("queueButton").className = "queuePause";
            document.getElementById("queueButton").setAttribute("data-paused", "false");
        }
    }else{
        let bool = downloadQueue.pauseIt(downloadQueue);
        if(bool){
            document.getElementById("queueButton").className = "queuePlay";
            document.getElementById("queueButton").setAttribute("data-paused", "true");

        }
    
    }
};

document.getElementById("activeRemove").onclick = function(){
    let downloadQueue = window.parent.returnDownloadQueue();
    downloadQueue.removeActive(downloadQueue); 
}


document.getElementById("doneRemove").onclick = function(){
    let downloadQueue = window.parent.returnDownloadQueue();
    downloadQueue.removeDone(downloadQueue); 
}

if(config.chrome){
    document.getElementById("queueOpen").style.display = "none";
    document.getElementById("restoreData").style.display = "none";
}

function addQueue(queue, queueDOM, downloadQueue, isDone){
  

    if(queue.length == 0 ){
        queueDOM.append(createElement(
            {
                "style" : {
                    "color" : "white",
                    "fontSize" : "15px",
                    "margin" : "10px 0 30px 0",
                },
                "innerText" : "Empty"
            }
        ));
    }
    for(let i = 0; i < queue.length; i++){
        let temp = createElement(
                {
                    "element" : "div", "class" : "episodesCon", 
                    "attributes" : {
                        "data-url" : queue[i].data
                    },
                   
                }
            );

        let temp2 = createElement({"element" : "div", "class" : "queueMessageCon"});
        

        let temp3 = createElement({"element" : "div", "innerText" : queue[i].message, "class": "queueMessage"});
        let temp4 = createElement({"element" : "div", "class": "episodesDownloaded", "attributes" : {
            "data-url" : queue[i].data
        }});

        temp4.onclick = function(){
            if(isDone){
                downloadQueue.removeFromDoneQueue(this.getAttribute("data-url"));

            }else{
                downloadQueue.removeFromQueue(this.getAttribute("data-url"));

            }
            
        }
        let downloadPercent;

        try{
            let temp = downloadQueue.queue[0].downloadInstance;
            downloadPercent = temp.downloaded / temp.total;
            downloadPercent = Math.floor(downloadPercent * 10000)/100;
        }catch(err){

        }
        let temp5 = createElement({"element" : "div", "innerHTML" : `${queue[i].title + " - "}${queue[i].anime.name.trim()} <span id="downloadingPercent">${(downloadPercent !== undefined && !isDone && i === 0) ?  " - " + downloadPercent + "%" : ""}</span>` });

        temp.append(temp2);
        temp.append(temp4);
        temp2.append(temp5);


        temp2.append(temp3);
        queueDOM.append(temp);
    }
}



function reloadQueue(mode = 0){
    let downloadQueue = window.parent.returnDownloadQueue();

    if(mode == 0 || mode == 1){
        let queueDOM = document.getElementById("activeCon");
        queueDOM.innerHTML = "";
        let queue = downloadQueue.queue;
        addQueue(queue, queueDOM, downloadQueue, false);
    }
    

    if(mode == 0 || mode == 2){
        let doneQueueDOM = document.getElementById("doneCon");
        doneQueueDOM.innerHTML = "";
        let doneQueue = downloadQueue.doneQueue;
        addQueue(doneQueue, doneQueueDOM, downloadQueue, true);
    }
    
}




document.getElementById("queueOpen").onclick = function(){
    document.getElementById("queueCon").style.display = "block";
    reloadQueue();
}



if(!config.chrome){
    document.getElementById("offlineCon").style.display = "block";
}

if(localStorage.getItem("offline") === 'true'){
    document.getElementById("resetSource").style.display = "inline-block";
    document.getElementById("resetQuality").style.display = "inline-block";
    document.getElementById("searchIcon").style.display = "none";

    

}

document.getElementById("resetSource").onclick = function(){
    let message = `What extension's source do you want to reset?\n`;
    for(let i = 0; i < extensionNames.length; i++){
        message +=  `${i}. ${extensionNames[i]}\n`;
    }

    while(true){
        let res = parseInt(prompt(message));
        if(res >= 0 && res < extensionNames.length){
            localStorage.removeItem(`${res}-downloadSource`);
            break;
        }
    }
}


let offlineDOM = document.getElementById("offline");

offlineDOM.onchange = function () {
    let val = offlineDOM.checked.toString();

    if (val == "false") {
        localStorage.setItem("offline", "false");
        window.location = "index.html";
    } else {
        if (isNaN(parseInt(localStorage.getItem("offlineQual")))) {
            resetOfflineQual();
        }
        localStorage.setItem("offline", "true");
        window.location = "index.html";

    }
};



document.getElementById("offline").checked = (localStorage.getItem("offline") === 'true');


async function logout() {
    try {
        sendNoti([2, "", "Alert", "Trying to log you out..."]);

        await window.parent.makeRequest("POST", `${config.remote}/logout`, {});
        location.reload();
    } catch (err) {
        sendNoti([2, "red", "Error", err]);

    }
}

if (config.local || localStorage.getItem("offline") === 'true') {
    document.getElementById("logout").style.display = "none";
    document.getElementById("reset").style.display = "none";
}


document.getElementById("retry").addEventListener("click", function () {
    location.reload();
});

document.getElementById("searchIcon").addEventListener("click", function () {
    window.location = '../search/index.html';
});

document.getElementById("add_room").addEventListener("click", function () {
    add_room_open();
});

document.getElementById("show_room").addEventListener("click", function () {
    show_room_open();
});





document.getElementById("changeServerDiv").addEventListener("click", function () {
    changeServer();
});

document.getElementById("logout").addEventListener("click", function () {
    logout();
});



let tempCloseDom = document.getElementsByClassName("closeDom");

for (let i = 0; i < tempCloseDom.length; i++) {
    tempCloseDom[i].onclick = function () {
        hide_dom(this);
    }
}


document.getElementById("closeRoom").onclick = function () {
    hide_dom2(this);
};

document.getElementById("addRoom").onclick = function () {
    ini_api.add_room();
};

document.getElementById("saveRoom").onclick = function () {
    ini_api.change_order(this);
};


document.getElementById("outlineColor").onchange = function(){
    localStorage.setItem("outlineColor", this.value);
}


document.getElementById("outlineWidth").onchange = function(){
    localStorage.setItem("outlineWidth", this.value);
}

document.getElementById("themeColor").onchange = function(){
    localStorage.setItem("themecolor", this.value);
}

document.getElementById("outlineColor").value =  localStorage.getItem("outlineColor");
document.getElementById("outlineWidth").value =  localStorage.getItem("outlineWidth");
document.getElementById("themeColor").value =  localStorage.getItem("themecolor");

document.getElementById("reset").addEventListener("click", function () {
    window.parent.postMessage({ "action": 22, data: "" }, "*");

});


function changeServer() {
    window.parent.postMessage({ "action": 26, data: "settings.html" }, "*");

}



var timeout;
document.getElementById("menuIcon").addEventListener("click", function () {
    let menuI = document.getElementById("menuIcon");
    menuI.classList.toggle("change");
    clearTimeout(timeout);
    if (menuI.getAttribute("data-open") == "0") {
        menuI.setAttribute("data-open", "1");
        document.getElementById("menu").style.display = "block";
        document.getElementById("menuBg").style.display = "block";

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                document.getElementById("menuBg").style.backgroundColor = "rgba(0,0,0,0.7)";
            });
        });
    } else {
        menuI.setAttribute("data-open", "0");
        document.getElementById("menu").style.display = "none";
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                document.getElementById("menuBg").style.backgroundColor = "rgba(0,0,0,0)";
                timeout = setTimeout(function () {
                    document.getElementById("menuBg").style.display = "none";

                }, 400);
            });
        });

    }


});



window.onmessage = function (x) {

    if (parseInt(x.data.action) == 200) {
        token = x.data.data;
        if (config.chrome == false && token.indexOf("connect.sid") == -1) {
            window.parent.postMessage({ "action": 21, data: "" }, "*");

        } else {
            getUserInfo();

        }
    }else if(x.data.action == "activeUpdate"){
        reloadQueue(1);
    }else if(x.data.action == "doneUpdate"){
        reloadQueue(2);
    }
    else if(x.data.action == "percentageUpate"){
        if(document.getElementById("downloadingPercent")){
            document.getElementById("downloadingPercent").innerText = " - " +x.data.data +"%";
        }
    }
};


var rooms;
var token;
var rooms_order;
var selectedShow = null;
var permNoti = null;
var check_sort = 0;
var yy;
var saveCheck = 0;
var last_order;

function toFormData(x) {
    var form = new FormData();
    for (value in x) {
        form.append(value, x[value]);
    }
    return form;
}





var username = "hi";




function open_menu(x) {
    let state = x.parentElement.getAttribute("data-state-menu");
    if (state == "open") {
        x.parentElement.style.width = "40px";
        x.parentElement.setAttribute("data-state-menu", "closed");
        x.style.transform = "rotate(0deg)";
    } else {
        x.parentElement.style.width = "auto";
        x.parentElement.setAttribute("data-state-menu", "open");
        x.style.transform = "rotate(45deg)";

    }
}



function watched_card(y) {
    var x = y.getAttribute("data-showname");
    selectedShow = x;
    document.getElementById("room_add_show").style.display = "flex";

}


function updateRoomDis() {

    rooms2 = rooms.slice(0);
    document.getElementById("room_dis_child").innerHTML = "";

    for (var i = 0; i < rooms_order.length; i++) {

        let yye = rooms2.indexOf(rooms_order[i]);
        if (yye > -1) {

            let tempDiv = createElement({ "class": "room_card_con", "attributes": { "data-roomid": rooms2[yye + 0] }, "listeners": {} });

            let tempDiv2 = createElement({ "class": "room_card", "attributes": {}, "listeners": {} });


            let tempDiv3 = createElement({ "class": "room_text", "attributes": {}, "listeners": {}, "innerText": rooms2[yye - 1] });

            let tempDiv4 = createElement({
                "class": "room_card_delete", "attributes": { "data-roomid": rooms2[yye] }, "listeners": {
                    "click": function () {
                        ini_api.delete_room(this);
                    }
                }
            });

            let tempDiv5 = createElement({ "class": "draggable_room", "attributes": {}, "listeners": {} });


            tempDiv2.append(tempDiv3);
            tempDiv2.append(tempDiv4);
            tempDiv2.append(tempDiv5);

            tempDiv.append(tempDiv2);

            document.getElementById("room_dis_child").append(tempDiv);



            rooms2.splice(yye - 1, 2);
        }



    }


    for (var i = 0; i < rooms2.length; i += 2) {


        let tempDiv = createElement({ "class": "room_card_con", "attributes": { "data-roomid": rooms2[i + 1] }, "listeners": {} });

        let tempDiv2 = createElement({ "class": "room_card", "attributes": {}, "listeners": {} });


        let tempDiv3 = createElement({ "class": "room_text", "attributes": {}, "listeners": {}, "innerText": rooms2[i] });

        let tempDiv4 = createElement({
            "class": "room_card_delete", "attributes": { "data-roomid": rooms2[i + 1] }, "listeners": {
                "click": function () {
                    ini_api.delete_room(this);
                }
            }
        });

        let tempDiv5 = createElement({ "class": "draggable_room", "attributes": {}, "listeners": {} });


        tempDiv2.append(tempDiv3);
        tempDiv2.append(tempDiv4);
        tempDiv2.append(tempDiv5);

        tempDiv.append(tempDiv2);

        document.getElementById("room_dis_child").append(tempDiv);



    }


}


function updateRoomAdd() {

    rooms2 = rooms.slice(0);
    document.getElementById("room_add_child").innerHTML = `<div class="room_card_con" roomId="0">

    <div class="room_card"><div class="room_text">Recently Watched</div><div class="draggable_room add_to_room"  id="add_to_room" data-roomId="0"></div></div>

    </div>`;

    document.getElementById("add_to_room").onclick = function () {
        ini_api.change_state(this);
    };


    for (var i = 0; i < rooms_order.length; i++) {

        let yye = rooms2.indexOf(rooms_order[i]);
        if (yye > -1) {


            let tempDiv = createElement({ "class": "room_card_con", "attributes": { "data-roomid": rooms2[yye + 0] }, "listeners": {} });

            let tempDiv2 = createElement({ "class": "room_card", "attributes": {}, "listeners": {} });


            let tempDiv3 = createElement({ "class": "room_text", "attributes": {}, "listeners": {}, "innerText": rooms2[yye - 1] });


            let tempDiv4 = createElement({
                "class": "draggable_room add_to_room", "attributes": { "data-roomid": rooms2[yye + 0] }, "listeners": {
                    "click": function () {
                        ini_api.change_state(this);
                    }
                }
            });


            tempDiv2.append(tempDiv3);
            tempDiv2.append(tempDiv4);

            tempDiv.append(tempDiv2);

            document.getElementById("room_add_child").append(tempDiv);



            rooms2.splice(yye - 1, 2);
        }



    }


    for (var i = 0; i < rooms2.length; i += 2) {


        let tempDiv = createElement({ "class": "room_card_con", "attributes": { "data-roomid": rooms2[i + 1] }, "listeners": {} });

        let tempDiv2 = createElement({ "class": "room_card", "attributes": {}, "listeners": {} });


        let tempDiv3 = createElement({ "class": "room_text", "attributes": {}, "listeners": {}, "innerText": rooms2[i] });


        let tempDiv4 = createElement({
            "class": "draggable_room add_to_room", "attributes": { "data-roomid": rooms2[i + 1] }, "listeners": {
                "click": function () {
                    ini_api.change_state(this);
                }
            }
        });


        tempDiv2.append(tempDiv3);
        tempDiv2.append(tempDiv4);

        tempDiv.append(tempDiv2);

        document.getElementById("room_add_child").append(tempDiv);




    }




}

function addCustomRoom() {

    rooms2 = rooms.slice(0);
    document.getElementById("custom_rooms").innerHTML = "";

    for (var i = 0; i < rooms_order.length; i++) {

        let yye = rooms2.indexOf(rooms_order[i]);
        if (yye > -1) {



            let tempDiv = createElement({ "class": "room_con_1", "attributes": {}, "listeners": {} });

            let tempDiv2 = createElement({ "class": "title_a_2", "attributes": { "data-hello": `""""""` }, "listeners": {}, "innerText": rooms2[yye - 1] });


            let tempDiv3 = createElement({ "class": "card_con_2", "id": `room_${rooms2[yye + 0]}`, "attributes": {}, "listeners": {} });



            tempDiv.append(tempDiv2);
            tempDiv.append(tempDiv3);



            document.getElementById("custom_rooms").append(tempDiv);







            rooms2.splice(yye - 1, 2);

        }



    }


    for (var i = 0; i < rooms2.length; i += 2) {



        let tempDiv = createElement({ "class": "room_con_1", "attributes": {}, "listeners": {} });

        let tempDiv2 = createElement({ "class": "title_a_2", "attributes": { "data-hello": `">"""""` }, "listeners": {}, "innerText": rooms2[i] });


        let tempDiv3 = createElement({ "class": "card_con_2", "id": `room_${rooms2[i + 1]}`, "attributes": {}, "listeners": {} });



        tempDiv.append(tempDiv2);
        tempDiv.append(tempDiv3);



        document.getElementById("custom_rooms").append(tempDiv);

    }
}

function getUserInfo() {

    ini_api.get_userinfo();


}





function close_search() {
    document.getElementsByClassName('searchInput')[0].style.width = '0px';
    document.getElementById('s_c').style.display = 'none';
    document.getElementsByClassName('searchInput')[0].style.paddingLeft = '0px';
    document.getElementsByClassName('searchButton')[0].onclick = function () { };
    event.stopPropagation();
}
function fix_title(x) {
    try {
        x = x.split("-");
        temp = "";
        for (var i = 0; i < x.length; i++) {
            temp = temp + x[i].substring(0, 1).toUpperCase() + x[i].substring(1) + " ";
        }
        return temp;
    } catch (err) {
        return x;
    }
}

function img_url(x) {
    try {

        x = x.replace("file:", "https:");

    }
    catch (err) {

    }
    return x;
}

function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}


function search() {
    window.location = '../search/index.html?query=' + document.getElementById('search_x').value;
}


if (true) {
    var a = document.getElementsByClassName("card_con");
    for (var i = 0; i < a.length; i++) {

        a[i].style.display = "block";
    }

    var a = document.getElementsByClassName("title_a");
    for (var i = 0; i < a.length; i++) {

        a[i].style.display = "inline-table";
    }







    function hide_dom(x) {
        x.parentElement.style.display = "none";
    }



    function hide_dom2(x) {
        if (last_order != getCurrentOrder()) {
            if (confirm("Are you sure you want to close without saving?")) {
                x.parentElement.style.display = "none";


            }
        } else {
            x.parentElement.style.display = "none";


        }
    }




    function getCurrentOrder() {

        let elems = document.getElementById("room_dis_child").getElementsByClassName("room_card_con");

        let room_temp = [];

        for (var i = 0; i < elems.length; i++) {
            room_temp.push(parseInt(elems[i].getAttribute("data-roomid")));
        }
        room_temp = room_temp.join(',');

        return room_temp;

    }



    function add_room_open() {
        document.getElementById("room_con").style.display = "flex";
    }




    function show_room_open() {
        updateRoomDis();
        last_order = getCurrentOrder();
        document.getElementById("room_dis").style.display = "flex";

    }




    var api = {
        add_room: () => {
            let data_in = document.getElementById("pass_f").value;
            document.getElementById("room_con").style.display = 'none';
            window.parent.apiCall("POST", { "action": 10, "username": username, "room": data_in }, getUserInfo);
        },

        delete_room: (domelem) => {
            if (confirm("Are you sure you want to delete this card?")) {
                let room_id = domelem.getAttribute("data-roomid");
                window.parent.apiCall("POST", { "username": username, "action": 12, "id": room_id }, getUserInfo);


            }


        },

        change_order: () => {

            let room_temp = getCurrentOrder();
            window.parent.apiCall("POST", { "action": 13, "username": username, "order": room_temp }, getUserInfo);

        },

        change_state: (domelem) => {
            let state = domelem.getAttribute("data-roomid");
            window.parent.apiCall("POST", { "username": username, "action": 7, "name": selectedShow, "state": state }, getUserInfo);

        },

        change_image_card: (name, domelem) => {


            var img_url_prompt = prompt("Enter the URL of the image", domelem.getAttribute("data-bg1"));
            var main_url_prompt = prompt("Enter the URL of the page", domelem.getAttribute("data-main-link"));

            if (img_url_prompt != "" && img_url_prompt != null && img_url_prompt != undefined) {
                img_url_prompt = img_url_prompt;


                window.parent.apiCall("POST", { "username": username, "action": 9, "name": name, "img": img_url_prompt }, getUserInfo, [domelem, img_url_prompt]);




            }


            if (main_url_prompt != "" && main_url_prompt != null && main_url_prompt != undefined) {

                window.parent.apiCall("POST", { "username": username, "action": 14, "name": name, "url": main_url_prompt }, change_url_callback, [domelem]);




            }




        },

        delete_card: (x, domelem) => {



            if (confirm("Are you sure you want to delete this show from your watched list?")) {
                window.parent.apiCall("POST", { "username": username, "action": 6, "name": x }, delete_card_callback, [domelem]);



            }

        },


        get_userinfo: () => {
            permNoti = sendNoti([0, null, "Message", "Syncing with the server..."]);

            window.parent.apiCall("POST", { "username": username, "action": 4 }, get_userinfo_callback, []);


        }

    }


    function change_image_callback(x, y, z) {

        x.setAttribute("data-bg1", z.data.image);
        x.parentElement.parentElement.parentElement.style.backgroundImage = "url('" + z.data.image + "')";


    }

    function change_url_callback(x, z) {

        x.setAttribute("data-main-link", z.data.url);
        x.parentElement.parentElement.getElementsByClassName("s_card_title_main")[0].href = z.data.url

    }
    function delete_card_callback(x) {
        x.parentElement.parentElement.parentElement.remove();
    }

    function get_userinfo_callback(x, y, z) {


        document.getElementById("recently").innerHTML = "";
        document.getElementById("room_dis_child").innerHTML = "";
        document.getElementById("room_add_child").innerHTML = "";
        let a = x.data;

        rooms = a[1].slice(0);
        let data = a[0];


        rooms_order = [];
        if (a[2].length > 0) {
            rooms_order = a[2][0].split(",");

            for (var i = 0; i < rooms_order.length; i++) {
                rooms_order[i] = parseInt(rooms_order[i]);

            }
        }






        updateRoomDis();
        updateRoomAdd();
        addCustomRoom();

        document.getElementById("recently").style.display = "block";
        for (var i = 0; i < data.length; i++) {
            let domToAppend;

            if (document.getElementById(`room_${data[i][4]}`)) {
                domToAppend = document.getElementById(`room_${data[i][4]}`);
            } else {
                domToAppend = document.getElementById('recently');
            }

            let tempDiv = createElement({ "class": "s_card", "attributes": {}, "listeners": {} });
            tempDiv.style.backgroundImage = `url(${encodeURI(img_url(data[i][2]))})`;

            let tempDiv1 = createElement({ "class": "s_card_bg", "attributes": {}, "listeners": {} });
            let tempDiv2 = createElement({ "class": "s_card_title", "attributes": {}, "listeners": {} });


            let tempDiv3 = document.createElement("a");
            tempDiv3.className = "s_card_title_main";
            tempDiv3.textContent = fix_title(data[i][0]);
            tempDiv3.href = "../episode/index.html" + data[i][5];

            let tempDiv4 = createElement({ "class": "card_ep", "attributes": {}, "listeners": {}, "innerText": `Episode ${data[i][1]}` });
            let tempDiv5 = createElement({
                "class": "s_card_delete", "attributes": {
                    "data-showname": data[i][0]

                }, "listeners": {
                    "click": function () {
                        ini_api.delete_card(this.getAttribute("data-showname"), this);
                    }
                }
            });

            let tempDiv6 = createElement({
                "class": "s_card_play", "attributes": {
                    "data-href": data[i][3]
                }, "listeners": {
                    "click": function () {
                        window.parent.postMessage({ "action": 4, "data": this.getAttribute("data-href") }, "*");
                    }
                }, "element": "div"
            });

            let tempDiv7 = createElement({ "class": "card_menu", "attributes": {}, "listeners": {} });

            let tempDiv8 = createElement({
                "class": "card_menu_item card_menu_icon_add", "attributes": {}, "listeners": {
                    "click": function () {
                        open_menu(this);
                    }
                }
            });

            let tempDiv9 = createElement({
                "class": "card_menu_item card_menu_icon_delete", "attributes": {
                    "data-showname": data[i][0]
                }, "listeners": {
                    "click": function () {
                        ini_api.delete_card(this.getAttribute("data-showname"), this);
                    }
                }
            });

            let tempDiv10 = createElement({
                "class": "card_menu_item card_menu_icon_image", "attributes": {
                    "data-bg1": data[i][2],
                    "data-main-link": data[i][5],
                    "data-showname": data[i][0]
                }, "listeners": {
                    "click": function () {
                        ini_api.change_image_card(this.getAttribute("data-showname"), this);
                    }
                }
            });

            let tempDiv11 = createElement({
                "class": "card_menu_item card_menu_icon_watched", "attributes": {
                    "data-showname": data[i][0]
                }, "listeners": {
                    "click": function () {
                        watched_card(this);
                    }
                }
            });

            tempDiv7.append(tempDiv8);
            tempDiv7.append(tempDiv9);
            tempDiv7.append(tempDiv10);
            tempDiv7.append(tempDiv11);
            tempDiv2.append(tempDiv3);
            tempDiv2.append(tempDiv4);

            tempDiv1.append(tempDiv2);
            tempDiv1.append(tempDiv5);
            tempDiv1.append(tempDiv6);
            tempDiv1.append(tempDiv7);
            tempDiv.append(tempDiv1);

            domToAppend.append(tempDiv);

        }


        last_order = getCurrentOrder();

        if (permNoti != null) {
            if (permNoti.noti) {
                permNoti.noti.remove();

            }
        }




    }

    var ini_api = api;


    if (config.local || localStorage.getItem("offline") === 'true') {
        getUserInfo();
    }
    else {
        window.parent.postMessage({ "action": 20, data: "" }, "*");
    }
    new Sortable(document.getElementById("room_dis_child"), {
        animation: 150,
        handle: '.draggable_room',
        ghostClass: 'room_card_ghost'
    });


    let verURL = "https://raw.githubusercontent.com/enimax-anime/enimax/main/version.json";

    if (config.chrome) {
        verURL = "https://raw.githubusercontent.com/enimax-anime/enimax-chrome-extension/main/version.json";
    }

    fetch(verURL).then((x) => x.json())
        .then(function (x) {
            let curTime = parseInt((new Date()).getTime() / 1000);
            let lastUpdate = parseInt(localStorage.getItem("lastUpdate"));

            let bool;
            if (isNaN(lastUpdate)) {
                bool = true;
            } else {
                bool = (curTime - lastUpdate) > 86400;   // 1 day
            }

            if (x.version != localStorage.getItem("version") && bool) {
                sendNoti([0, "", "New update!", x.message]);
                localStorage.setItem("lastUpdate", curTime);
            }
        });

}



function applyTheme() {
    var themeColorL = localStorage.getItem("themecolor");
    if (themeColorL && themeColorL != undefined && themeColorL != null) {
        document.documentElement.style.setProperty('--theme-color', themeColorL);
    } else {
        document.documentElement.style.setProperty('--theme-color', "#4b4bc2");

    }

}

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
        window.parent.postMessage({ "action": 402 }, "*");
        applyTheme();
    } else {

    }
}

applyTheme();