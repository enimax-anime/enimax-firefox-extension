if (config.local || localStorage.getItem("offline") === 'true') {
    ini();
} else {
    window.parent.postMessage({ "action": 20 }, "*");
}

let lastScrollPos;
let scrollDownTopDOM = document.getElementById("scrollDownTop");





let scrollElem = document.getElementById("con_11");
scrollElem.addEventListener("scroll", function(){
    if(lastScrollPos){
        if(lastScrollPos - scrollElem.scrollTop > 0){
            scrollDownTopDOM.className = "scrollTopDOM";
        }else{
            scrollDownTopDOM.className = "scrollBottomDOM";
            

        }
    }
    lastScrollPos = scrollElem.scrollTop;
    
},{
    "passive" : true
});



scrollDownTopDOM.onclick = function(){
    if(scrollDownTopDOM.className == "scrollTopDOM"){
        scrollElem.scrollTop = 0;
    } else if(scrollDownTopDOM.className == "scrollBottomDOM"){
        scrollElem.scrollTop = scrollElem.scrollHeight;
    }
};


function normalise(x){
    x = x.replace("?watch=","");
    x = x.split("&engine=")[0];
    return x;
}

window.onmessage = function (x) {
    if (parseInt(x.data.action) == 200) {
        token = x.data.data;
        ini();
    }

};

let token;

let name_name;
function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}




function checkIfExists(localURL, dList, dName){
    return (new Promise(function (resolve, reject){
        if(dList.includes(dName)){

            let timeout = setTimeout(function(){
                reject("timeout");
            },1000);
            window.parent.makeLocalRequest("GET", `${localURL}`).then(function(x){
                clearTimeout(timeout);
                resolve(x);
            }).catch(function(err){
                clearTimeout(timeout);
                reject("notdownloaded");

            });
        }else{
            reject("notinlist");
        }
    }));
        
    
}

function ini() {
    let downloadQueue = window.parent.returnDownloadQueue();

    var username, anime_data;

    if (location.search.indexOf("?watch=/") > -1 || localStorage.getItem("offline") === 'true') {
        anime_data = {};

        var main_url = location.search.replace("?watch=/", "");

        var currentEngine;
        let temp3 = main_url.split("&engine=");
        if (temp3.length == 1) {
            currentEngine = extensionList[0];
        } else {
            currentEngine = parseInt(temp3[1]);
            currentEngine = extensionList[currentEngine];
        }


        async function processEpisodeData(data, downloaded, main_url){

            let currentLink = '';
            if(localStorage.getItem("currentLink")){
                currentLink = localStorage.getItem("currentLink");
            }

            let scrollTo;
            var a = document.getElementsByClassName("card_con");
            document.getElementById("updateImage").style.display = "inline-block";
            document.getElementById("copyLink").style.display = "inline-block";
            document.getElementById("updateLink").style.display = "inline-block";
            document.getElementById("copyImage").style.display = "inline-block";


            document.getElementById("copyLink").onclick = function () {
                window.prompt("Copy it from below:", location.search);
            };

            document.getElementById("copyImage").onclick = function () {
                window.prompt("Copy it from below:", data.image);
            };

            document.getElementById("updateLink").onclick = function () {
                window.parent.apiCall("POST",  { "username": username, "action": 14, "name": data.mainName, "url": location.search }, (x) => {
                    sendNoti([2, "", "Alert", "Done!"]);

                });
            };

            
            document.getElementById("updateImage").onclick = function () {
                window.parent.apiCall("POST", { "username": username, "action": 9, "name": data.mainName, "img": data.image }, (x) => {
                    sendNoti([2, "", "Alert", "Done!"]);
                });
            };

            let downloadedList = [];
            if(!config.chrome){
                try{
                    downloadedList = await window.parent.listDir(data.mainName);
                    let tempList = [];
                    for(let i = 0; i < downloadedList.length; i++){
                        if(downloadedList[i].isDirectory){
                            tempList.push(downloadedList[i].name);
                        }
                    }

                    downloadedList = tempList;
                }catch(err){
                    console.log(err);
                }
                
            }




            
            document.getElementById("imageTitle").innerText = data.name.trim();
            document.getElementById("imageDesc").innerText = data.description.trim();

            document.getElementById("imageMain").style.backgroundImage = `url("${data.image}")`;
            animeEps = data.episodes;

            let epCon = document.getElementById("epListCon");
            for (var i = 0; i < animeEps.length; i++) {
                
                let trr = animeEps[i].link;
                
                let tempDiv = document.createElement("div");
                tempDiv.className = 'episodesCon';
                tempDiv.setAttribute('data-url', animeEps[i].link);


                let tempDiv2 = document.createElement("div");
                tempDiv2.className = 'episodesPlay';

                tempDiv2.onclick = function () {
                    window.parent.postMessage({ "action": 4, "data": trr }, "*");
                };

                let tempDiv4 = document.createElement("div");
                tempDiv4.className = 'episodesDownload';
                tempDiv4.setAttribute('data-url', animeEps[i].link);
                tempDiv4.setAttribute('data-title', animeEps[i].title);

                tempDiv4.onclick = function () {
                    window.parent.postMessage({ "action": 403, "data": this.getAttribute("data-url"), "anime": data, "mainUrl" : main_url, "title" :  this.getAttribute("data-title")}, "*");
                    tempDiv4.className = 'episodesLoading';

                };






                let tempDiv3 = document.createElement("div");
                tempDiv3.className = 'episodesTitle';
                tempDiv3.innerText = animeEps[i].title;



                tempDiv.append(tempDiv2);
                tempDiv.append(tempDiv3);
                let check = false;
                if(!config.chrome){
                
                    try{
                        await checkIfExists(`/${data.mainName}/${btoa(normalise(trr))}/.downloaded`, downloadedList, btoa(normalise(trr)));
                        tempDiv4.className = 'episodesDownloaded';
                        tempDiv4.onclick = function () {
                            window.parent.removeDirectory(`/${data.mainName}/${btoa(normalise(trr))}/`).then(function(){
                                if(downloaded){
                                    tempDiv.remove();
                                }else{
                                    tempDiv4.className ='episodesDownload';
                                    tempDiv4.onclick = function () {
                                    tempDiv4.className ='episodesLoading';

                                        window.parent.postMessage({ "action": 403, "data": tempDiv4.getAttribute("data-url"), "anime": data, "mainUrl" : main_url, "title" :  tempDiv4.getAttribute("data-title")}, "*");

                    
                                    };
                                }
                            }).catch(function(err){
                                alert("Error deleting the files.");
                            });
                        }
                        
                        
                        check = true;

                    }catch(err){
                        if(downloadQueue.isInQueue(downloadQueue, animeEps[i].link)){
                            tempDiv4.className ='episodesLoading';
                            check = true;

                        }else if(err == "notdownloaded"){

                            
                            check = true;

                            tempDiv4.className ='episodesBroken';
                        }

                    }
               
                }

                if(downloaded){
                    let localQuery = encodeURIComponent(`/${data.mainName}/${btoa(normalise(trr))}`);
                    tempDiv2.onclick = function () {
                        window.parent.postMessage({ "action": 4, "data": `?watch=${localQuery}` }, "*");
                    };
                }
                if(!config.chrome){
                    tempDiv.append(tempDiv4);
                }

                if(check || !downloaded || config.chrome){
                    epCon.append(tempDiv);
                    if(trr == currentLink){
                        scrollTo = tempDiv;
                        tempDiv.style.backgroundColor = "rgba(36,36,36,1)";
                    }
                }else{
                    try{
                        tempDiv.remove();
                    }catch(err){

                    }
                }
            }


            try{
                if(!downloaded && localStorage.getItem("scrollBool") !== "false"){
                    scrollTo.scrollIntoView();
                }
            }catch(err){
                
            }
            let formation = {};
            formation.method = "POST";


            if (!("image" in data) || data.image == undefined || data.image == null || data.image == "") {
                data.image = "https://raw.githubusercontent.com/enimax-anime/enimax/main/www/assets/images/placeholder.jpg";
            }

            window.parent.apiCall("POST", { "username": username, "action": 5, "name": data.mainName, "img": data.image, "url": location.search }, (x) => { });

        }


        if(localStorage.getItem("offline") === 'true'){
            window.parent.makeLocalRequest("GET", `/${main_url.split("&downloaded")[0]}/info.json`).then(function (data) {
                let temp = JSON.parse(data);
                temp.data.episodes = temp.episodes;
                processEpisodeData(temp.data, true, main_url);

            }).catch(function (err) {
                console.error(err);
                alert(err);
            });

        }else{
            currentEngine.getAnimeInfo(main_url).then(function (data) {
                processEpisodeData(data, false, main_url);

            }).catch(function (err) {
                console.error(err);

                alert(err);
            });
        }

        



    }
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