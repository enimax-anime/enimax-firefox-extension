function toFormData(x) {
    var form = new FormData();
    for (value in x) {
        form.append(value, x[value]);
    }
    return form;
}

function sendNoti(x) {

    return new notification(document.getElementById("noti_con"), {
        "perm": x[0],
        "color": x[1],
        "head": x[2],
        "notiData": x[3]
    });
}

function deviceReady() {

    document.getElementById('submit').addEventListener("click", function () {
        let newPassword = document.getElementById("newPassword").value;
        let oldPassword = document.getElementById("oldPassword").value;
        let confirmNewPassword = document.getElementById("confirmNewPassword").value;

        if(newPassword !== confirmNewPassword){
            alert("The passwords don't match.")
        } else if (newPassword != "" && oldPassword != "") {
            let formation = {};
            formation.method = "POST";

            if(!config.chrome){
                let token = cordova.plugin.http.getCookieString(config.remoteWOport);
                if (token) {
                    formation.headers = {};
                    formation.headers["x-session"] = token;
                }
            }


            formation.body = toFormData({"newPassword": newPassword, "oldPassword": oldPassword});

            fetch(`${config.remote}/reset`, formation).then(response => response.json()).then(function (x) {
                alert(x.message);
               
                if(x.status == 200){
                window.location = "index.html";

               }
            }).catch(function (err) {
                if(typeof err == 'object' && "message" in err){
                    alert(err.message);
                }else{
                alert(err);
                }
            });
        }

    });





}

document.addEventListener("deviceready", function () {
    deviceReady();
}, false);


if(config.chrome){
    deviceReady();
}
