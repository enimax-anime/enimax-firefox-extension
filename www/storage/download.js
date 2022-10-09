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

function normalise(x){
    x = x.replace("?watch=","");
    x = x.split("&engine=")[0];
    return x;
}


class DownloadVid {
    constructor(vidData, data, success, error, episodes, pause) {
        this.success = success;
        this.episodes = episodes;
        this.error = error;
        this.engine = vidData.engine;
        this.notiId = ++notiCount;
        this.saved = false;
        this.check = 0;
        this.url = vidData.sources[0].url;
        this.type = vidData.sources[0].type;
        this.pause = (pause === true || pause === false) ? pause : false;
        this.vidData = vidData;
        this.mapping = [];
        this.sent = false;
        this.preferredSource = localStorage.getItem(`${this.engine}-downloadSource`);
        this.maxBufferLength = 10;

        if (vidData.sources.length > 1) {
            let names = "Choose the source (enter the number):\n";
            let flag = !this.preferredSource;


            if (flag) {
                for (let i = 0; i < vidData.sources.length; i++) {
                    names += i + ". " + vidData.sources[i].name + "\n";
                }


                while (true) {
                    let num = prompt(names);
                    if (parseInt(num) >= 0 && parseInt(num) < vidData.sources.length) {
                        this.url = vidData.sources[parseInt(num)].url;
                        localStorage.setItem(`${this.engine}-downloadSource`, vidData.sources[parseInt(num)].name);
                        this.type = vidData.sources[parseInt(num)].type;
                        vidData.sources = [vidData.sources[parseInt(num)]];
                        break;
                    }
                }
            } else {

                let flag = true;
                for (let i = 0; i < vidData.sources.length; i++) {
                    if (vidData.sources[i].name == this.preferredSource) {
                        flag = false;
                        this.url = vidData.sources[i].url;
                        localStorage.setItem(`${this.engine}-downloadSource`, vidData.sources[i].name);
                        this.type = vidData.sources[i].type;

                        vidData.sources = [vidData.sources[i]];

                        break;
                    }
                }

                if (flag) {
                    this.url = vidData.sources[0].url;
                    localStorage.setItem(`${this.engine}-downloadSource`, vidData.sources[0].name);
                    this.type = vidData.sources[0].type;
                    vidData.sources = [vidData.sources[0]];
                }
            }




        }





        this.name = data.mainName;
        this.downloaded = 0;
        this.total = 0;

        this.preferredResolution = localStorage.getItem("offlineQual") ? localStorage.getItem("offlineQual") : 720;
        this.metaData = data;
        this.baseURL = this.getBaseUrl(this.url);
        this.infoFile = null;
        this.fileDir = null;


        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(blob);
            });
        }

        let self = this;
        this.base64Image = null;
        fetch(this.metaData.image).then(x => x.blob()).then(blob => blobToBase64(blob)).then((img) => {
            self.base64Image = img;
        }).catch(function (err) {
            self.base64Image = "../../assets/images/placeholder.jpg";
        }).finally(async function () {
            await actionSQLite[5]({
                "body": {
                    "img": self.base64Image,
                    "name": self.name,
                    "url": `?watch=/${self.name}`
                }
            }, true);

            let localQuery = encodeURIComponent(`/${self.name}/${btoa(self.vidData.ogURL)}`);


            await actionSQLite[2]({
                "body": {
                    "name": vidData.nameWSeason,
                    "nameUm": vidData.name,
                    "ep": vidData.episode,
                    "cur": `?watch=${localQuery}`
                }

            }, true);




            await actionSQLite[14]({
                "body": {
                    "name": vidData.name,                    
                    "url": `?watch=/${self.name}`,
                }

            }, true);






        });


        if (this.engine == 3) {
            let socket = io(extensionList[3].config.socketURL, { transports: ["websocket"] });
            socket.on("connect", () => {
                self.sid = socket.id;
                socket.off("connect");
                this.ini();

            });
        } else {
            this.ini();
        }





    }

    getBaseUrl(url) {
        let newUrl = url.substring(0, url.indexOf("?") == -1 ? url.length : url.indexOf("?"));
        newUrl = newUrl[newUrl.length - 1] == "/" ? newUrl.substring(0, newUrl.length - 1) : newUrl;
        newUrl = newUrl.substring(0, newUrl.lastIndexOf("/") == -1 ? newUrl.length : newUrl.lastIndexOf("/")) + "/";
        return newUrl;
    }

    updateNoti(x_name, self, type = 0) {
        if(cordova.plugins.backgroundMode.isActive() === false || localStorage.getItem("hideNotification") === "true"){
            return;
        }
        let progNumDeci = (self.downloaded / self.total);
        let progNum = Math.floor(progNumDeci * 100);
        progNumDeci = Math.floor(progNumDeci*10000)/100;
        if(type == 2){            
        }else if(progNum == 100){
            x_name = "Storing the downloaded data...";
        }else{
            x_name = `${progNumDeci}% - ` + x_name;

        }

        let notiConfig = {
            id: self.id,
            title: x_name,
            progressBar: { value: progNum },
            vibrate: false,
            smallIcon : 'res://ic_launcher',
            color : "blue",
            lockscreen : true,
            wakeup : false,
            sound: false,
        };
        if (self.sent == true) {
            cordova.plugins.notification.local.update(notiConfig);
        } else {
            cordova.plugins.notification.local.schedule(notiConfig);
        }

        self.sent = true;
    }

    ini() {

        let self = this;
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fs) {
            fs.getDirectory(`${self.name}`, { create: true, exclusive: false }, function (nameDir) {
                self.nameDir = nameDir;

                nameDir.getDirectory(`${btoa(self.vidData.ogURL)}`, { create: true, exclusive: false }, function (epDir) {
                    self.fileDir = epDir;
                    if ("subtitles" in self.vidData) {
                        for (let i = 0; i < self.vidData.subtitles.length; i++) {
                            self.mapping.push(
                                {
                                    "fileName": `subtitle${i}`,
                                    "uri": self.vidData.subtitles[i].file,
                                    "downloaded": false
                                }
                            );

                            self.vidData.subtitles[i].file = cordova.file.externalDataDirectory + `${self.name}/${btoa(self.vidData.ogURL)}/subtitle${i}`;

                        }
                    }

                    epDir.getFile(`.downloaded`, { create: false, exclusive: false }, function (dir) {
                        self.errorHandler(self, "Has already been downloaded");


                    }, function (x) {

                        nameDir.getFile(`info.json`, { create: true, exclusive: false }, function (dir) {
                            self.infoFile = dir;
                            self.iniInfo(self);
                            self.updateMetaData(self);
                            if (self.type == "hls") {
                                self.startDownload(self);
                            } else {
                                self.startDownloadMP4(self);
                            }
                        }, function (x) {
                            self.errorHandler(self, "Error 1004");

                        });

                    });



                }, function (x) {
                    self.errorHandler(self, "Error 1002");

                });

            }, function (x) {
                self.errorHandler(self, "Error 1001");
            });


        }, function (x) {
            self.errorHandler(self, "Error 1000");
        });
    }

    updateMetaData(self) {
        let data = new Blob([JSON.stringify(
            {
                "data": self.vidData,
            }
        )], { "type": "text/plain" });
        self.fileDir.getFile("viddata.json", { create: true, exclusive: false }, function (file) {

            file.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {

                };

                fileWriter.onerror = function (e) {
                    self.errorHandler(self, "File error 500");
                };


                fileWriter.write(data);

            }, function () {
                self.errorHandler(self, "File error 501");

            });


        }, function (x) {
            console.error(x);
        });
    }

    iniInfo(self) {
        let data = new Blob([JSON.stringify(
            {
                "data": self.metaData,
                "episodes": self.episodes
            }
        )], { "type": "text/plain" });
        self.infoFile.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (e) {

            };

            fileWriter.onerror = function (e) {
                self.errorHandler(self, "File error 502");
            };


            fileWriter.write(data);

        }, function () {
            self.errorHandler(self, "File error 503");
        });
    }

    updateDownloadStatus(self) {
        return new Promise(function (resolve, reject) {

            let data = new Blob([JSON.stringify(
                {
                    "data": self.mapping,
                }
            )], { "type": "text/plain" });
            self.fileDir.getFile("downloaded.json", { create: true, exclusive: false }, function (file) {

                file.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function (e) {
                        resolve("done");
                    };

                    fileWriter.onerror = function (e) {
                        reject("File error 504");

                        self.errorHandler(self, "File error 504");

                    };


                    fileWriter.write(data);

                }, function () {
                    reject("File error 505");
                    self.errorHandler(self, "File error 505");

                });


            }, function (x) {
                reject("File error 600");
                self.errorHandler(self, "File error 600");
            });

        });
    }




    async makeRequest(uri, typeFunc) {
        return new Promise(function (resolve, reject) {

            const controller = new AbortController();

            let timeout = setTimeout(function () {
                controller.abort();
                reject("timeout");
            }, 60000);

            fetch(uri, { signal: controller.signal }).then((x) => {
                if (x.status >= 200 && x.status < 300) {
                    return x;
                } else {
                    throw 'Error';
                }
            }).then(typeFunc).then(function (x) {
                clearTimeout(timeout);
                resolve(x);
            }).catch(function (x) {
                clearTimeout(timeout);
                reject(x);
            });
        });
    }

    async makeRequestZoro(uri, self) {
        return new Promise(function (resolve, reject) {

            let timeout = setTimeout(function () {
                reject("timeout");
            }, 60000);
            cordova.plugin.http.sendRequest(uri, {
                "method": "GET",
                "headers": {
                    "origin": extensionList[3].config.origin,
                    "referer": extensionList[3].config.referer,
                    "sid": self.sid
                },
                "responseType": "blob"
            },
                function (response) {
                    clearTimeout(timeout);
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.data);
                    } else {
                        reject(response.data);

                    }

                },
                function (response) {
                    clearTimeout(timeout);
                    reject(response);
                });


        });
    }


    saveAs(blob, filename, self) {

        return new Promise(function (resolve, reject) {

            self.fileDir.getFile(filename, { create: true, exclusive: false }, function (file) {

                file.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function (e) {
                        resolve("done");
                    };

                    fileWriter.onerror = function (e) {
                        reject("err");
                    };


                    fileWriter.write(blob);

                }, (err) => {
                    reject("err");
                });


            }, function (x) {
                reject("err");
            });
        });
    }

    downloadFileTransfer(filename, uri, self, headers = {}) {
        return new Promise(function (resolve, reject) {
            self.fileDir.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                var fileTransfer = new FileTransfer();
                var fileURL = fileEntry.toURL();
                headers.suppressProgress = true;
                let timeoutMS = parseInt(localStorage.getItem("downloadTimeout"));
                timeoutMS = isNaN(timeoutMS) ? 20000 : timeoutMS*1000;
                let timeout = setTimeout(function(){
                    fileTransfer.abort();
                    reject("timeout");      
                }, timeoutMS);
                fileTransfer.download(
                    uri,
                    fileURL,
                    function (entry) {
                        clearTimeout(timeout);
                        resolve("done");
                    },
                    function (error) {
                        clearTimeout(timeout);
                        reject(error);                        
                    },
                    null,
                    headers,
                );

                fileTransfer.onprogress = function(progressEvent) {};
            }, function (x) {
                console.error(x);
                reject("err");
            });
        });
    }

    download(data, filename, self) {
        var blob = new Blob([data], {
            type: 'text/plain'
        });
        self.saveAs(blob, filename, self);
    }

    readFile(self) {
        return new Promise(function (resolve, reject) {
            self.fileDir.getFile("downloaded.json", { create: true, exclusive: false }, function (fileEntry) {

                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function () {
                        resolve(this.result);
                    };

                    reader.readAsText(file);

                }, (err) => {
                    reject(err);

                });


            }, function (x) {
                reject(err);
            });


        });
    }


    saveToLocal(x = 0, self) {
        if(self.pause){
            return;
        }
        if (x == 1) {
            self.updateNoti(`Storing downloaded data - Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self, 1);
            if (self.check == 0) {
                self.check = 1;
                var data = new Blob(self.buffers.splice(0, Math.min(self.buffers.length, self.maxBufferLength)), { "type": "video/mp4" });

                self.fileEntry.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function (e) {
                        self.check = 0;
                        if (self.buffers.length != 0) {
                            self.saveToLocal(1, self);
                        }else{
                            self.done(self);
                        }
                    };

                    fileWriter.onerror = function (e) {
                        self.errorHandler(self, e);
                    };

                    fileWriter.seek(fileWriter.length);

                    fileWriter.write(data);

                }, (err) => {
                    self.errorHandler(self, err);
                });
            } else {
                setTimeout(function () {
                    self.saveToLocal(1, self);
                }, 1000);
            }
        } else {
            if (self.buffers.length > self.maxBufferLength && self.check == 0) {
                self.check = 1;
                var data = new Blob(self.buffers.splice(0, self.maxBufferLength), { "type": "video/mp4" });
                self.fileEntry.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function (e) {
                        self.check = 0;
                    };

                    fileWriter.onerror = function (e) {
                        self.errorHandler(self, e);
                    };

                    fileWriter.seek(fileWriter.length);

                    fileWriter.write(data);

                }, (err) => {
                    self.errorHandler(self, err);
                });
            }
        }
    }




    async startDownloadMP4(self) {

        self.fileDir.getFile(`master.m3u8`, { create: true, exclusive: false }, function (fileEntry) {
            self.fileEntry = fileEntry;
            fileEntry.getMetadata(function (x) {
                self.buffers = [];
                self.size = x.size;
                const controller = new AbortController();
                self.controller = controller;
                self.updateNoti("Starting...", self, 1);

                let timeoutId = setTimeout(function(){
                    controller.abort();
                }, 60000);
                fetch(self.url, {
                    headers: {
                        "Range": `bytes=${self.size}-`,
                    },
                    signal: controller.signal,
                }).then(response => {
                    clearTimeout(timeoutId);
                    self.total = response.headers.get("content-length");
                    if (response.headers.get("content-length") == self.size) {
                        self.done();
                    } else {
                        if (response.ok) {
                            const reader = response.body.getReader();
                            let total = 0;



                            return reader.read().then(function processResult(result) {

                                if (result.done) {
                                    self.updateNoti(`Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self);
                                    self.saveToLocal(1, self);
                                    self.saved = true;
                                    return total;
                                }

                                if (self.pause) {
                                    controller.abort();
                                }


                                const value = result.value;
                                self.downloaded += value.length;
                                self.buffers.push(value.buffer);
                                if (self.buffers.length > self.maxBufferLength) {
                                    self.updateNoti(`Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self);


                                    self.saveToLocal(0, self);
                                }
                                reader.read().then(processResult).catch(function (err) {
                                    self.errorHandler(self, "Error while reading the response's data. ");
                                });
                            }).catch(function () {
                                controller.abort();
                                self.errorHandler(self, "Error while reading the response's body.");
                            });
                        } else {
                            if (response.status == 416) {
                                self.errorHandler(self, "Out of range");

                            } else {
                                self.errorHandler(self, "Unexpexted error");

                            }
                        }
                    }
                }
                ).catch(function () {
                    self.errorHandler(self, "Error downloading the file.");
                });
            }, function (x) {
                self.errorHandler(self, "Could not get the meta-data.");
            });
        }, function (x) {
            self.errorHandler(self, "Could not make the main file.");
        });
    }

    async startDownload(self) {
        try {
            let x = await self.makeRequest(`${self.url}`, (x) => x.text());
            let parser = new m3u8Parser.Parser();

            parser.push(x);
            parser.end();

            if ("playlists" in parser.manifest) {
                let url = parser.manifest.playlists[0].uri;

                // preferredResolution

                let res = [];
                let resIndex = [];
                for (let i = 0; i < parser.manifest.playlists.length; i++) {
                    let cur = parser.manifest.playlists[i].attributes;
                    for (let key in cur) {
                        if (key.toLowerCase() == "resolution") {
                            res.push(cur[key].height);
                            resIndex.push(i);
                            break;
                        }
                    }
                }

                let differences = [];
                for (let i = 0; i < res.length; i++) {
                    differences.push(Math.abs(self.preferredResolution - res[i]));
                }


                let min = differences[0];
                let minIndex = 0;

                for (let i = 0; i < differences.length; i++) {
                    if (min > differences[i]) {
                        minIndex = i;
                        min = differences[i];
                    }
                }



                url = parser.manifest.playlists[resIndex[minIndex]].uri;



                if (url.substring(0, 4) != "http") {
                    url = self.baseURL + url;
                }

                self.baseURL = self.getBaseUrl(url);
                x = await self.makeRequest(url, (x) => x.text());

            }


            x = x.split("\n");


            let localMapping = {};
            try {
                let tempMapping = await self.readFile(self);
                tempMapping = (JSON.parse(tempMapping)).data;
                for (let i = 0; i < tempMapping.length; i++) {
                    let cur = tempMapping[i];
                    let tempDownloaded = cur.downloaded;
                    if(tempDownloaded === -1){
                        tempDownloaded = false;
                    }
                    localMapping[cur.fileName] = {
                        "downloaded": tempDownloaded,
                        "uri": cur.uri,
                    }
                }

            } catch (err) {
                console.error(err);
            }



            let mapping = self.mapping;
            for (let i = 0; i < x.length; i++) {

                if (x[i].includes("#EXT-X-KEY:METHOD")) {
                    let temp = x[i].split(",");
                    for (let j = 0; j < temp.length; j++) {
                        if (temp[j].substring(0, 4) == "URI=") {
                            let downloaded = false;
                            let uri = temp[j].substring(5, temp[j].length - 1);
                            if (`key${i}` in localMapping) {
                                downloaded = localMapping[`key${i}`].downloaded;
                            }
                            mapping.push({
                                "fileName": `key${i}`,
                                "uri": uri,
                                "downloaded": downloaded
                            });

                            temp[j] = `URI="key${i}"`;
                            break;
                        }
                    }

                    temp = temp.join(",");
                    x[i] = temp;

                }
                else if (x[i].includes("#EXTINF")) {
                    let temp = x[i + 1];

                    if (temp.substring(0, 4) != "http") {
                        temp = self.baseURL + temp;
                    }
                    let downloaded = false;
                    if (`segment${i}` in localMapping) {
                        downloaded = localMapping[`segment${i}`].downloaded;
                    }
                    mapping.push({
                        "fileName": `segment${i}`,
                        "uri": temp,
                        "downloaded": downloaded
                    });
                    x[i + 1] = `segment${i}`;
                    i++;
                }

            }
            self.download(x.join("\n"), "master.m3u8", self);
            self.total = mapping.length;
            self.updateNoti("Starting...", self, 1);
            let retryCount = 4;
            let check;

            let settled = "allSettled" in Promise;

            while (retryCount > 0) {
                retryCount--;
                check = true;
                if (self.pause) {
                    break;
                }
                self.downloaded = 0;
                let parallel = isNaN(parseInt(localStorage.getItem("parallel"))) ? 5 : parseInt(localStorage.getItem("parallel"));
                let iters = Math.ceil(mapping.length / parallel);
                for (let i = 0; i < iters; i++) {


                    if (self.pause) {
                        break;
                    }



                    let promises = [];
                    let response;
                    for (let j = i * parallel; j < ((i + 1) * parallel) && j < mapping.length; j++) {
                        if (mapping[j].downloaded === true) {
                            self.downloaded++;
                            continue;
                        }else if(mapping[j].downloaded === -1){
                            continue;
                        }

                        if (self.engine == 3) {
                            promises.push(self.downloadFileTransfer(mapping[j].fileName, mapping[j].uri, self, {
                                "headers": {
                                "origin": extensionList[3].config.origin,
                                "referer": extensionList[3].config.referer,
                                "sid": self.sid
                                }
                            }));

                        } else {
                            promises.push(self.downloadFileTransfer(mapping[j].fileName, mapping[j].uri, self, {}));

                        }
                    }
                    try {
                        console.log("start");
                        if (settled) {
                            response = await Promise.allSettled(promises);
                        } else {
                            response = await Promise.all(promises);

                        }
                        console.log("end", response);


                        let index = 0;
                        for (let j = i * parallel; j < ((i + 1) * parallel) && j < mapping.length; j++) {
                            if (mapping[j].downloaded === true || mapping[j].downloaded === -1) {
                                continue;
                            }

                            let thisRes = response[index++];
                            check = false;
                            if (settled) {
                                if(thisRes.status == "fulfilled"){
                                    mapping[j].downloaded = true;
                                    self.downloaded++;
                                }else{
                                    mapping[j].downloaded = false;

                                }
                            }else{
                                self.downloaded++;
                                mapping[j].downloaded = true;
                            }
                        }

                        await self.updateDownloadStatus(self);
                        self.updateNoti(`Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self);


                    } catch (err) {
                        check = false;
                    }




                }

                if (check) {
                    break;
                }
            }

            if (check) {
                let doneFR = true;

                let lastSum = 0;
                let count = 0;
                let interval;

                interval = setInterval(function(){

                    if(self.pause){
                        clearInterval(interval);
                        return;
                    }
                    let sum = 0;
                    for (let j = 0; j < mapping.length; j++) {
                        if(mapping[j].downloaded === -1){
                            sum++;
                        }
                    }

                    if(sum == lastSum){
                        count++;
                    }
                    lastSum = sum;

                    if(sum == 0){                    
                        for (let j = 0; j < mapping.length; j++) {
                            if(mapping[j].downloaded !== true){
                                doneFR = false;
                                break;
                            }
                        }
        
                        if(doneFR){
                            clearInterval(interval);                            
                            self.done(self);
                        }else{
                            clearInterval(interval);                            
                            self.errorHandler(self, "Could not download the whole video. Try Again");
                        }
                    }else if(count > 4){
                        clearInterval(interval);
                        self.errorHandler(self, "Could not download the whole video. Try Again");
                    }
                }, 1000);

                
                
            } else {
                self.errorHandler(self, "Could not download the whole video. Try Again");

            }
        } catch (err) {
            console.error(err);
            self.errorHandler(self, "Unexpected error has occurred. Code: 2000");
        }

    }

    done(self) {
        if (socket) {
            socket.disconnect();
        }

        if (self.pause) {
            return;
        }

        self.fileDir.getFile(`.downloaded`, { create: true, exclusive: false }, function (dir) {
            self.updateNoti(`Done - Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self, 2);
            
            self.pause = true;
            self.message = "Done";
            self.success();
            self.error = () => { };
            self.success = () => { };
        }, function (x) {
            console.error(x);
        });
    }


    errorHandler(self, x) {
        if (socket) {
            socket.disconnect();
        } 
        if (self.controller) {
            self.controller.abort();
        }
        
        if (self.pause) {
            return;
        }

        

        self.updateNoti(`Error - Episode ${self.vidData.episode} - ${fix_title(self.name)}`, self, 2);

        self.pause = true;
        self.message = (x);
        self.error();
        self.error = () => { };
        self.success = () => { };

    }
}
