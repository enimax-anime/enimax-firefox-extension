if(config.local){
    window.location = "index.html";
}

var secureStorageVar;
document.getElementById("settingsMain").onclick = function(){
    window.location = "settings.html";
}
function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}

function deviceReady(){
    let MakeCusReq;
    
    MakeCusReq = async function(url, options) {
        return new Promise(function (resolve, reject) {
            cordova.plugin.http.setDataSerializer('multipart');
            cordova.plugin.http.sendRequest(url, options, function (response) {
                resolve(response.data);
            }, function (response) {
                reject(response.error);
            });
        });
    }

    

    if(config.chrome){
        MakeCusReq = async function(url, options) {
            return new Promise(function (resolve, reject) {
                fetch(url, options).then((response) => response.text()).then((response) => {
                    resolve(response);
                }).catch((response) => {
                    reject(response);
                });
            });
        } 
    }

    

    document.getElementById('submit').addEventListener("click", function () {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        sendNoti([2, "", "Alert", "Trying to sign you in..."]);


        let fData = {
            method: 'POST',
            data: formData,

        };

        if(config.chrome){
            fData = {
                method: 'POST',
                body: formData,

            };
        }

        MakeCusReq(`${config.remote}/login`, fData).then(function (data) {
            data = JSON.parse(data);
            alert(data.message);

            if (config.chrome || cordova.plugin.http.getCookieString(config.remoteWOport).indexOf("connect.sid") > -1) {
                window.location = "index.html";
            } else {
                sendNoti([2, "red", "Error", "Couldn't log you in"]);
            }
        }).catch(function (data) {
            console.log(data);
            try {
                sendNoti([2, "red", "Error", JSON.parse(data).message]);

            } catch (err) {
                sendNoti([2, "red", "Error", "Couldn't log you in"]);

            }
        });




    });
}

document.addEventListener("deviceready", function () {
    deviceReady();
}, false);

if(config.chrome){
    deviceReady();
}

