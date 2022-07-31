var offlineDB;
offlineDB = new Dexie("database");
offlineDB.version(1.3).stores({
    vid: "++id,cur_time, ep, name,time1,time2,image,curlink,main_link,times,comp",
    playlist: "++id,room_name",
    playlistOrder: "++id, order"
});

var downloadedDB;
downloadedDB = new Dexie("downloaded");
downloadedDB.version(1.4).stores({
    vid: "++id,cur_time, ep, name,time1,time2,image,curlink,main_link,times,comp",
    playlist: "++id,room_name",
    playlistOrder: "++id, order",
    keyValue : "++id, key, value"
});




async function mysql_query(command, inputs, lastID = false) {

    return new Promise(function(resolve, reject) {
        try {
                db.transaction(function(tx) {
                    tx.executeSql(command, inputs, function(tx, rs) {
                        resolve(rs);
                        
                    }, function(tx, error) {
                        reject(error);
                    });
                  });

                
            
        } catch (error) {
            reject(error);

        }


    });


}








let downloadedStorage = localStorage.getItem("offline") === 'true';



function timern() {
    return parseInt((new Date()).getTime() / 1000);
}

function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}
function toFormData(x) {
    var form = new FormData();
    for (value in x) {
        form.append(value, x[value]);
    }
    return form;
}


function makeRequest(method, url, form, timeout) {
    return new Promise(function (resolve, reject) {
        let formation = {};
        formation.method = method

        if (method == "POST") {
            formation.body = toFormData(form);
        }

        if (token) {
            formation.headers = {};
            formation.headers["x-session"] = token;
        }

        let controller, timeoutId;
        if (timeout) {
            controller = new AbortController();
            timeoutId = setTimeout(() => {
                controller.abort();
            }, 3000);

            formation.signal = controller.signal;

        }



        fetch(url, formation).then(response => response.json()).then(function (x) {
            if (timeout) {
                clearTimeout(timeoutId);
            }

            if (x.status == 200) {
                resolve(x);
            } else if ("errorCode" in x && x["errorCode"] == 70001) {
                window.parent.postMessage({ "action": 21, data: "" }, "*");
                reject(x.message);

            }
            else {
                reject(x.message);
            }
        }).catch(function (error) {
            console.log(error);
            reject(error);
        });
    });
}

async function apiCall(method, form, callback, args = [], timeout = false) {
    try {
        let url = `${config.remote}/api`;
        let response;
        if(localStorage.getItem("offline") === 'true'){
            response = await actions[form.action]({ "body": form }, false);
        }
        else if (config.local) {
            response = await actions[form.action]({ "body": form });

        } else {
            response = await makeRequest(method, url, form, timeout);

        }
        if (response.status == 200) {
            args.push(response);
            callback.apply(null, args);
        } else {
            sendNoti([2, null, "Alert", response.message]);

        }

        return response;

    } catch (err) {
        sendNoti([2, null, "Alert", err]);

    }

}






async function updateTime(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }


    try {

        if ("time" in req.body && "name" in req.body && "ep" in req.body) {
            var cur = req.body.time;
            var name = req.body.name;
            var ep = parseFloat(req.body.ep);



            var count = await db.vid.filter((data) => (data.ep == ep && data.name == name)).count();

            if (count >= 1) {
                await db.vid.where({ ep: ep, name: name }).modify({ cur_time: cur, time2: timern() });

                await db.vid.where({ ep: 0, name: name }).modify({ time2: timern() });




            } else {

                // var insert = await mysql_query("INSERT INTO video (ep,cur_time,name,time2,username) VALUES (?,?,?,?,?)", [ep, cur, name, timern(), username]);

                await db.vid.add({ ep: ep, cur_time: cur, name: name, time2: timern() });




            }


            return { "status": 200, "message": "done" };



        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }






}


async function getShowInfo(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }

    try {
        console.log(req.body);
        if ("cur" in req.body && "name" in req.body && "ep" in req.body) {
            var cur = req.body.cur;
            var name = req.body.name;
            var nameUm;
            if ("nameUm" in req.body) {
                nameUm = req.body.nameUm;
            } else {
                nameUm = req.body.name;

            }

            var ep = req.body.ep;

            if (cur.toLowerCase().substring(0, 7) == "?watch=" && cur.toLowerCase().indexOf("javascript") == -1) {



                var response = {};
                // var getdata = await mysql_query("SELECT cur_time as current, main_link as mainLink from video where ep=0 and name=? and username=? LIMIT 1", [nameUm, username]);

                let getdata = await db.vid.filter((data) => (data.ep == 0 && data.name == nameUm)).toArray();


                if (getdata.length == 0) {


                    // await mysql_query("INSERT INTO video (ep,cur_time,name,curlink,time2,username) VALUES (0,?,?,?,?,?)", [ep, nameUm, cur, timern(), username]);
                    await db.vid.add({ ep: 0, cur_time: ep, name: nameUm, curlink: cur, time2: timern() });




                } else {
                    response.mainLink = getdata[0].mainLink;
                }


                // await mysql_query("UPDATE video set cur_time=?,curlink=?,time2=? where name=? and ep=0 and username=?", [ep, cur, timern(), nameUm, username]);
                await db.vid.where({ ep: 0, name: nameUm }).modify({ cur_time: ep, curlink: cur, time2: timern() });






                // getdata = await mysql_query("SELECT cur_time as curtime from video where ep=? and name=? and username=? LIMIT 1", [ep, name, username]);

                getdata = await db.vid.where({
                    ep: ep,
                    name: name
                }).toArray();


                if (getdata.length != 0) {
                    response.time = getdata[0].cur_time;
                } else {
                    response.time = 0;
                    // await mysql_query("INSERT INTO video (ep,cur_time,name,username) VALUES (?,?,?,?)", [ep, 0, name, username]);

                    await db.vid.add({ ep: ep, cur_time: 0, name: name });

                }




                return { "status": 200, "message": "done", "data": response };
            } else {
                return { "status": 400, "message": "You can't use this link" };

            }


        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        console.log(error);
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}





async function getUserInfo(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }

    try {




        var response = [
            [],
            [],
            []
        ];


        // var getData = await mysql_query("SELECT DISTINCT(name) as b,cur_time as a,image,time2,curlink,comp,main_link from video where ep=0  and NOT isnull(curlink) and username=? ORDER BY time2 DESC", [username]);

        getData = await db.vid.filter((data) => (
            "curlink" in data &&
            data.ep == 0
        )).reverse().sortBy('time2');


        if (getData.length > 0) {
            for (var i = 0; i < getData.length; i++) {
                if (!("comp" in getData[i])) {
                    getData[i]["comp"] = 0;
                }
                let temp = [];
                temp.push(getData[i]["name"], getData[i]["cur_time"], getData[i]["image"], getData[i]["curlink"], getData[i]["comp"], getData[i]["main_link"]);
                response[0].push(temp);
            }

        }



        // var getData = await mysql_query("SELECT id,room_name FROM playlist where username=?", [username]);


        getData = await db.playlist.filter((data) => (
            true
        )).toArray();


        if (getData.length > 0) {
            for (var i = 0; i < getData.length; i++) {

                response[1].push(getData[i]["room_name"], getData[i]["id"]);
            }

        }


        getData = await db.playlistOrder.limit(1).filter((data) => (
            true
        )).toArray();



        if (getData.length > 0) {
            for (var i = 0; i < getData.length; i++) {

                response[2] = [getData[i]["order"]];
            }

        }



        return { "status": 200, "message": "done", "data": response };




    } catch (error) {
        console.log(error);
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}



async function updateImage(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }

    try {

        if ("img" in req.body && "name" in req.body) {
            var name = req.body.name;
            var img = req.body.img;


            var main_link = "";

            if ("url" in req.body) {
                main_link = req.body.url;
            }


            var response = {};
            if (img.toLowerCase().indexOf("javascript") == -1 && main_link.toLowerCase().indexOf("javascript") == -1 && main_link.toLowerCase().substring(0, 7) == "?watch=") {

                // var getData = await mysql_query("SELECT image from video where ep=0 and name=? and username=? LIMIT 1", [name, username]);

                let getData = await db.vid.where({
                    ep: 0,
                    name: name
                }).toArray();
                if (getData.length == 0) {

                    // await mysql_query("INSERT INTO video (ep,cur_time,name,image,username,main_link) VALUES (0,1,?,?,?,?)", [name, img, username, main_link]);
                    await db.vid.add({
                        "ep": 0,
                        "cur_time": 1,
                        "name": name,
                        "image": img,
                        "main_link": main_link
                    });



                }

                return { "status": 200, "message": "done", "data": response };

            } else {
                return { "status": 400, "message": "You can't use the keyword 'javascript' in the URL." };

            }


        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}



async function deleteShow(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("name" in req.body) {

            var name = req.body.name;

            var response = {};

            // await mysql_query("DELETE FROM video where ep=0 and name=? and username=?", [name, username]);
            if(db == downloadedDB){
                await window.parent.removeDirectory(`${name}`);
            }
            await db.vid.filter((x) => (
                x.ep == 0 &&
                x.name == name
            )).delete();

           

            return { "status": 200, "message": "done", "data": response };



        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}


async function changeState(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("state" in req.body && "name" in req.body && !isNaN(parseInt(req.body.state))) {
            var state = parseInt(req.body.state);
            var name = req.body.name;



            // await mysql_query("UPDATE video SET comp=? where ep=0 and name=? and username=?", [state, name, username]);
            await db.vid.where({
                ep: 0,
                name: name
            }).modify({
                comp: state
            });



            var response = {};




            return { "status": 200, "message": "done", "data": response };



        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}


async function updateImageManual(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("img" in req.body && "name" in req.body) {
            var img = req.body.img;
            var name = req.body.name;
            var response = {};

            if (img.toLowerCase().indexOf("javascript") == -1) {

                // await mysql_query("UPDATE video set image=? where name=? and ep=0 and username=?", [img, name, username]);
                await db.vid.where({
                    name: name,
                    ep: 0
                }).modify({
                    image: img
                });
                response.image = img;



                return { "status": 200, "message": "done", "data": response };

            } else {
                return { "status": 400, "message": "You can't have the keyword 'javascript' in the url." };

            }




        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}


async function addRoom(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("room" in req.body) {
            var room_name = req.body.room;

            // let getData = await mysql_query("INSERT INTO playlist (room_name,username) VALUES (?,?)", [room_name, username]);
            let lastId = await db.playlist.add({ room_name });



            var response = {};
            response.lastId = lastId;


            return { "status": 200, "message": "done", "data": response };



        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}



async function deleteRoom(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("id" in req.body && !isNaN(parseInt(req.body.id))) {
            var id_room = parseInt(req.body.id);
            await db.playlist.delete(id_room);
            var response = {};
            return { "status": 200, "message": "done", "data": response };



        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}


async function changeOrder(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("order" in req.body) {
            var order = req.body.order;

            order = order.split(",");
            var check = 0;
            for (var i = 0; i < order.length; i++) {
                if (isNaN(parseInt(order[i]))) {
                    check = 1;
                    break;
                }
            }

            var response = {};

            if (check == 0) {

                // await mysql_query("INSERT INTO playlistOrder (username,order1) VALUES (?,?) ON DUPLICATE KEY UPDATE order1=?", [username, req.body.order, req.body.order]);
                db.playlistOrder.put({ "id": 0, "order": req.body.order });
                return { "status": 200, "message": "done", "data": response };

            } else {
                return { "status": 400, "message": "Bad request" };


            }

        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        console.log(error);
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}


async function changeMainLink(req, offline = true) {
    let db = offlineDB;
    if(!offline || downloadedStorage){
        db = downloadedDB;
    }
    try {

        if ("url" in req.body && "name" in req.body) {
            var main_link = req.body.url;
            var name = req.body.name;




            var response = {};
            if (main_link.toLowerCase().indexOf("javascript") == -1 && main_link.toLowerCase().substring(0, 7) == "?watch=") {

                await db.vid.where({
                    name: name,
                    ep: 0
                }).modify({
                    main_link: main_link
                });

                response.url = main_link;

                return { "status": 200, "message": "done", "data": response };

            } else {
                return { "status": 400, "message": "You can't use the keyword 'javascript' in the URL. Also, you have to start the url with '?watch='" };

            }


        } else {
            return { "status": 400, "message": "Bad request" };


        }

    } catch (error) {
        console.log(error);
        return { "status": 500, "errorCode": 10000, "message": "Database error." };
    }

}
var actions = {
    1: updateTime,
    2: getShowInfo,
    4: getUserInfo,
    5: updateImage,
    6: deleteShow,
    7: changeState,
    9: updateImageManual,
    10: addRoom,
    12: deleteRoom,
    13: changeOrder,
    14: changeMainLink

};


var fileName = window.cordova.file.applicationStorageDirectory + 'databases/' + 'my.db';
window.resolveLocalFileSystemURL(fileName, (file) => {
    console.log(file);
});

readFile(name) {
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