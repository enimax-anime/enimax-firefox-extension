var secureStorageVar;
function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}

function deviceReady() {
    let MakeCusReq;

    MakeCusReq = async function (url, options) {
        return new Promise(function (resolve, reject) {
            cordova.plugin.http.setDataSerializer('multipart');
            cordova.plugin.http.sendRequest(url, options, function (response) {
                resolve(response.data);
            }, function (response) {
                reject(response.error);
            });
        });
    }



    if (config.chrome) {
        MakeCusReq = async function (url, options) {
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
        var email = document.getElementById("email").value;


        var formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("email", email);
        sendNoti([2, "", "Alert", "Trying to sign you up..."]);

        let fData = {
            method: 'POST',
            data: formData,

        };

        if (config.chrome) {
            fData = {
                method: 'POST',
                body: formData,

            };
        }


        MakeCusReq(`${config.remote}/register`, fData).then(function (data) {
            data = JSON.parse(data);
            if (data.status == 200) {
                alert(data.message);
                window.location = "login.html";
            } else {
                sendNoti([2, "red", "Error", data.message]);
            }
        }).catch(function (data) {
            console.log(data);
            try {
                sendNoti([2, "red", "Error", JSON.parse(data).message]);

            } catch (err) {
                sendNoti([2, "red", "Error", "Couldn't sign you up"]);

            }
        });




    });
}

document.addEventListener("deviceready", function () {
    deviceReady();
}, false);

if (config.chrome) {
    deviceReady();
}
