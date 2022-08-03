var socket;
let frameHistory = [];
var token;

function setURL(url){
    document.getElementById("frame").style.opacity = "0";
    setTimeout(function(){
        document.getElementById("frame").contentWindow.location = url;
        setTimeout(function(){
            document.getElementById("frame").style.opacity = "1";
            

            
        },200);
    },200);
}

function listDir(path) {

    return (new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(`${cordova.file.externalDataDirectory}${path}`,
            function (fileSystem) {
                var reader = fileSystem.createReader();
                reader.readEntries(
                    function (entries) {
                        resolve(entries);
                    },
                    function (err) {
                        reject(err);

                    }
                );
            }, function (err) {
                reject(err);
            }
        );
    }));

}

async function saveAs(fileSys, fileName, blob) {
    fileSys.getFile(fileName, { create: true, exclusive: false }, function (file) {

        file.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (e) {

            };

            fileWriter.onerror = function (e) {
                console.error(e);
            };


            fileWriter.write(blob);

        }, (err) => {
            console.error(err);
        });


    }, function (x) {
        console.log(x);
    });
}

async function saveDexieToLocal() {
    let c = await offlineDB.vid.count();

    if (c > 10) {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fs) {
            offlineDB.export().then(function (data) {
                console.log(data);
                saveAs(fs, `offlineDB-${(new Date()).getTime()}.json`, data);
                localStorage.setItem("lastBackup", (new Date()).getTime());

            }).catch(function (err) {

            });




        }, function (x) {
            console.log(x);
        });
    }
}


class downloadQueue {
    constructor() {
        this.queue = [];
        this.doneQueue = [];

        this.pause = localStorage.getItem("downloadPaused") === 'true';
        this.init();

        let self = this;

        setInterval(function () {
            self.emitPercent(self);
        }, 1000);
    }

    emitPercent(self) {
        try {
            let currentHead = self.queue[0].downloadInstance;
            let downloadPercent = currentHead.downloaded / currentHead.total;
            downloadPercent = Math.floor(downloadPercent * 10000) / 100;
            document.getElementById("frame").contentWindow.postMessage({
                "action": "percentageUpate",
                "data": downloadPercent
            }, "*");

        } catch (err) {

        }


    }

    isInQueue(self, url) {
        for (var i = 0; i < self.queue.length; i++) {
            if (self.queue[i].data == url) {
                return true;
            }
        }

        return false;

    }

    async init() {
        try {
            let temp2 = (await downloadedDB.keyValue.get({ "key": "localQueue" })).value;
            let temp = JSON.parse(temp2);

            console.log(temp, temp2);

            console.log(JSON.parse(temp2));
            this.queue = temp ? temp : [];
        } catch (err) {
            console.error(err);
        }

        try {
            let temp = JSON.parse(
                (await downloadedDB.keyValue.get({ "key": "localDoneQueue" })).value

            );

            console.log(temp);

            this.doneQueue = temp ? temp : [];
        } catch (err) {
            console.error(err);

        }

        this.startDownload(this);
    }
    async removeFromDoneQueue(name) {
        if (this.doneQueue.length == 0) {
            return;
        }

        let curElem;
        let curElemIndex = 0;
        for (let i = 0; i < this.doneQueue.length; i++) {
            if (this.doneQueue[i].data == name) {
                curElem = this.doneQueue[i];
                curElemIndex = i;
                break;
            }
        }

        if (curElem) {
            this.doneQueue.splice(curElemIndex, 1);
            await this.updateLocalDoneQueue(this);
        }
    }

    deleteFilesHead(self){

        try{
            let curElem = self.queue[0];
            let temp3 = curElem.data.replace("?watch=", "");
            temp3 = temp3.split("&engine=");
            window.parent.removeDirectory(`/${curElem.anime.mainName}/${btoa(temp3[0])}/`).then(function(){
                
            }).catch(function(){
                alert("Could not delete the file. You have to delete it manually. Error 1000");
                
            });
        }catch(err){
            alert("Could not delete the file. You have to delete it manually.");
        }
    }
    async removeFromQueue(name) {
        console.log(name);
        if (this.queue.length == 0) {
            return;
        }
        let currentHead = this.queue[0];
        let curElem;
        let curElemIndex = 0;
        for (let i = 0; i < this.queue.length; i++) {
            console.log(this.queue[i].data, name);

            if (this.queue[i].data == name) {
                curElem = this.queue[i];
                curElemIndex = i;
                break;
            }
        }
        console.log(curElemIndex, curElem, curElem == currentHead, currentHead);

        if (curElem) {
            if (curElem == currentHead) {
                this.deleteFilesHead(this);
                try {
                    if (!("downloadInstance" in currentHead)) {
                        currentHead.downloadInstance = {};
                    }
                    currentHead.downloadInstance.pause = true;
                    currentHead.downloadInstance.message = "Cancelled by the user.";
                    this.error(this);

                } catch (err) {

                }
            } else {
                this.queue.splice(curElemIndex, 1);
                await this.updateLocalStorage(this);
            }
        }
    }
    async add(data, anime, mainUrl, title) {
        let flag = true;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].data == data) {
                alert("This is already in the queue");
                flag = false;
                break;
            }
        }

        if ("episodes" in anime) {
            delete anime["episodes"];
        }

        if (flag) {
            this.queue.push({
                "data": data,
                "anime": anime,
                "mainUrl": mainUrl,
                "title": title,
            });
            if (this.queue.length == 1) {
                this.startDownload(this);
            }

            await this.updateLocalStorage(this);
        }
    }

    pauseIt(self) {
        if (self.queue.length == 0) {
            return false;
        } else {
            self.queue[0].downloadInstance.pause = true;
            self.pause = true;
            localStorage.setItem("downloadPaused", "true");
            return true;
        }
    }

    playIt(self) {
        if (self.queue.length == 0) {
            return false;
        } else {
            self.pause = false;
            self.startDownload(self);
            localStorage.setItem("downloadPaused", "false");
            return true;
        }
    }

    removeActive(self) {
        if (self.queue.length !== 0) {
            if ("downloadInstance" in self.queue[0]) {
                self.queue[0].downloadInstance.pause = true;

            }
            self.deleteFilesHead(self);
            self.queue = [];
            self.updateLocalStorage(self);
        }
    }

    removeDone(self) {
        if (self.doneQueue.length !== 0) {
            self.doneQueue = [];
            self.updateLocalDoneQueue(self);
        }
    }
    async updateLocalStorage(self) {
        document.getElementById("frame").contentWindow.postMessage({
            "action": "activeUpdate",
        }, "*");


        let tempLen = await (downloadedDB.keyValue.where({ "key": "localQueue" })).toArray();

        if (tempLen.length == 0) {
            await downloadedDB.keyValue.add({ "key": "localQueue", "value": JSON.stringify(self.queue) });
        } else {
            await downloadedDB.keyValue.where({ "key": "localQueue" }).modify({ "value": JSON.stringify(self.queue) });

        }

    }

    async updateLocalDoneQueue(self) {
        document.getElementById("frame").contentWindow.postMessage({
            "action": "doneUpdate",
        }, "*");


        let tempLen = await (downloadedDB.keyValue.where({ "key": "localDoneQueue" })).toArray();

        if (tempLen.length == 0) {
            await downloadedDB.keyValue.add({ "key": "localDoneQueue", "value": JSON.stringify(self.doneQueue) });
        } else {
            await downloadedDB.keyValue.where({ "key": "localDoneQueue" }).modify({ "value": JSON.stringify(self.doneQueue) });

        }

    }

    startDownload(self) {
        if (self.pause) {
            return;
        }


        if (self.queue.length == 0) {
            return;
        }
        let currentEngine;
        let engineNum;
        let curQueueElem = self.queue[0];
        console.log(curQueueElem, self);

        let temp3 = curQueueElem.data.replace("?watch=", "");
        temp3 = temp3.split("&engine=");
        if (temp3.length == 1) {
            currentEngine = wco;
            engineNum = 0;
        } else {
            currentEngine = parseInt(temp3[1]);
            engineNum = currentEngine;
            if (currentEngine == 0) {
                currentEngine = extensionList[0];
            } else {
                currentEngine = extensionList[currentEngine];
            }
        }
        currentEngine.getAnimeInfo(curQueueElem.mainUrl).then(function (episodes) {
            if (self.pause) {
                return;
            }
            currentEngine.getLinkFromUrl(temp3[0]).then(function (temp) {
                if (self.pause) {
                    return;
                }
                temp.ogURL = temp3[0];
                temp.engine = engineNum;
                curQueueElem.downloadInstance = new DownloadVid(temp, curQueueElem.anime, () => { self.done(self) }, () => { self.error(self) }, episodes.episodes, self.pause);
            }).catch(function (x) {
                curQueueElem.downloadInstance = {}
                curQueueElem.downloadInstance.message = "Couldn't get the link";
                self.error(self);
            });
        }).catch(function (err) {
            console.log(err);
            curQueueElem.downloadInstance = {}
            curQueueElem.downloadInstance.message = "Couldn't get the episode list.";
            self.error(self);
        });
    }

    async error(self) {
        self.doneQueue.push(await self.remove(self));
        self.updateLocalDoneQueue(self);
        self.startDownload(self);
    }

    async done(self) {
        self.doneQueue.push(await self.remove(self));
        self.updateLocalDoneQueue(self);

        self.startDownload(self);
    }
    async remove(self) {
        let temp = self.queue.shift();

        if ("downloadInstance" in temp) {
            temp.message = temp.downloadInstance.message;
            delete temp["downloadInstance"];
        }
        await self.updateLocalStorage(self);
        return temp;

    }
}

let downloadQueueInstance;

function returnDownloadQueue() {
    return downloadQueueInstance;
}

let notiCount = 0;
document.getElementById("frame").onload = function () {
    document.getElementById("frame").style.opacity = 1;

    if (frameHistory.length === 0) {
        frameHistory.push(document.getElementById("frame").contentWindow.location.href);
    }
    else if (frameHistory[frameHistory.length - 1] != document.getElementById("frame").contentWindow.location.href) {
        frameHistory.push(document.getElementById("frame").contentWindow.location.href);

    }
};


function sendNoti(x) {
    console.log(x);
    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}
async function MakeCusReq(url, options) {
    return new Promise(function (resolve, reject) {
        cordova.plugin.http.sendRequest(url, options, function (response) {
            resolve(response.data);
        }, function (response) {
            reject(response.error);
        });
    });
}

async function MakeFetch(url, options) {
    return new Promise(function (resolve, reject) {
        fetch(url, options).then(response => response.text()).then((response) => {
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });
    });
}

if (config.chrome) {

    document.getElementById("player").onload = function () {
        if (document.getElementById("player").contentWindow.location.href.includes("www/fallback.html")) {
            document.getElementById("player").style.display = "none";
            document.getElementById("frame").style.height = "100%";
            document.getElementById("frame").style.display = "block";
        }
    };
} else {

}


function updateTheme() {
    try {
        document.querySelector(`meta[name="theme-color"]`).setAttribute("content", localStorage.getItem("themecolor"));
    } catch (err) {

    }
}


function makeLocalRequest(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}


function removeDirectory(url) {
    return new Promise(function (resolve, reject) {

        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fs) {
            fs.getDirectory(url, { create: false, exclusive: false }, function (directory) {
                directory.removeRecursively(function () {
                    resolve("done");
                },
                    function (err) {
                        reject(err);
                    });
            }, function (err) {
                reject(err);
            })
        }, function (err) {
            reject(err);
        });
    });
}

function exec_action(x, reqSource) {

    if (x.action == 1) {

        screen.orientation.lock(x.data).then(function () {


        }).catch(function (error) {

        });


    } else if (x.action == 2) {

        downloadFile(x);
    } else if (x.action == 3) {
        window.location = x.data;
    } else if (x.action == 5) {

        var currentEngine;
        let temp3 = x.data.split("&engine=");
        if (temp3.length == 1) {
            currentEngine = wco;
        } else {
            currentEngine = parseInt(temp3[1]);
            if (currentEngine == 0) {
                currentEngine = extensionList[0];
            } else {
                currentEngine = extensionList[currentEngine];
            }
        }
        currentEngine.getLinkFromUrl(temp3[0]).then(function (x) {
            x.action = 1;
            reqSource.postMessage(x, "*");

        }).catch(function (x) {
            x.action = 1;
            console.error(x);
            reqSource.postMessage(x, "*");

        });
    } else if (x.action == 11) {

        PictureInPicture.enter(480, 270, function (success) {

        });
    } else if (x.action == 15) {
        if (!config.chrome) {
            MusicControls.updateIsPlaying(true);
        }

    } else if (x.action == 400) {
        screen.orientation.lock("any").then(function () {

        }).catch(function (error) {

        });



        document.getElementById("player").classList.add("pop");
        document.getElementById("frame").style.height = "calc(100% - 200px)";

        document.getElementById("frame").style.display = "block";
        document.getElementById("player").style.display = "block";

    }

    else if (x.action == 401) {
        screen.orientation.lock("landscape").then(function () {

        }).catch(function (error) {

        });



        document.getElementById("player").classList.remove("pop");
        document.getElementById("frame").style.height = "100%";

        document.getElementById("frame").style.display = "none";
        document.getElementById("player").style.display = "block";

    } else if (x.action == 16) {
        if (!config.chrome) {
            MusicControls.updateIsPlaying(false);
        }
    } else if (x.action == 20) {

        let toSend;

        if (config.chrome) {
            toSend = "";
        } else {
            toSend = cordova.plugin.http.getCookieString(config.remoteWOport);
        }
        reqSource.postMessage(
            { "action": 200, "data": toSend }
            , "*");



    } else if (x.action == 403) {
        // console.log(x);
        downloadQueueInstance.add(x.data, x.anime, x.mainUrl, x.title);

    } else if (x.action == 21) {
        window.location = "login.html";



    } else if (x.action == 402) {
        updateTheme();



    } else if (x.action == 500) {

        setURL(x.data);
        

    } else if (x.action == 22) {
        window.location = "reset.html";



    } else if (x.action == 26) {
        window.location = "settings.html";



    } else if (x.action == 12) {
        if (!config.chrome) {

            var showName = x.nameShow.split("-");

            for (var i = 0; i < showName.length; i++) {
                let temp = showName[i];
                temp = temp.charAt(0).toUpperCase() + temp.slice(1);
                showName[i] = temp;

            }

            x.nameShow = showName.join(" ");

            MusicControls.create({
                track: x.nameShow,
                artist: "Episode " + x.episode,
                cover: 'anime.png',

                isPlaying: true,							// optional, default : true
                dismissable: true,							// optional, default : false


                hasPrev: x.prev,
                hasNext: x.next,
                hasClose: true,



                playIcon: 'media_play',
                pauseIcon: 'media_pause',
                prevIcon: 'media_prev',
                nextIcon: 'media_next',
                closeIcon: 'media_close',
                notificationIcon: 'notification'
            }, function () { }, function () { });




            function events(action) {

                const message = JSON.parse(action).message;
                switch (message) {
                    case 'music-controls-next':
                        document.getElementById("player").contentWindow.postMessage({ "action": "next" }, "*");

                        break;
                    case 'music-controls-previous':
                        document.getElementById("player").contentWindow.postMessage({ "action": "previous" }, "*");

                        break;
                    case 'music-controls-pause':
                        document.getElementById("player").contentWindow.postMessage({ "action": "pause" }, "*");

                        break;
                    case 'music-controls-play':
                        document.getElementById("player").contentWindow.postMessage({ "action": "play" }, "*");

                        break;
                    case 'music-controls-destroy':

                        break;
                    case 'music-controls-toggle-play-pause':
                        document.getElementById("player").contentWindow.postMessage({ "action": "toggle" }, "*");

                        break;

                    case 'music-controls-media-button':

                        break;
                    case 'music-controls-headset-unplugged':
                        document.getElementById("player").contentWindow.postMessage({ "action": "pause" }, "*");


                        break;
                    case 'music-controls-headset-plugged':

                        break;
                    default:
                        break;
                }
            }

            MusicControls.subscribe(events);

            MusicControls.listen();

            MusicControls.updateIsPlaying(true);
        }
    } else if (x.action == 4) {

        if (config.chrome && document.getElementById("player").contentWindow.location.href.includes("/www/fallback.html")) {

            document.getElementById("player").contentWindow.location = ("pages/player/index.html" + x.data);

        } else if(config.chrome){
            document.getElementById("player").contentWindow.location.replace("pages/player/index.html" + x.data);

        }


        if(!config.chrome){
            let checkLock = 0;

            setTimeout(function(){
                if(checkLock == 0){
                    document.getElementById("player").contentWindow.location.replace("pages/player/index.html" + x.data);
                }
            }, 100);
            screen.orientation.lock("landscape").then(function () {
            }).catch(function (error) {
            }).finally(function(){
                checkLock = 1;
                document.getElementById("player").contentWindow.location.replace("pages/player/index.html" + x.data);

            });
        }

        document.getElementById("frame").style.display = "none";
        document.getElementById("frame").style.height = "100%";
        document.getElementById("player").style.display = "block";
        document.getElementById("player").classList.remove("pop");



    }

}




window.addEventListener('message', function (x) {
    exec_action(x.data, x.source);
});




async function onDeviceReady() {
    await SQLInit();


    token = cordova.plugin.http.getCookieString(config.remoteWOport);
    // saveDexieToLocal();
    downloadQueueInstance = new downloadQueue();


    document.getElementById("frame").src = "pages/homepage/index.html";



    function onBackKeyDown() {
        try {
            if (document.getElementById("player").contentWindow.a.locked === true) {
                return;
            }
        } catch (err) {

        }
        let frameLocation = document.getElementById("frame").contentWindow.location.pathname;
        if (frameLocation.indexOf("www/pages/homepage/index.html") > -1 || (document.getElementById("player").className.indexOf("pop") == -1 && document.getElementById("player").contentWindow.location.pathname.indexOf("www/pages/player/index.html") > -1)) {
            console.log("BACK1");
            document.getElementById("player").contentWindow.location.replace("fallback.html");
            document.getElementById("player").classList.remove("pop");

            document.getElementById("player").style.display = "none";
            document.getElementById("frame").style.display = "block";

            if (frameLocation.indexOf("www/pages/homepage/index.html") > -1) {
                setURL(document.getElementById("frame").contentWindow.location);
            }

            document.getElementById("frame").style.height = "100%";
            MusicControls.destroy((x) => console.log(x), (x) => console.log(x));


            screen.orientation.lock("any").then(function () {

            }).catch(function (error) {

            });




        } else {
            console.log("BACK2");

            if (frameHistory.length > 1) {
                frameHistory.pop();
                setURL(frameHistory[frameHistory.length - 1]);
            }

        }
        // document.getElementById("frame").src = "pages/homepage/index.html";
        // document.getElementById("player").src = "";
        // document.getElementById("frame").style.display = "block";
        // document.getElementById("player").style.display = "none";
    }




    if (cordova.plugin.http.getCookieString(config.remoteWOport).indexOf("connect.sid") == -1 && config.local == false && localStorage.getItem("offline") === 'false') {
        window.location = "login.html";
    }

    document.addEventListener("backbutton", onBackKeyDown, false);


    function nope() {

    }
    window.BackgroundService.start(
        function (fn) { nope(), fn && fn() },
        function () { console.log('err') }
    )

    cordova.plugins.backgroundMode.enable();

}

document.addEventListener("deviceready", onDeviceReady, false);

if (config.chrome) {
    document.getElementById("frame").src = "pages/homepage/index.html";
}

updateTheme();