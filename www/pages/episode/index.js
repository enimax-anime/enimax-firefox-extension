if (config.local || localStorage.getItem("offline") === 'true') {
    ini();
} else {
    window.parent.postMessage({ "action": 20 }, "*");
}




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


function checkIfExists(localURL){
    return (new Promise(function (resolve, reject){
        let timeout = setTimeout(function(){
            reject("timeout");
        },1000);
        console.log(localURL);
        window.parent.makeLocalRequest("GET", `${localURL}`).then(function(x){
            clearTimeout(timeout);
            resolve(x);
        }).catch(function(err){
            clearTimeout(timeout);
            reject(err);

        });
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
            var a = document.getElementsByClassName("card_con");
            var d_title = [data.description, ""];
            document.getElementById("updateImage").style.display = "inline-table";
            document.getElementById("copyLink").style.display = "inline-table";
            document.getElementById("copyLink").onclick = function () {
                window.prompt("Copy it from below:", location.search);
            };
            document.getElementById("updateImage").onclick = function () {
                window.parent.apiCall("POST", { "username": username, "action": 9, "name": data.mainName, "img": data.image }, (x) => {
                    sendNoti([2, "", "Alert", "Done!"]);

                });
            };


            for (var i = 0; i < 2; i++) {
                a[i].style.whiteSpace = "normal";
                a[i].style.display = "block";
                a[i].innerHTML = "<center>" + d_title[i] + "</center>";

            }


            var a = document.getElementsByClassName("title_a");
            var d_title = [data.name, "Episodes"];
            for (var i = 0; i < 2; i++) {
                a[i].innerHTML = d_title[i];
                a[i].style.display = "inline-table";
                a[i].style.marginTop = "0";
            }



            let new_img = document.createElement("img");
            new_img.className = "img_1";
            new_img.src = data.image;

            document.getElementById("con_11").prepend(new_img);
            animeEps = data.episodes;

            let epCon = document.getElementsByClassName("card_con")[1];
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
                        await checkIfExists(`/${data.mainName}/${btoa(normalise(trr))}/.downloaded`);
                        tempDiv4.className = 'episodesDownloaded';
                        tempDiv4.onclick = function () {
                            window.parent.removeDirectory(`/${data.mainName}/${btoa(normalise(trr))}/`).then(function(){
                                if(downloaded){
                                    tempDiv.remove();
                                }else{
                                    tempDiv4.className ='episodesDownload';
                                    tempDiv4.onclick = function () {
                                        window.parent.postMessage({ "action": 403, "data": this.getAttribute("data-url"), "anime": data }, "*");
                    
                                    };
                                }
                            }).catch(function(err){
                                alert("Error deleting the files.");
                            });
                        }
                        
                        if(downloaded){
                            let localQuery = encodeURIComponent(`/${data.mainName}/${btoa(normalise(trr))}`);
                            tempDiv2.onclick = function () {
                                window.parent.postMessage({ "action": 4, "data": `?watch=${localQuery}` }, "*");
                            };
                        }
                        check = true;

                    }catch(err){
                        if(downloadQueue.isInQueue(downloadQueue, animeEps[i].link)){
                            tempDiv4.className ='episodesLoading';
                        }

                    }
               
                }

                
                if(!config.chrome){
                    tempDiv.append(tempDiv4);
                }

                if(check || !downloaded || config.chrome){
                    epCon.append(tempDiv);
                }
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

applyTheme();