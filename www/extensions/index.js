let localVal = localStorage.getItem("local");
if (localVal != "true" && localVal != "false") {
    localStorage.setItem("local", "true");
    config.local = true;
}
let currentResolve;
let currentReject;
let fmoviesBaseURL = !localStorage.getItem("fmoviesBaseURL") ? "fmovies.app" : localStorage.getItem("fmoviesBaseURL");

function setFmoviesBase(){
    fmoviesBaseURL = !localStorage.getItem("fmoviesBaseURL") ? "fmovies.app" : localStorage.getItem("fmoviesBaseURL");
}

function extractKey(id, url = null) {
    return (new Promise(async function (resolve, reject) {
        let scr;
        if(url == null){
            if(id == 6){
                scr = (await MakeFetch(`https://rapid-cloud.co/js/player/prod/e6-player.min.js?v=${(new Date()).getTime()}`));
            }else{
                scr = (await MakeFetch(`https://rabbitstream.net/js/player/prod/e4-player.min.js?v=${(new Date()).getTime()}`));                
            }
        }else{
            scr = (await MakeFetch(url));
        }
        
        scr = extractKeyComp(id,scr);
        if(scr[1]){
            resolve(scr[0]);
        }else{
            currentResolve = resolve;
            currentReject = reject;

            setTimeout(function () {
                reject("timeout");
            }, 3000);

            document.getElementById("evalScript").contentWindow.postMessage(scr[0], "*");
        }
    }));

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

let customHeaders = {};
var MakeCusReqFmovies = async function (url, options) {
    return new Promise(function (resolve, reject) {
        cordova.plugin.http.sendRequest(url, options, function (response) {
            resolve(response.data);
        }, function (response) {
            reject(response.error);
        });
    });
}


if (config && config.chrome) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            for (x in customHeaders) {
                details.requestHeaders.push({
                    "name": x,
                    "value": customHeaders[x]
                });
            }



            return { requestHeaders: details.requestHeaders };
        },
        { urls: ['https://fmovies.app/*', 'https://streamrapid.ru/*'] },
        ['blocking', 'requestHeaders']
    );

    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            details.requestHeaders.push({
                "name": "origin",
                "value": extensionList[3].config.origin
            });

            details.requestHeaders.push({
                "name": "referer",
                "value": extensionList[3].config.referer
            });

            if(config.sockets){
                details.requestHeaders.push({
                    "name": "sid",
                    "value": localStorage.getItem("sid")
                });
            }
            





            return { requestHeaders: details.requestHeaders };
        },
        { urls: ['https://*.dayimage.net/*'] },
        ['blocking', 'requestHeaders']
    );

    MakeCusReqFmovies = async function (url, options) {
        if ("headers" in options) {
            customHeaders = options["headers"];
        }

        return new Promise(function (resolve, reject) {
            fetch(url, options).then(response => response.text()).then((response) => {
                customHeaders = {};

                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}


var wco = {
    'searchApi': function (query) {
        return (new Promise(function (resolve, reject) {
            let formData = new FormData();
            formData.append('catara', query);
            formData.append('konuara', 'series');

            fetch("https://www.wcoforever.net/search", {
                method: 'POST', body: formData
            }).then(response => response.text()).then(function (x) {

                let temp = document.createElement("div");
                temp.innerHTML = DOMPurify.sanitize(x);


                var main_div = temp.querySelector(".items").children;

                let data = [];
                for (var i = 0; i < main_div.length; i++) {

                    data.push({
                        "image": main_div[i].getElementsByTagName("img")[0].getAttribute("src"),
                        "name": main_div[i].getElementsByTagName("a")[1].innerText,
                        "link": main_div[i].getElementsByTagName("a")[1].getAttribute("href").replace("https://www.wcoforever.net", "") + "&engine=0",
                    });





                }

                temp.remove();
                resolve({
                    "status": 200,
                    "data": data
                });


            }).catch(function (x) {
                reject(x);

            });
        }));

    },


    'getAnimeInfo': function (url) {
        return (new Promise(function (resolve, reject) {
            url = url.split("&engine")[0];
            url = "https://www.wcoforever.net/" + url;
            fetch(url).then(response => response.text()).then(function (response) {
                let temp = document.createElement("div");
                temp.innerHTML = DOMPurify.sanitize(response);
                let data = {};
                data.name = temp.querySelectorAll(".video-title")[0].innerText;
                data.image = temp.querySelector("#sidebar_cat").querySelectorAll(".img5")[0].getAttribute("src");

                if (data.image.indexOf("//") == 0) {
                    data.image = "https:" + data.image;
                }

                data.description = temp.querySelector("#sidebar_cat").querySelectorAll("p")[0].innerText;

                let episodesDOM = temp.querySelector("#sidebar_right3");

                let animeEps = [];
                let animeDOM = episodesDOM.querySelectorAll("a");
                let animeName;
                for (var i = animeDOM.length - 1; i >= 0; i--) {
                    animeEps.push({
                        "link": animeDOM[i].href.replace("https://www.wcoforever.net", "?watch=") + "&engine=0",
                        "title": animeDOM[i].innerText,
                    });
                }

                try {

                    let animeNameMain = animeEps[0].link.replace("https://www.wcoforever.net", "?watch=").split("?watch=/")[1];

                    animeName = animeNameMain.trim();

                    animeName = animeName.split("episode")[0];
                    if (animeNameMain.split("episode").length == 1) {
                        animeName = animeName.split("?id=")[0];
                        animeName = animeName.trim();
                        animeName = animeName + "-";
                        animeName = animeName.trim();
                    }
                    try {
                        if (animeName.indexOf("season") > -1) {
                            animeName = animeName.split("season")[0];
                        }
                    } catch (err) {

                    }

                } catch (err) {
                    animeName = animeName + "-";
                }

                data.episodes = animeEps;
                data.mainName = animeName;

                temp.remove();
                resolve(data);
            }).catch(function (err) {
                reject(err);
            });

        }));
    },




    'getLinkFromUrl': async function (url) {
        url = url.split("&engine")[0];

        url = "https://www.wcoforever.net" + url;
        let name_ep_main = decodeURIComponent(url.split("https://www.wcoforever.net/")[1].split("/")[0]);
        let name_ep;
        let name_name = name_ep_main.split("episode")[0];
        name_name = name_name.trim();
        if (name_ep_main.split("episode").length == 1) {
            name_name = name_name.split("?id=")[0];
            name_name = name_name.trim();
            name_name = name_name + "-";
            name_name = name_name.trim();
        }
        name_name2 = name_name;
        try {
            if (name_name.indexOf("season") > -1) {
                name_name = name_name.split("season")[0];
            }
        } catch (err) {

        }

        try {
            var ytf = name_ep_main.split("episode")[1];

            if (ytf.substring(0, 1) == "-") {
                ytf = ytf.substring(1);
                ytf = ytf.replace("-", ".");

            }

            name_ep = Math.abs(parseFloat(ytf));
        } catch (err) {

        }
        if (isNaN(parseFloat(name_ep))) {
            name_ep = 1;
        }
        else {
            if (name_ep < 1) {
                name_ep = 0.1;

            }

        }




        try {
            var option2 = {
                'headers': {
                    'x-requested-with': 'XMLHttpRequest'
                },
                "method": "GET",
            };





            var req1 = await MakeFetch(url, {});
            let sources = [];
            var d = req1;
            var dom = document.createElement("div");
            dom.innerHTML = DOMPurify.sanitize(d);

            var nextPrev = dom.getElementsByClassName("prev-next");
            var data = {};
            for (var npi = 0; npi < nextPrev.length; npi++) {
                data[nextPrev[npi].children[0].getAttribute("rel")] = (nextPrev[npi].children[0].getAttribute("href").replace("https://www.wcoforever.net", "")) + "&engine=0";
            }

            let tempReg = /<script>var.+?document\.write\(decodeURIComponent\(escape.+?<\/script>/gis;
            let tempRegOut = tempReg.exec(req1)[0];
            let arrayReg = /\[.+\]/gis;
            let main = "";

            let arrayRegOut = JSON.parse(arrayReg.exec(tempRegOut)[0]);
            let num = parseInt(tempRegOut.split(`.replace(\/\\D\/g,'')) -`)[1]);

            arrayRegOut.forEach(function (value) {
                main += String.fromCharCode(parseInt(atob(value).replace(/\D/g, '')) - num);
            });

            main = "https://www.wcoforever.net" + main.split("src=\"")[1].split("\" ")[0];

            var req2 = await MakeFetch(main, {});

            main = "https://www.wcoforever.net" + req2.split("$.getJSON(\"")[1].split("\"")[0];

            try {
                let animeUrl = (main.split("v=cizgi").join('v=')).split('&embed=cizgi').join('&embed=anime');
                var req4 = await MakeFetch(animeUrl, option2);

                req4 = JSON.parse(req4);

                if (req4.hd != "") {
                    sources.push({
                        "url": req4.cdn + "/getvid?evid=" + req4.hd,
                        "name": "HD#2",
                        "type": "mp4"
                    });
                }

                if (req4.enc != "") {
                    sources.push({
                        "url": req4.cdn + "/getvid?evid=" + req4.enc,
                        "name": "SD#2",
                        "type": "mp4"

                    });
                }

            } catch (err) {
                console.error(err);
            }

            var req3 = await MakeFetch(main, option2);
            req3 = JSON.parse(req3);

            if (req3.enc != "") {

                sources.unshift({
                    "url": req3.cdn + "/getvid?evid=" + req3.enc,
                    "name": "SD",
                    "type": "mp4"

                });
            }

            if (req3.hd != "") {
                sources.unshift({
                    "url": req3.cdn + "/getvid?evid=" + req3.hd,
                    "name": "HD",
                    "type": "mp4"

                });
            }


            data.sources = sources;
            data.name = name_name;
            data.nameWSeason = name_name2;
            data.episode = name_ep;
            data.status = 200;
            data.message = "done";
            dom.remove();
            return data;
        } catch (err) {
            console.error(err);
            alert("Couldn't get the link");
            return { "status": 400, "message": "Couldn't get the link" }
        }

    }

};






var animixplay = {
    'searchApi': function (query) {
        return (new Promise(function (resolve, reject) {

            fetch("https://v1.ic5qwh28vwloyjo28qtg.workers.dev/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'q2': query,
                    'origin': 1,
                    'root': 'animixplay.to',
                    'd': 'gogoanime.gg'
                })
            }).then(response => response.json())
                .then(response => {
                    let temp = document.createElement("div");
                    temp.innerHTML = DOMPurify.sanitize(response.result);
                    let li = temp.querySelectorAll("li");
                    let data = [];

                    for (var i = 0; i < li.length; i++) {
                        data.push({
                            "image": li[i].getElementsByTagName("img")[0].getAttribute("src"),
                            "name": li[i].getElementsByTagName("a")[0].getAttribute("title"),
                            "link": li[i].getElementsByTagName("a")[0].getAttribute("href") + "&engine=1",
                        });

                    }

                    temp.remove();

                    resolve({
                        "status": 200,
                        "data": data
                    });

                }).catch(function (err) {
                    reject(err);
                });

        }));
    },


    'getAnimeInfo': function (url) {
        return (new Promise(function (resolve, reject) {
            url = url.split("&engine");
            if (url.length == 2) {
                url = url[0];
            }
            let ogURL = url;
            url = "https://animixplay.to/" + url;
            fetch(url).then(response => response.text()).then(async function (response) {
                let temp = document.createElement("div");
                temp.innerHTML = DOMPurify.sanitize(response);
                let data = {};


                data.name = url.split("/")[url.split("/").length - 1].split("-").join(" ");
                data.image = "";
                data.description = "";
                let temp2 = document.createElement("div");

                try {
                    let malId = parseInt(response.split("malid = '")[1]);
                    let response2 = await MakeFetch(`https://myanimelist.net/anime/${malId}`, {});
                    temp2.innerHTML = DOMPurify.sanitize(response2, { ALLOWED_ATTR: ['itemprop'] });

                    data.image = temp2.querySelector('[itemprop="image"]').src;


                    if (data.image == null || data.image == undefined || data.image.trim() == "") {
                        data.image = temp2.querySelector('[itemprop="image"]').getAttribute('data-image');
                        if (data.image == null || data.image == undefined || data.image.trim() == "") {
                            data.image = temp2.querySelector('[itemprop="image"]').getAttribute('data-src');

                        }

                    }

                    data.description = temp2.querySelector('[itemprop="description"]').innerText;
                } catch (err) {
                    console.error(err);
                } finally {
                    temp2.remove();
                }

                let animeEps = [];
                let animeDOM = JSON.parse(temp.querySelector("#epslistplace").innerHTML);
                let animeName;
                for (value in animeDOM) {
                    if (value == "eptotal" || typeof animeDOM[value] != "string") {
                        continue;
                    }


                    try {
                        let l = animeDOM[value].split("id=")[1].split("&")[0]
                        animeEps.push({
                            "link": "?watch=" + ogURL + "/ep" + value + "&engine=1",
                            "title": `Episode ${parseFloat(value) + 1}`,
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }

                animeName = url.split("/")[url.split("/").length - 1] + "-";

                data.episodes = animeEps;
                data.mainName = animeName;
                temp.remove();
                resolve(data);
            }).catch(function (err) {
                console.error(err);

                reject(err);
            });

        }));
    },

    'getLinkFromUrl': function (url) {
        return (new Promise(async function (resolve, reject) {
            url = url.split("&engine");
            url = url[0];

            let nextUrl = "https://animixplay.to/" + url;
            let data = {};
            let response = await MakeFetch(nextUrl, {});
            let temp = document.createElement("div");
            temp.innerHTML = DOMPurify.sanitize(response);
            let animeDOM = JSON.parse(temp.querySelector("#epslistplace").innerHTML);
            temp.remove();
            let episode = parseFloat(url.split("ep")[1]);

            if ((episode - 1).toString() in animeDOM) {
                data.prev = (url.split("ep")[0] + "ep" + (episode - 1)) + "&engine=1";
            }

            if ((episode + 1).toString() in animeDOM) {
                data.next = (url.split("ep")[0] + "ep" + (episode + 1)) + "&engine=1";
            }


            if (episode == -1) {

                data.episode = 0.1;
            } else {
                data.episode = episode + 1;

            }

            data.nameWSeason = url.split("/")[1].split("-").join("-") + "-";
            data.name = (url.split("/")[1].split("-").join("-")) + "-";

            let l = animeDOM[episode.toString()].split("id=")[1].split("&")[0]

            function padding(string, len) {
                let length = len - string.length;
                for (var i = 0; i < length; i++) {
                    string += "=";
                }

                return string;

            }
            function idToLink(id) {

                let start = padding(id, 8);
                start = start + "LTXs3GrU8we9O";
                start = btoa(start);
                let end = start.substring(0, 10) + String.fromCharCode(start.charCodeAt(10) - 1) + "\n";
                let endRes = start + btoa(end);
                return endRes;
            }

            let link = idToLink(l);

            data.sources = [];

            if (config.chrome) {
                let reqTimeout = setTimeout(function () {
                    chrome.webRequest.onHeadersReceived.removeListener(
                        callbackReq
                    );
                    reject("Timeout");
                }, 3000);
                function callbackReq(details) {
                    clearTimeout(reqTimeout);
                    let res = details.url;
                    res = atob(res.split("#")[1]);
                    data.sources.push({
                        "url": res,
                        "name": "HlS",
                        "type": "hls"
                    });


                    data.status = 200;
                    data.message = "done";
                    chrome.webRequest.onHeadersReceived.removeListener(
                        callbackReq
                    );
                    resolve(data);
                }



                chrome.webRequest.onHeadersReceived.addListener(
                    callbackReq,
                    { urls: ["https://plyr.link/*"] }
                );

                MakeFetch(`https://animixplay.to/api/live${link}`, {
                    method: 'GET'
                });


            } else {

                cordova.plugin.http.sendRequest(`https://animixplay.to/api/live${link}`, {
                    method: 'GET'
                }, function (response) {
                    let res = response.url;
                    res = atob(res.split("#")[1]);
                    data.sources.push({
                        "url": res,
                        "name": "HlS",
                        "type": "hls"
                    });


                    data.status = 200;
                    data.message = "done";
                    resolve(data);

                }, function (response) {
                    console.error(response);
                    reject("err 4583");
                });
            }

        }));


    }
}


var fmovies = {
    'searchApi': function (query) {

        query = decodeURIComponent(query);
        return (new Promise(function (resolve, reject) {
            fetch(`https://${fmoviesBaseURL}/search/${query.replace(" ", "-")}`, {

            }).then(response => response.text())
                .then(response => {
                    let tempDOM = document.createElement("div");
                    tempDOM.innerHTML = DOMPurify.sanitize(response);
                    let data = [];

                    var section = tempDOM.querySelectorAll(".flw-item");
                    for (var i = 0; i < section.length; i++) {

                        let current = section[i];


                        let dataCur = {};
                        let poster = current.querySelector(".film-poster");
                        let detail = current.querySelector(".film-detail");

                        let temlLink = poster.querySelector("a").getAttribute("href");

                        if (temlLink.includes("http")) {
                            temlLink = new URL(temlLink);
                            temlLink = temlLink.pathname;
                        }


                        dataCur.image = poster.querySelector("img").getAttribute("data-src");
                        dataCur.link = temlLink + "&engine=2";
                        dataCur.name = detail.querySelector(".film-name").innerText.trim();



                        data.push(dataCur);



                    }

                    tempDOM.remove();

                    resolve({
                        "status": 200,
                        "data": data
                    });



                }).catch(function (err) {
                    reject(err);
                });

        }));
    },

    'getAnimeInfo': function (url) {

        async function getSeason(x, showURL) {
            try {
                let r = await MakeFetch(`https://${fmoviesBaseURL}/ajax/v2/tv/seasons/${x}`);

                let temp = document.createElement("div");
                temp.innerHTML = DOMPurify.sanitize(r);
                let tempDOM = temp.getElementsByClassName("dropdown-item ss-item");
                let data = {};
                for (var i = 0; i < tempDOM.length; i++) {
                    data[tempDOM[i].innerText] = tempDOM[i].getAttribute("data-id");
                }



                r = await MakeFetch(`https://${fmoviesBaseURL}/${showURL}`);
                let temp2 = document.createElement("div");
                temp2.innerHTML = DOMPurify.sanitize(r);
                let data2 = {};
                data2.name = temp2.querySelector(".movie_information").querySelector(".heading-name").innerText;
                data2.img = temp2.querySelector(".movie_information").querySelector(".film-poster-img").src;
                data2.des = temp2.querySelector(".m_i-d-content").querySelector(".description").innerText;



                temp.remove();
                temp2.remove();
                return { "status": 200, "data": { "seasons": data, "meta": data2 } };



            } catch (error) {
                return { "status": 400, "data": error.toString() };

            }


        }


        async function getEpisode(x) {
            try {
                let r = await MakeFetch(`https://${fmoviesBaseURL}/ajax/v2/season/episodes/${x}`);
                let temp = document.createElement("div");
                temp.innerHTML = DOMPurify.sanitize(r);
                let tempDOM = temp.getElementsByClassName("nav-link btn btn-sm btn-secondary eps-item");
                let data = [];
                for (var i = 0; i < tempDOM.length; i++) {
                    let dataT = {};
                    dataT.title = tempDOM[i].getAttribute("title");
                    dataT.id = tempDOM[i].getAttribute("data-id");
                    data.push(dataT);

                }


                temp.remove();

                return { "status": 200, "data": data };


            } catch (error) {
                return { "status": 400, "data": error.toString() };
            }


        }


        return (new Promise(function (resolve, reject) {
            url = url.split("&engine");
            if (url.length == 2) {
                url = url[0];
            }

            let data = {};
            let showId = url.split("-");
            showId = showId[showId.length - 1].split(".")[0];

            getSeason(showId, url).then(async function (response) {
                if (response.status == 200) {
                    data.name = response.data.meta.name;
                    data.image = response.data.meta.img;
                    data.description = response.data.meta.des;
                    data.mainName = url.split("/watch-")[1].split("-online")[0] + "-" + showId + "-";
                    data.episodes = [];

                    let allAwaits = [];
                    let seasonNames = [];
                    for (season in response.data.seasons) {
                        check = 1;
                        seasonNames.push(season);
                        let seasonData = getEpisode(response.data.seasons[season]);
                        allAwaits.push(seasonData);

                    }

                    Promise.all(allAwaits).then((values) => {
                        for (let key = 0; key < values.length; key++) {

                            let seasonData = values[key];
                            for (let i = 0; i < seasonData.data.length; i++) {
                                let tempData = {};
                                tempData.title = `${seasonNames[key]} | ${seasonData.data[i].title}`;
                                tempData.link = `?watch=${url}.${seasonData.data[i].id}&engine=2`;
                                data.episodes.push(tempData);
                            }
                        }
                        if (Object.keys(response.data.seasons).length === 0) {
                            let tempData = {};
                            tempData.title = `Watch`;
                            tempData.link = `?watch=${url}&engine=2`;
                            data.episodes.push(tempData);
                        }
                        resolve(data);
                    });

                } else {
                    reject(response.data);
                }
            }).catch(function (err) {
                reject(err);
            });



        }));
    },

    'getLinkFromUrl': function (url) {

        return (new Promise(async function (resolve, reject) {
            url = url.split("&engine");
            url = url[0];
            let data = {};
            let showId = url.split("-");
            showId = showId[showId.length - 1].split(".")[0];





            async function getLinkFromStream(urlS, token) {
                return new Promise(async function (resolve, reject) {
                    try {
                        var option = {
                            'headers': {
                                'referer': 'https://fmovies.ps/',
                                'Host': 'streamrapid.ru',
                                'user-agent': localStorage.getItem("userAgent")
                            }
                        };

                        var option23 = {
                            'headers': {
                                'x-requested-with': 'XMLHttpRequest',
                            }
                        };

                        let host = (new URL(urlS)).origin;

                        var link = urlS.split("/");
                        link = link[link.length - 1];
                        link = link.split("?")[0];

                        var second = await MakeCusReqFmovies(`${host}/ajax/embed-4/getSources?id=${link}&_token=3&_number=${6}`, option23);

                        let jsonq = JSON.parse(second);

                        resolve(jsonq);

                    } catch (err) {
                        console.error(err);

                        reject(err);
                    }



                });

            }


            // ##########################

            try {
                let start = performance.now();

                var option = {
                    'headers': {
                        'referer': 'https://fmovies.ps/',

                        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43",
                    }
                };

                var option9 = {
                    'headers': {
                        'referer': 'https://fmovies.app/',

                        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43",
                    }
                };

                var split = url.split("-");
                var split = split[split.length - 1].split(".");
                var server;
                var server2;
                let ep;



                // let tokenStream =  getTokenFromUrl("https://streamrapid.ru/js/player/","6LcmoUQcAAAAANdFmpVMNp8fLPptGk2uVSnY0TyZ");
                let promise2;
                if (split.length == 1) {
                    ep = split[0];
                    promise2 = MakeCusReqFmovies(`https://${fmoviesBaseURL}/ajax/movie/episodes/${ep}`, option);
                } else {
                    ep = split[1];

                    promise2 = MakeCusReqFmovies(`https://${fmoviesBaseURL}/ajax/v2/episode/servers/${ep}`, option)
                }

                Promise.all([promise2]).then(async (tokens) => {



                    if (split.length == 1) {



                        var getLink2 = tokens[0];


                        var dom = document.createElement("div");
                        dom.innerHTML = DOMPurify.sanitize(getLink2);

                        let tempDOM = dom.getElementsByClassName("nav-link btn btn-sm btn-secondary");

                        for (var i = 0; i < tempDOM.length; i++) {

                            if (tempDOM[i].getAttribute("title").toLowerCase().indexOf("vidcloud") > -1) {
                                server = tempDOM[i].getAttribute("data-linkid");
                            }
                            else if (tempDOM[i].getAttribute("title").toLowerCase().indexOf("mixdrop") > -1) {
                                server2 = tempDOM[i].getAttribute("data-linkid");

                            }

                        }

                        dom.remove();


                    } else {



                        var getLink2 = tokens[0];


                        var dom = document.createElement("div");
                        dom.innerHTML = DOMPurify.sanitize(getLink2);
                        let tempDOM = dom.getElementsByClassName("nav-link btn btn-sm btn-secondary");

                        for (var i = 0; i < tempDOM.length; i++) {

                            if (tempDOM[i].getAttribute("title").toLowerCase().indexOf("vidcloud") > -1) {
                                server = tempDOM[i].getAttribute("data-id");
                            } else if (tempDOM[i].getAttribute("title").toLowerCase().indexOf("mixdrop") > -1) {
                                server2 = tempDOM[i].getAttribute("data-id");

                            }

                        }

                        dom.remove();
                    }


                    let getSeason = await MakeFetch(`https://${fmoviesBaseURL}/watch-${url.split(".")[0]}.${server}`);

                    let tempGetDom = document.createElement("div");

                    tempGetDom.innerHTML = DOMPurify.sanitize(getSeason);
                    currentSeason = tempGetDom.querySelector(".detail_page-watch").getAttribute("data-season");
                    tempGetDom.remove();

                    if (currentSeason != "") {
                        let r = await MakeFetch(`https://${fmoviesBaseURL}/ajax/v2/season/episodes/${currentSeason}`);

                        let temp = document.createElement("div");
                        temp.innerHTML = DOMPurify.sanitize(r);
                        let tempDOM = temp.getElementsByClassName("nav-link btn btn-sm btn-secondary eps-item");
                        for (var i = 0; i < tempDOM.length; i++) {
                            if (ep == tempDOM[i].getAttribute("data-id")) {
                                if (i != 0) {
                                    data.prev = url.split(".")[0] + "." + tempDOM[i - 1].getAttribute("data-id") + "&engine=2";
                                }

                                if (i != (tempDOM.length - 1)) {
                                    data.next = url.split(".")[0] + "." + tempDOM[i + 1].getAttribute("data-id") + "&engine=2";
                                }
                            }

                        }
                        temp.remove();

                    }

                    let getLink = await MakeCusReqFmovies(`https://${fmoviesBaseURL}/ajax/get_link/${server}`, option);

                    var title_get = JSON.parse(getLink).title;
                    var link = JSON.parse(getLink).link;
                    let sourceJSON = await getLinkFromStream(link);
                    console.log(sourceJSON);
                    let encryptedURL = sourceJSON.sources;
                    let decryptKey = await extractKey(4);
                    console.log(decryptKey);
                    let tempFile = JSON.parse(CryptoJS.AES.decrypt(encryptedURL, decryptKey).toString(CryptoJS.enc.Utf8));
                    sourceJSON.sources = tempFile;

                    data.status = 200;
                    data.message = "done";
                    if (title_get == "") {
                        data.episode = 1;
                    } else {
                        data.episode = parseFloat(title_get.split(" ")[1]);

                    }

                    data.name = url.split("/watch-")[1].split("-online")[0] + "-" + showId + "-";
                    data.nameWSeason = url.split("/watch-")[1].split("-online")[0] + "-" + currentSeason;

                    data.sources = [{
                        "url": sourceJSON.sources[0].file,
                        "name": "hls",
                        "type": "hls",
                    }];

                    data.subtitles = sourceJSON.tracks;

                    resolve(data);

                }).catch(function (err) {
                    console.error(err);
                    reject({ "status": 400, "message": "Couldn't get the link" });

                });


            } catch (err) {
                console.error(err);
                reject({ "status": 400, "message": "Couldn't get the link" });
            }
            // ##########################














        }));

    },


};


var zoro = {
    'searchApi': function (query) {
        return (new Promise(function (resolve, reject) {
            fetch(`https://zoro.to/search?keyword=${query}`).then(res => res.text()).then(function (a) {
                let dom = document.createElement("div");
                let orDom = dom;
                dom.innerHTML = DOMPurify.sanitize(a);
                dom = dom.querySelectorAll('.flw-item');
                let data = [];
                for (var i = 0; i < dom.length; i++) {
                    let con = dom[i];
                    let src = con.querySelector("img").getAttribute("data-src");
                    let aTag = con.querySelector("a");
                    let animeName = aTag.getAttribute("title");
                    let animeId = aTag.getAttribute("data-id");
                    let animeHref = aTag.getAttribute("href").split("?")[0] + "&engine=3";

                    data.push({ "name": animeName, "id": animeId, "image": src, "link": animeHref });
                }

                orDom.remove();
                resolve({ data, "status": 200 });
            }).catch(function (x) {
                console.error(x);
                reject(x);
            });
        }));

    },


    'getAnimeInfo': async function (url) {
        url = url.split("&engine")[0];
        let id = url.replace("?watch=/", "").split("-");
        id = id[id.length - 1].split("?")[0];
        let response = {};
        let _res = ((await MakeFetch(`https://zoro.to/${url}`, {})));
        let _dom = document.createElement("div");
        let ogDOM = _dom;
        _dom.innerHTML = DOMPurify.sanitize(_res);

        response.name = _dom.querySelector(".film-name.dynamic-name").innerText;

        response.image = _dom.querySelector(".layout-page.layout-page-detail").querySelector("img").src;
        response.description = _dom.querySelector(".film-description.m-hide").innerText;

        let name = url;
        name = name.replace("?watch=", "").split("&ep=")[0].split("-");
        name.pop();
        name = name.join("-");
        response.mainName = name;

        ogDOM.remove();



        let res = JSON.parse((await MakeFetch(`https://zoro.to/ajax/v2/episode/list/${id}`, {})));
        res = res.html;


        let dom = document.createElement("div");
        ogDOM = dom;
        dom.innerHTML = DOMPurify.sanitize(res);
        dom = dom.querySelectorAll('.ep-item');
        let data = [];

        for (var i = 0; i < dom.length; i++) {
            data.push({
                "link": dom[i].getAttribute("href").replace("/watch/", "?watch=").replace("?ep=", "&ep=") + "&engine=3",
                "id": dom[i].getAttribute("data-id"),
                "title": "Episode " + dom[i].getAttribute("data-number"),
            });

        }

        ogDOM.remove();
        response.episodes = data;
        response.status = 200;
        return response;

    },

    'getLinkFromUrl': async function (url) {
        async function getEpisodeListFromAnimeId(id, episodeId) {
            let res = JSON.parse((await MakeFetch(`https://zoro.to/ajax/v2/episode/list/${id}`, {})));
            res = res.html;


            let dom = document.createElement("div");
            ogDOM = dom;
            dom.innerHTML = DOMPurify.sanitize(res);
            dom = dom.querySelectorAll('.ep-item');
            let data = [];

            for (var i = 0; i < dom.length; i++) {
                let temp = {
                    "link": dom[i].getAttribute("href").replace("/watch/", "").replace("?ep=", "&ep=") + "&engine=3",
                    "id": dom[i].getAttribute("data-id"),
                    "title": parseFloat(dom[i].getAttribute("data-number")),
                    "current": 0
                };
                if (parseFloat(dom[i].getAttribute("data-id")) == parseFloat(episodeId)) {
                    temp.current = 1;
                }
                data.push(temp);

            }

            ogDOM.remove();
            return data;

        }

        let resp = {};
        let episodeId, animeId;


        episodeId = parseFloat(url.split("&ep=")[1]).toString();
        animeId = url.replace("?watch=", "").split("-");
        animeId = animeId[animeId.length - 1].split("&")[0];

        let a = await MakeFetch(`https://zoro.to/ajax/v2/episode/servers?episodeId=${episodeId}`, {});
        let domIn = JSON.parse(a).html;

        let dom = document.createElement("div");
        let ogDOM = dom;
        dom.innerHTML = DOMPurify.sanitize(domIn);

        dom = dom.querySelectorAll('[data-server-id="4"]');

        let sourceURLs = [];
        let subtitles = [];


        for (var i = 0; i < dom.length; i++) {
            let sources = await MakeFetch(`https://zoro.to/ajax/v2/episode/sources?id=${dom[i].getAttribute('data-id')}`, {});
            sources = JSON.parse(sources).link;
            let urlHost = (new URL(sources)).origin;


            let sourceId = sources.split("/");
            sourceId = sourceId[sourceId.length - 1];
            sourceId = sourceId.split("?")[0];


            let sourceJSON = JSON.parse((await MakeFetch(`${urlHost}/ajax/embed-6/getSources?id=${sourceId}&sId=lihgfedcba-abcde`, {})));
            try {
                for (let j = 0; j < sourceJSON.tracks.length; j++) {
                    sourceJSON.tracks[j].label += " - " + dom[i].getAttribute('data-type');
                    if (sourceJSON.tracks[j].kind == "captions") {
                        subtitles.push(sourceJSON.tracks[j]);
                    }
                }
            } catch (err) {

            }
            try {
                if (sourceJSON.encrypted) {
                    let encryptedURL = sourceJSON.sources;
                    let decryptKey = await extractKey(6);
                    let tempFile = JSON.parse(CryptoJS.AES.decrypt(encryptedURL, decryptKey).toString(CryptoJS.enc.Utf8));
                    sourceJSON.sources = tempFile;
                }
                let tempSrc = { "url": sourceJSON.sources[0].file, "name": "HLS#" + dom[i].getAttribute('data-type'), "type": "hls" };
                if ("intro" in sourceJSON && "start" in sourceJSON.intro && "end" in sourceJSON.intro) {
                    tempSrc.skipIntro = sourceJSON.intro;
                }
                sourceURLs.push(tempSrc);
            } catch (err) {
                console.error(err);
            }
        }

        let links = await getEpisodeListFromAnimeId(animeId, episodeId);
        let prev = null;
        let next = null;
        let check = false;
        let epNum = 1;
        for (var i = 0; i < (links).length; i++) {
            if (check === true) {
                next = links[i].link;
                break;
            }
            if (parseFloat(links[i].id) == parseFloat(episodeId)) {
                check = true;
                epNum = links[i].title;
            }


            if (check === false) {
                prev = links[i].link;
            }
        }
        ogDOM.remove();

        resp = { "sources": sourceURLs, "episode": epNum };

        if (next != null) {
            resp.next = next;
        }

        if (prev != null) {
            resp.prev = prev;
        }

        let name = url;
        name = name.replace("?watch=", "").split("&ep=")[0].split("-");
        name.pop();
        name = name.join("-");

        resp.name = name;
        resp.nameWSeason = name;
        resp.subtitles = subtitles;

        resp.status = 200;
        return resp;

    },
    "config": {
        "socketURL": "https://ws1.rapid-cloud.co",
        "origin": "https://rapid-cloud.co",
        "referer": "https://rapid-cloud.co/",
    }
};

const extensionList = [wco, animixplay, fmovies, zoro];
const extensionNames = ["WCOforever", "Animixplay", "Fmovies", "Zoro"];



localStorage.setItem("version", "1.2.1");
if (localStorage.getItem("lastUpdate") === null) {
    localStorage.setItem("lastUpdate", "0");

}






