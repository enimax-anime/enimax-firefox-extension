var username = "hi";
var lastSrc = "";
var token;
var hls;
let doubleTapTime = isNaN(parseInt(localStorage.getItem("doubleTapTime"))) ? 5 : parseInt(localStorage.getItem("doubleTapTime"));
let skipButTime = isNaN(parseInt(localStorage.getItem("skipButTime"))) ? 30 : parseInt(localStorage.getItem("skipButTime"));
var CustomXMLHttpRequest = XMLHttpRequest;


document.getElementById("doubleTime").oninput = function(){
	if(isNaN(parseInt(document.getElementById("doubleTime").value))){
		document.getElementById("doubleTime").value = "";
	}else{
		localStorage.setItem("doubleTapTime", document.getElementById("doubleTime").value);
		doubleTapTime =  isNaN(parseInt(localStorage.getItem("doubleTapTime"))) ? 5 : parseInt(localStorage.getItem("doubleTapTime"));
	}
}


document.getElementById("skipTime").oninput = function(){
	if(isNaN(parseInt(document.getElementById("skipTime").value))){
		document.getElementById("skipTime").value = "";
	}else{
		localStorage.setItem("skipButTime", document.getElementById("skipTime").value);
		skipButTime =  isNaN(parseInt(localStorage.getItem("skipButTime"))) ? 5 : parseInt(localStorage.getItem("skipButTime"));
	}
}

var sid;

let engineTemp = location.search.split("engine=");
let engine;
let nextTrackTime;
let curTrack = undefined;
if (engineTemp.length == 1) {
	engine = 0;
} else {
	engine = parseInt(engineTemp[1]);
}


let downloaded = localStorage.getItem("offline") === 'true';
if (downloaded) {
	CustomXMLHttpRequest = window.parent.XMLHttpRequest;
}
class XMLHttpRequest2 {
	constructor() {
		this.headers = {};
		this.responseHeaders = {};
		this.config = {};

		this.delegate = null;
		this.requestHeaders = {
			"origin": "https://rapid-cloud.ru",
			"referer": "https://rapid-cloud.ru/",
			"sid": sid,
		};
		this.responseHeaders = {};
		this.listeners = {};
		this.readyState = 0;
		this.responseType = "text";
		this.withCredentials = false;
		this.status = 0;
		this.statusText = "";
		this.response;
		this.listeners = {};
	}
	setRequestHeader(header, value) {
		this.requestHeaders[header.toLowerCase()] = value;
	}

	set onerror(x) {
	}

	set onabort(x) {
	}


	set onload(x) {
	}


	set onloadend(x) {
	}


	set onloadstart(x) {
	}


	set onprogress(x) {
	}


	set onreadystatechange(x) {
		this.addEventListener("readystatechange", x);
	}

	set ontimeout(x) {
	}



	getAllResponseHeaders() {
		var responseHeaders = this.responseHeaders;
		var names = Object.keys(responseHeaders);
		var list = [];
		for (var i = 0; i < names.length; i++)
			list.push([names[i], responseHeaders[names[i]]].join(":"));

		return list.join("\r\n");
	}

	getResponseHeader(name) {
		name = name.toLowerCase();
		return this.responseHeaders[name];
	}

	open(method, url, async, user, password) {

		this.config.method = !method ? "GET" : method.toUpperCase();
		this.config.url = url;
		this.config.async = async === undefined ? true : async;
		this.config.user = user;
		this.config.password = password;
	}



	send(data) {

		let option = {
			"method": this.config.method,
			"responseType": this.responseType

		}

		if (Object.keys(this.requestHeaders).length != 0) {

			option.headers = this.requestHeaders;
		}


		if (data) {
			option.body = data;
		}

		let self = this;

		window.parent.cordova.plugin.http.sendRequest(self.config.url, option,
			function (response) {
				if (self.responseType == "text") {
					self.responseText = response.data;
				}

				self.responseURL = response.url;
				self.responseHeaders = (response.headers);
				self.status = response.status;
				self.response = response.data;

				self.dispatchReadyStateChangeEvent(1);
				self.dispatchReadyStateChangeEvent(2);
				self.dispatchReadyStateChangeEvent(3);
				self.dispatchReadyStateChangeEvent(4);

			},
			function (response) {
				console.error(response);
			});





	}

	abort() {

	}

	addEventListener(eventName, eventFunc) {
		this.listeners[eventName] = eventFunc;
	}

	dispatchReadyStateChangeEvent(readyState) {
		this.readyState = readyState;

		if ("readystatechange" in this.listeners) {
			if (typeof this.listeners["readystatechange"] == "function") {
				this.listeners["readystatechange"]();
			}
		}
	}



}

window.onmessage = function (x) {
	if (x.data.action == 1) {
		data_main = x.data;
		get_ep();
	} else if (x.data.action == "play") {
		a.vid.play();
	} else if (x.data.action == "pause") {
		a.vid.pause();
	} else if (x.data.action == "toggle") {
		a.togglePlay(a);
	} else if (x.data.action == "next") {
		next_ep_func(1);
	} else if (x.data.action == "previous") {
		next_ep_func(-1);
	}else if (x.data.action == "elapsed") {
		a.vid.currentTime = x.data.elapsed;
	} else if (parseInt(x.data.action) == 200) {
		token = x.data.data;
		if (config.chrome == false && token.indexOf("connect.sid") == -1) {
			window.parent.postMessage({ "action": 21, data: "" }, "*");

		} else {

			ini_main();




		}
	}



};



window.parent.postMessage({ "action": 401, data: "landscape" }, "*");





function sendNoti(x) {

	return new notification(document.getElementById("noti_con"), {
		"perm": x[0],
		"color": x[1],
		"head": x[2],
		"notiData": x[3]
	});
}

function fix_title(x) {
	try {
		x = x.split("-");
		temp = "";
		for (var i = 0; i < x.length; i++) {
			temp = temp + x[i].substring(0, 1).toUpperCase() + x[i].substring(1) + " ";
		}
		return temp;
	} catch {
		return "Err";
	}
}





function nextTrack() {
	let curTime = a.vid.currentTime;
	let check = false;

	for (let i = 0; i < curTrack.cues.length; i++) {

		if (curTrack.cues[i].startTime > curTime) {
			nextTrackTime = curTrack.cues[i].startTime;
			check = true;
			break;
		}

	}



	if (check === false) {
		nextTrackTime = a.vid.duration;
	}

}

function skipToNextTrack() {
	if (curTrack instanceof TextTrack && !isNaN(parseInt(nextTrackTime))) {
		a.vid.currentTime = nextTrackTime - 2;
	}
}
document.getElementById("fastFor").onclick = function () {
	skipToNextTrack();
};





class vid {
	constructor() {
		this.overlay = document.querySelector("#seek_overlay");
		this.bar_main = document.querySelector("#bar_main");
		this.bar_con = document.querySelector("#bar_con");
		this.big_play = document.querySelector("#big_play");
		this.controlTop = document.querySelectorAll(".controlTop");
		this.current = document.querySelector("#current");
		this.total = document.querySelector("#total");
		this.pop = document.querySelector("#pop");
		this.popControls = document.querySelector("#options");
		this.seeker = document.querySelector("#seeker");
		this.bar_con1 = document.querySelector("#bar_con1");
		this.loaded = document.querySelector("#loaded");
		this.big_play = document.querySelector("#big_play");
		this.fullscreen = document.querySelector("#fullscreen");
		this.con = document.querySelector("#con_2");
		this.fullscreenDOM = document.querySelector("#con");
		this.pip = document.querySelector("#pip");
		this.lock = document.querySelector("#lock");
		this.lock2 = document.querySelector("#lock_2");
		this.retry = document.querySelector("#retry");
		this.buffered = document.querySelector("#buffered");
		this.locked = false;
		this.fullscreen.style.display = "none";
		this.downTown = 0;
		this.seekMode = false;
		var x = this;
		this.updateTimeout();
		this.seekTimeout;
		this.fullscreen.addEventListener("click", function () {
			x.goFullScreen(x);
		});


		this.retry.addEventListener("click", function () {
			location.reload();
		});


		this.lock.addEventListener("click", function () {
			x.lockVid(x);
		});


		this.lock2.addEventListener("click", function () {
			x.lockVid2(x);
		});


		this.lock.addEventListener("ontouchstart", function () {
			event.preventDefault();
			x.lockVid(x);
		});


		this.lock2.addEventListener("ontouchstart", function () {
			event.preventDefault();

			x.lockVid2(x);
		});


		this.pip.addEventListener("click", function () {
			x.togglePictureInPicture(x);
		});

		this.fullscreenCheck = 0;
		this.open = 1;

		this.vid = document.querySelector("#v");
		x.windowSize = window.innerWidth;



		this.vid.addEventListener("timeupdate", function () {
			x.updateTime(x);
			if (curTrack instanceof TextTrack) {
				nextTrack();
			}

		});

		this.vid.addEventListener("progress", function () {
			x.updateBuffer(x);

		});



		this.vid.addEventListener("loadedmetadata", function () {
			window.parent.postMessage({ "action": 12, nameShow: data_main.name, episode: data_main.episode, prev: true, next: true, "duration" : x.vid.duration, "elapsed" : x.vid.currentTime}, "*");
			x.total.innerText = x.timeToString(x.vid.duration);

			let whichFit = parseInt(localStorage.getItem("fillMode")) || 0;
			x.setObjectSettings(whichFit);


		});

		this.vid.addEventListener("ended", function () {

			if (localStorage.getItem("autoplay") == "true") {
				next_ep_func(1);
			}

		});

		this.vid.addEventListener("canplay", function () {
			x.current.innerText = x.timeToString(x.vid.currentTime);


		});


		this.vid.addEventListener("waiting", function () {


		});



		this.big_play.addEventListener("click", function () {
			x.togglePlay(x);
		});
		this.vid.addEventListener("play", function () {
			window.parent.postMessage({ "action": 15 }, "*");

			x.play(x);

		});

		this.vid.addEventListener("pause", function () {
			window.parent.postMessage({ "action": 16 }, "*");

			x.pause(x);


		});

		this.vid.addEventListener("durationchange", function () {

			x.total.innerText = x.timeToString(x.vid.duration);
		});




		this.vid.addEventListener("mousemove", function () {
			x.updateTimeout("T");

		});

		this.bar_con1.addEventListener("mousemove", function () {
			x.showTimestamp(x);

		});

		this.bar_con1.addEventListener("click", function () {
			if (x.seekMode) {
				x.bar_con1.blur();
				x.seekMode = false;
			} else {
				x.bar_con1.focus();
				x.seekMode = true;
			}

		});

		this.bar_con1.addEventListener("mouseout", function () {
			x.hideTimestamp(x);


		});







		window.onresize = function () {
			x.windowSize = window.innerWidth;
		}

		this.vid.addEventListener("mousedown", function () {
			x.type = 2;
			x.ini_seek(x);
		});


		this.vid.addEventListener("touchstart", function () {
			event.preventDefault();
			x.type = 2;
			x.ini_seek(x, 1);
		});

		this.vid.addEventListener("touchmove", function () {
			event.preventDefault();

			x.move_seek(x);

		});

		this.vid.addEventListener("touchend", function () {
			event.preventDefault();

			x.end_seek(x, 2);

		});


		this.vid.addEventListener("touchcancel", function () {
			event.preventDefault();

			x.end_seek(x, 2);

		});



		this.type = 0;
		this.bar = document.querySelector("#bar");
		this.bar_con1.addEventListener("mousedown", function () {
			x.type = 1;
			x.ini_seek(x);
		});


		this.bar_con1.addEventListener("touchstart", function () {
			event.preventDefault();
			x.type = 1;
			x.ini_seek(x, 1);
		});

		this.bar_con1.addEventListener("touchmove", function () {
			event.preventDefault();

			x.move_seek(x);

		});


		this.bar_con1.addEventListener("touchend", function () {
			event.preventDefault();

			x.end_seek(x, 2);

		});


		this.bar_con1.addEventListener("touchcancel", function () {
			event.preventDefault();

			x.end_seek(x, 2);


		});


		this.overlay.addEventListener("mousemove", function () {
			x.move_seek(x);
		});
		this.overlay.addEventListener("mouseup", function () {
			x.end_seek(x, 2);
		});
		this.overlay.addEventListener("mouseout", function () {
			x.end_seek(x);
		});

		this.overlay.addEventListener("mousedown", function () {

			x.vid_click(event.timeStamp, [event.clientX, event.clientY]);
		});

		this.clickTimeout;

		this.lastTime;



		setInterval(function () {

			window.parent.postMessage({ "action": 301,  "elapsed" : x.vid.currentTime, "isPlaying":!x.vid.paused}, "*");

			if (((new Date()).getTime() - x.lastTime) > 3000 && x.open == 1) {
				x.close_controls();
			}
		}, 1000);

		this.doubleClickTime;
		this.doubleClickCoords;
		this.doubleClickCheck = 0;
		this.doubleMode = 0;


		this.objectFitArray = ["contain", "cover", "fill"];

		this.objectPositionArray = ["center", "center bottom"];

		this.objectPresets = [[0, 0], [1, 0], [1, 1], [2, 0]];
		this.currentPreset = 0;

		this.objectFit = this.objectFitTemp;
		this.objectPosition = this.objectPositionTemp;


	}

	updateBuffer(x) {
		let self = x;
		let current = self.vid.currentTime;
		for (let i = 0; i < self.vid.buffered.length; i++) {
			let start = self.vid.buffered.start(i);
			let end = self.vid.buffered.end(i);

			if (start <= current && end >= current) {
				self.buffered.style.left = (start / self.vid.duration) * 100 + "%";
				self.buffered.style.width = ((end - start) / self.vid.duration) * 100 + "%";
				break;
			}
		}
	}

	lockVid(x) {
		x.con.style.pointerEvents = "none";
		x.lock2.style.opacity = 1;
		x.lock2.style.pointerEvents = "auto";
		x.locked = true;

		x.close_controls();

	}

	lockVid2(x) {
		x.con.style.pointerEvents = "auto";
		x.lock2.style.pointerEvents = "none";

		x.lock2.style.opacity = 0;
		x.locked = false;

		x.open_controls();
	}

	toggleLock(x) {
		if (x.locked) {
			x.lockVid2(x);
		} else {
			x.lockVid(x);
		}
	}
	play(x) {
		x.big_play.className = "pause_bg";
	}
	pause(x) {
		x.big_play.className = "play_bg";
	}
	togglePlay(x) {
		if (isNaN(a.vid.duration)) {
			return;
		}
		if (x.vid.paused) {
			x.vid.play();
		} else {
			x.vid.pause();
		}
	}

	toggleMute(x) {
		if (x.vid.muted) {
			x.vid.muted = false;
		} else {
			x.vid.muted = true;

		}
	}
	setObjectSettings(x, updateLocal = true) {
		let settings = this.objectPresets[x];

		let playerFitDOM = document.getElementById("playerFit").children;
		for (var i = 0; i < playerFitDOM.length; i++) {
			let curDOM = playerFitDOM[i];
			if (parseInt(curDOM.getAttribute("data-num")) == x) {
				curDOM.style.backgroundColor = "white";
				curDOM.style.color = "rgb(46, 46, 46)";
			} else {
				curDOM.style.backgroundColor = "rgb(46, 46, 46)";
				curDOM.style.color = "white";
			}
		}

		if (updateLocal) {
			localStorage.setItem("fillMode", x);
		}


		this.vid.style.objectFit = this.objectFitArray[settings[0]];
		this.vid.style.objectPosition = this.objectPositionArray[settings[1]];
		this.objectFitTemp = this.objectFitArray[settings[0]];

		this.objectPositionTemp = this.objectPositionArray[settings[1]];
	}
	vid_click(time, coor) {

		if (time - this.doubleClickTime < 400) {
			this.doubleMode = 1;
		} else {
			this.doubleMode = 0;

		}
		this.doubleClickTime = time;
		if (this.doubleMode == 0) {
			if (this.open == 1) {
				this.close_controls("44", "dd");
			} else {
				this.open_controls("55", "dd");

			}
		} else if (this.doubleMode == 1 && typeof this.doubleClickCoords == 'object' && this.doubleClickCoords.length == 2 && Math.abs(this.doubleClickCoords[0] - coor[0]) < 50 && Math.abs(this.doubleClickCoords[1] - coor[1]) < 50) {

			if (coor[0] > window.innerWidth / 2) {
				this.vid.currentTime += doubleTapTime;
				a.updateTime(a);


			} else {
				this.vid.currentTime -= doubleTapTime;
				a.updateTime(a);


			}
			this.updateTime(this);
			if (this.open == 0) {
				this.open_controls();
			}
		}

		this.doubleClickCoords = coor;


	}

	showTimestamp(x) {
		x.seeker.style.opacity = 1;
		let coords = x.getcoordinates(event);
		let temp = Math.max(0, Math.min((coords.screenX - x.bar.getBoundingClientRect().x) / x.bar.getBoundingClientRect().width, 1));
		x.seeker.innerText = x.timeToString(temp * x.vid.duration);
		x.seeker.style.left = temp * 100 + "%";

	}

	hideTimestamp(x) {
		x.seeker.style.opacity = 0;

	}

	ini_seek(x, y) {

		if (isNaN(a.vid.duration)) {
			return;
		}
		if (!("touches" in event) || (("touches" in event) && event.touches.length <= 1)) {
			let coords = x.getcoordinates(event);
			if (y != 1) {

				x.overlay.style.pointerEvents = "auto";


			}
			if (x.type == 2) {
				x.iniX = coords.screenX;
				x.iniY = coords.screenY;
				x.timeStampStart = event.timeStamp;

				x.canSeekNow = false;
				x.shouldPlay = false;
				clearTimeout(x.seekTimeout);


				x.seekTimeout = setTimeout(function () {
					x.canSeekNow = true;
					if (x.vid.paused) {
						x.shouldPlay = false;
					} else {
						x.shouldPlay = true;
						x.vid.pause();
					}
					x.updateTimeout("f");

					x.seeker.style.opacity = "1";

				}, 700);
			} else if (x.type == 1) {
			}
			x.currentTime = x.vid.currentTime;


			x.check = 2;
			x.seeker.style.opacity = "1";



			if (x.type == 1) {
				let temp = Math.max(0, Math.min((coords.screenX - x.bar.getBoundingClientRect().x) / x.bar.getBoundingClientRect().width, 1));
				let temp2 = x.vid.duration * temp;
				let temp3 = 100 * temp;


				x.vid.currentTime = temp2;

				x.bar_main.style.left = temp3 + "%";
				x.seeker.style.left = Math.min(temp3) + "%";
				x.loaded.style.width = temp3 + "%";

				x.seeker.innerText = x.timeToString(temp2);
				x.current.innerText = x.timeToString(temp2);


			} else if (x.type == 2) {
				document.getElementById('con').style.transitionDuration = `0s`;

				let temp = Math.min(x.vid.duration, Math.max(x.currentTime + 30 * (coords.screenX - x.iniX) / x.windowSize, 0));
				let temp3 = 100 * (temp / x.vid.duration);
				x.seeker.innerText = x.timeToString(temp);
				x.seeker.style.opacity = "0";

				x.seeker.style.left = temp3 + "%";
			}
		} else {
			x.type = 3;
			clearTimeout(x.seekTimeout);


			x.currentPresetTemp = x.currentPreset;
			x.close_controls();
			x.gesture = Math.hypot((event.touches[0].clientX - event.touches[1].clientX), (event.touches[0].clientY - event.touches[1].clientY));

		}
	}

	updateTimeout(r) {
		this.lastTime = (new Date()).getTime();

		if (this.open == 0 && this.locked === false) {
			this.open_controls("555", "d");
		}
	}

	move_seek(x, y = 0, z = 0) {
		if (isNaN(a.vid.duration)) {
			return;
		}
		let coords;
		if (y == 1) {
			coords = x.getcoordinates(z);

		} else {
			coords = x.getcoordinates(event);

		}

		if (x.type == 1) {
			let temp = Math.max(0, Math.min((coords.screenX - x.bar.getBoundingClientRect().x) / x.bar.getBoundingClientRect().width, 1));
			let temp2 = x.vid.duration * temp;
			let temp3 = 100 * temp;


			x.vid.currentTime = temp2;

			x.bar_main.style.left = temp3 + "%";
			x.seeker.style.left = temp3 + "%";
			x.loaded.style.width = temp3 + "%";

			x.seeker.innerText = x.timeToString(temp2);
			x.current.innerText = x.timeToString(temp2);

			x.updateTimeout("f");

		} else if (x.type == 2) {


			if (x.canSeekNow || x.check == 1) {

				let temp = Math.min(x.vid.duration, Math.max(x.currentTime + (180) * (coords.screenX - x.iniX) / x.windowSize, 0));


				x.seeker.style.opacity = 1;

				let temp3 = 100 * (temp / x.vid.duration);

				x.check = 1;

				x.vid.currentTime = temp;

				x.bar_main.style.left = temp3 + "%";
				x.seeker.style.left = temp3 + "%";
				x.loaded.style.width = temp3 + "%";

				x.seeker.innerText = x.timeToString(temp);
				x.current.innerText = x.timeToString(temp);

				x.updateTimeout("f");
			} else if ((Math.abs(x.iniX - coords.screenX) > 50) || (Math.abs(x.iniY - coords.screenY) > 50)) {
				x.canSeekNow = false;
				clearTimeout(x.seekTimeout);
				x.downTown = -x.iniY + coords.screenY;
				if (-x.iniY + coords.screenY > 0 && -x.iniY + coords.screenY <= 100) {
					document.body.style.backgroundColor = `rgba(255,255,255,${Math.floor((-x.iniY + coords.screenY) / 100)})`;
				}
				x.check = 99;
				document.getElementById('con').style.transform = `translateY(${Math.max(Math.min(-x.iniY + coords.screenY, 100), 0)}px)`;

			} else if (x.check == 99) {
				x.downTown = -x.iniY + coords.screenY;

				document.getElementById('con').style.transform = `translateY(${Math.max(Math.min(-x.iniY + coords.screenY, 100), 0)}px)`;

			}


		} else if (x.type == 3) {
			try {
				if (event.touches.length >= 2) {

					let temp = Math.hypot((event.touches[0].clientX - event.touches[1].clientX), (event.touches[0].clientY - event.touches[1].clientY)) - x.gesture;


					if (temp > 300 && (this.currentPreset + 3) < this.objectPresets.length) {
						this.currentPresetTemp = (this.currentPreset + 3);

						this.setObjectSettings(this.currentPresetTemp);

					}
					else if (temp > 200 && (this.currentPreset + 2) < this.objectPresets.length) {
						this.currentPresetTemp = (this.currentPreset + 2);

						this.setObjectSettings(this.currentPresetTemp);

					} else if (temp > 100 && (this.currentPreset + 1) < this.objectPresets.length) {
						this.currentPresetTemp = (this.currentPreset + 1);
						this.setObjectSettings(this.currentPresetTemp);


					} else if (temp < -100 && (this.currentPreset - 1) >= 0) {
						this.currentPresetTemp = (this.currentPreset - 1);
						this.setObjectSettings(this.currentPresetTemp);



					} else if (temp < -200 && (this.currentPreset - 2) >= 0) {
						this.currentPresetTemp = (this.currentPreset - 2);
						this.setObjectSettings(this.currentPresetTemp);

					} else if (temp < -300 && (this.currentPreset - 3) >= 0) {
						this.currentPresetTemp = (this.currentPreset - 3);
						this.setObjectSettings(this.currentPresetTemp);

					} else {

						this.currentPresetTemp = (this.currentPreset);
						this.setObjectSettings(this.currentPresetTemp);

					}



				}
			} catch (err) {
				console.error(err);
				this.setObjectSettings(0);
			}
		}


	}

	end_seek(x, y) {
		if (isNaN(a.vid.duration)) {
			x.updateTimeout("f");

			return;
		}

		if (x.type == 2 && x.shouldPlay) {
			a.vid.play();

		}

		x.updateTime(x);
		x.updateBuffer(x);
		document.getElementById('con').style.transitionDuration = "0.2s";
		document.body.style.backgroundColor = "black";


		if (x.downTown >= 100 && !config.chrome) {

			window.parent.postMessage({ "action": 400 }, "*");

			requestAnimationFrame(function () {
				document.getElementById('con').style.transform = `translateY(0px)`;
				document.getElementById('popOut').style.display = "block";
				document.getElementById('bar_con').style.display = "none";
				document.getElementById('epCon').style.display = "none";


			});
		} else {
			requestAnimationFrame(function () {
				document.getElementById('con').style.transform = `translateY(0px)`;

			});
		}

		x.downTown = 0;

		clearTimeout(x.seekTimeout);
		x.canSeekNow = false;
		if (x.type != 0) {

			x.objectFit = x.objectFitTemp;
			x.objectPosition = x.objectFitTemp;

			if (typeof x.currentPresetTemp == "number") {
				x.currentPreset = x.currentPresetTemp;

			} else {
				x.currentPreset = 0;

			}


			let coords = x.getcoordinates(event);
			x.seeker.style.opacity = 0;
			x.seeker.style.pointerEvents = "none";

			x.overlay.style.pointerEvents = "none";

			if (x.check == 2 && y == 2 && x.type == 2) {
				x.vid_click(event.timeStamp, [coords.screenX, coords.screenY]);

			} else {
				try {
					update(19);
					lastUpdate = a.vid.currentTime;
				} catch (err) {

				}
			}


			x.type = 0;

		}
	}

	updateTime(x) {
		x.bar_main.style.left = 100 * (x.vid.currentTime / x.vid.duration) + "%";
		x.loaded.style.width = 100 * (x.vid.currentTime / x.vid.duration) + "%";
		x.current.innerText = x.timeToString(x.vid.currentTime);
	}

	getcoordinates(x) {

		let temp = {};
		if ("touches" in x) {
			if (x.touches.length == 0) {
				temp.screenY = x.changedTouches[0].clientY;
				temp.screenX = x.changedTouches[0].clientX;
			} else {
				temp.screenY = x.touches[0].clientY;
				temp.screenX = x.touches[0].clientX;
			}

		} else {
			temp.screenY = x.clientY;
			temp.screenX = x.clientX;
		}

		return temp;
	}

	close_controls(x, y) {


		this.pop.style.opacity = 0;
		this.popControls.style.opacity = 0;
		this.popControls.style.pointerEvents = "none";


		this.bar_con.style.bottom = "-70px";
		this.bar_con.style.pointerEvents = "none";
		this.bar_con.style.opacity = "0";

		for (var i = 0; i < this.controlTop.length; i++) {
			this.controlTop[i].style.pointerEvents = "none";
			this.controlTop[i].style.opacity = "0";
		}

		this.open = 0;


	}

	open_controls(x, y) {

		if (x != 0) {
			this.lastTime = (new Date()).getTime();
		}


		this.pop.style.opacity = 1;
		this.popControls.style.opacity = 1;
		this.popControls.style.pointerEvents = "auto";

		this.bar_con.style.bottom = "0px";
		this.bar_con.style.opacity = "1";
		this.bar_con.style.pointerEvents = "auto";

		for (var i = 0; i < this.controlTop.length; i++) {
			this.controlTop[i].style.pointerEvents = "auto";
			this.controlTop[i].style.opacity = "1";
		}



		this.open = 1;

	}

	togglePictureInPicture(x) {


		try {


			window.parent.postMessage({ "action": 11, data: "landscape" }, "*");





		} catch (err) {
			console.error(err);
		}


		if (document.pictureInPictureElement) {
			document.exitPictureInPicture();
		} else if (document.pictureInPictureEnabled) {
			x.vid.requestPictureInPicture();
		}

		x.close_controls();



	}

	goFullScreen(x) {

		if (x.fullscreenCheck == 0) {
			if (x.fullscreenDOM.requestFullscreen) {
				x.fullscreenDOM.requestFullscreen();
			}
			else if (x.fullscreenDOM.mozRequestFullScreen) {
				x.fullscreenDOM.mozRequestFullScreen();
			}
			else if (x.fullscreenDOM.webkitRequestFullscreen) {
				x.fullscreenDOM.webkitRequestFullscreen();
			}
			else if (x.fullscreenDOM.msRequestFullscreen) {
				x.fullscreenDOM.msRequestFullscreen();
			}
			x.fullscreenCheck = 1;

		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
			else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
			x.fullscreenCheck = 0;
		}


	}

	timeToString(x) {

		if (Math.floor(x / 60) < 10) {
			var l = "0".concat(Math.floor(x / 60).toString());
		}
		else {
			var l = Math.floor(x / 60).toString();
		}

		if (x % 60 < 10) {
			var r = "0".concat(Math.floor(x % 60).toString());
		}
		else {
			var r = Math.floor(x % 60).toString();
		}
		return (l + ":" + r);

	}





}
function backToNormal() {
	window.parent.postMessage({ "action": 401 }, "*");
	// document.getElementById('con').style.transform = `translateY(0px)`;
	// document.getElementById('con').style.bottom = "auto";
	// document.getElementById('con').style.top = "0px";
	// document.getElementById('con').style.left = "0px";
	// document.getElementById('con').style.width = "100%";
	// document.getElementById('con').style.height = "100%";
	document.getElementById('epCon').style.display = "block";

	document.getElementById('popOut').style.display = "none";
	document.getElementById('bar_con').style.display = "block";
}

window.addEventListener('message', function (x) {
	if (x.data.action == 4) {
		next_ep_func(0, x.data.data);
	}
});
var a = new vid();




function cssToJava(x) {
	let a = x.split("-");
	let s = a[0].toLowerCase();
	for (var i = 1; i < a.length; i++) {
		s += a[i].substring(0, 1).toUpperCase() + a[i].substring(1).toLowerCase();
	}

	return s;
}




var set = document.querySelector("#setting_con_main");
var set_con = document.querySelector("#setting_con");
var setting_icon_dom = document.querySelector("#setting_icon");


setting_icon_dom.addEventListener("click", function () {

	set_con.style.display = "block";

});



function get_ep_ini() {
	a.setObjectSettings(1, false);

	let tttf = decodeURIComponent(location.search.replace("?watch=", ""));
	if (downloaded) {
		let rootDir = decodeURIComponent(location.search.replace("?watch=", "").split("&")[0]);
		window.parent.makeLocalRequest("GET", `${rootDir}/viddata.json`).then(function (viddata) {
			viddata = JSON.parse(viddata).data;

			data_main = viddata;
			if ("next" in data_main) {
				let temp = data_main.next.split("&");
				temp.pop();
				temp = temp.join("&");
				delete data_main["next"];
				try {
					console.log(`${rootDir.split("/")[1]}/${temp}`);
					window.parent.makeLocalRequest("GET", `/${rootDir.split("/")[1]}/${btoa(temp)}/.downloaded`).then((x) => {
						data_main.next = encodeURIComponent(`/${rootDir.split("/")[1]}/${btoa(temp)}`);
						document.getElementById("next_ep").style.display = "table-cell";

					}).catch((x) => console.log(x));
				} catch (err) {

				}
			}

			if ("prev" in data_main) {
				let temp = data_main.prev.split("&");
				temp.pop();
				temp = temp.join("&");
				delete data_main["prev"];
				try {
					console.log(`${rootDir.split("/")[1]}/${temp}`);
					window.parent.makeLocalRequest("GET", `/${rootDir.split("/")[1]}/${btoa(temp)}/.downloaded`).then((x) => {
						data_main.prev = encodeURIComponent(`/${rootDir.split("/")[1]}/${btoa(temp)}`);
						document.getElementById("prev_ep").style.display = "table-cell";

					}).catch((x) => console.log(x));
				} catch (err) {

				}
			}

			data_main.sources = [{
				"name": viddata.sources[0].name,
				"type": viddata.sources[0].type,
				"url": viddata.sources[0].type == 'hls' ? `${rootDir}/master.m3u8` : `${window.parent.cordova.file.externalDataDirectory}/${rootDir}/master.m3u8`,
			}];

			engine = data_main.engine;
			get_ep();
		}).catch(function (err) {
			alert(err);
		});

	} else {
		window.parent.postMessage({ "action": 5, "data": `${tttf}` }, "*");
	}
}
function next_ep_func(t, msg) {
	for (var i = 0; i < a.vid.textTracks.length; i++) {
		a.vid.textTracks[i].mode = "hidden";
	}


	if (t == 1 && typeof data_main.next != "undefined") {
		history.replaceState({ page: 1 }, "", "?watch=" + (data_main.next));
		data_main = null;

		a.vid.pause();
		a.vid.src = "";
		a.vid.load();
		clearInterval(update_int);
		document.getElementById("ep_dis").innerHTML = "loading...";
		document.getElementById("total").innerHTML = "";
		ini_main();
		console.log("inimain 1");

	} else if (t == -1 && typeof data_main.prev != "undefined") {
		history.replaceState({ page: 1 }, "", "?watch=" + (data_main.prev));
		data_main = null;


		a.vid.pause();
		a.vid.src = "";
		a.vid.load();
		clearInterval(update_int);
		document.getElementById("ep_dis").innerHTML = "loading...";
		document.getElementById("total").innerHTML = "";
		ini_main();
		console.log("inimain 2");

	} else if (t == 0) {
		history.replaceState({ page: 1 }, "", msg);
		data_main = null;


		a.vid.pause();
		a.vid.src = "";
		a.vid.load();
		clearInterval(update_int);
		document.getElementById("ep_dis").innerHTML = "loading...";
		document.getElementById("total").innerHTML = "";
		ini_main();
		console.log("inimain 3");

	}
}


document.querySelector("#next_ep").onclick = function () {

	next_ep_func(1);


}

document.querySelector("#prev_ep").onclick = function () {


	next_ep_func(-1);

}


var update_int, get_ep_check, lastUpdate, update_check, int_up, cur_link, name_ep_main, source;
function ini_main() {
	console.log("ini_main 4");
	if (get_ep_check != 1) {

		clearInterval(update_int);
		curTrack = undefined;
		document.getElementById("fastFor").style.display = "none";

		update_int = 0;
		get_ep_check = 0;
		lastUpdate = -1;
		update_check = 0;
		int_up = 3000;

		cur_link = location.search;





		a.vid.currentTime = 0;


		get_ep_ini();

	}
}












function toFormData(x) {
	var form = new FormData();
	for (value in x) {
		form.append(value, x[value]);
	}
	return form;
}

let errorCount = 0;
var lastLastcount;
var controller;
let didNotWork1 = 0;
let didNotWork2 = 0;
async function update(x) {
	let currentTime = a.vid.currentTime;

	if (update_check == 1 && (a.vid.currentTime - lastUpdate) > 60 && x != 19) {
		alert("Could not sync time with the server.");
	}

	if ((update_check == 1 || get_ep_check == 1 || lastUpdate == currentTime) && x != 19) {
		return;
	}

	update_check = 1;

	window.parent.apiCall("POST", { "username": username, "action": 1, "time": currentTime, "ep": data_main.episode, "name": data_main.nameWSeason }, (x) => { }, [], true).then(function (x) {
		try {

			if (x.status == 200) {
				lastUpdate = currentTime;

			} else if ("errorCode" in x && x["errorCode"] == 70001) {
				window.parent.postMessage({ "action": 21, data: "" }, "*");

			}
		} catch (err) {

		}



	}).catch(function (error) {
		console.error(error);


	}).finally(function () {
		update_check = 0;
		if (currentTime != lastUpdate) {
			errorCount++;
		} else {
			errorCount = 0;
		}

		if (errorCount > 10) {
			errorCount = 0;
			alert("Time could not be synced with the server.");

		}

	});



}
function chooseQualHls(x, type, th) {
	let qCon = document.getElementById("hls_con").children;
	for (var i = 0; i < qCon.length; i++) {
		if (qCon[i] == th) {
			qCon[i].style.backgroundColor = "white";
			qCon[i].style.color = "black";
		} else {
			qCon[i].style.backgroundColor = "#2e2e2e";
			qCon[i].style.color = "white";
		}
	}

	hls.loadLevel = parseInt(x);
	localStorage.setItem("hlsqual", x);
	localStorage.setItem("hlsqualnum", parseInt(th.innerText));
}
function loadSubs() {
	let vidDom = document.getElementById("v").children;



	while (vidDom.length > 0) {
		vidDom[0].remove();
	}
	document.getElementById("sub_con").innerHTML = "";
	document.getElementById("subtitleTitle").style.display = "none";
	document.getElementById("subtitleHr").style.display = "none";
	if ("subtitles" in data_main && data_main["subtitles"].length > 0) {
		let selectDOM = createElement({
			"element": "select"
		});

		selectDOM.append(createElement({
			"element": "option",
			"attributes": {
				"value": "off"
			},
			"innerText": "off"
		}));
		document.getElementById("subtitleTitle").style.display = "block";
		document.getElementById("subtitleHr").style.display = "block";

		for (var i = 0; i < data_main.subtitles.length; i++) {
			let optionDOM = createElement({
				"element": "option",
				"attributes": {
					"value": i,
				},
				"innerText": data_main.subtitles[i].label
			});


			let trackDOM = createElement({
				"element": "track",
				"attributes": {
					"kind": "subtitles",
					"label": data_main.subtitles[i].label,
					"src": data_main.subtitles[i].file
				},
				"innerText": data_main.subtitles[i].label
			});

			document.getElementById("v").append(trackDOM);

			selectDOM.append(optionDOM);
		}



		document.getElementById("sub_con").append(selectDOM);

		let check = true;
		for (var i = 0; i < a.vid.textTracks.length; i++) {
			if (a.vid.textTracks[i].label == localStorage.getItem(`${engine}-subtitle`) && check) {
				selectDOM.value = i;
				curTrack = a.vid.textTracks[i];
				document.getElementById("fastFor").style.display = "block";

				a.vid.textTracks[i].mode = "showing";
				check = false;

			} else {
				a.vid.textTracks[i].mode = "hidden";

			}
		}


		selectDOM.onchange = function () {
			let value = this.value;
			if (value == "off") {
				localStorage.setItem(`${engine}-subtitle`, "off");
				curTrack = undefined;
				document.getElementById("fastFor").style.display = "none";

			}

			for (var i = 0; i < a.vid.textTracks.length; i++) {
				if (i == parseInt(value)) {
					a.vid.textTracks[i].mode = "showing";
					curTrack = a.vid.textTracks[i];
					document.getElementById("fastFor").style.display = "block";


					localStorage.setItem(`${engine}-subtitle`, a.vid.textTracks[i].label);
				} else {
					a.vid.textTracks[i].mode = "hidden";

				}
			}

		};


	} else {


	}
}

function chooseQual(x, type, th) {

	let skipTo;

	document.getElementById("hls_con").innerHTML = "";
	document.getElementById("qualityTitle").style.display = "none";
	document.getElementById("qualityHr").style.display = "none";

	loadSubs();
	let defURL;
	if (x !== null) {
		skipTo = a.vid.currentTime;

		let qCon = document.getElementById("quality_con").children;
		for (var i = 0; i < qCon.length; i++) {
			if (qCon[i] == th) {
				qCon[i].style.backgroundColor = "white";
				qCon[i].style.color = "black";
			} else {
				qCon[i].style.backgroundColor = "#2e2e2e";
				qCon[i].style.color = "white";
			}
		}

	} else {
		skipTo = th;
		defURL = data_main.sources[0].url;
		let sName = localStorage.getItem(`${engine}-sourceName`);
		let qCon = document.getElementById("quality_con").children;
		for (let i = 0; i < qCon.length; i++) {
			if (sName == qCon[i].innerText) {
				defURL = data_main.sources[i].url;

				for (let j = 0; j < qCon.length; j++) {
					if (j == i) {
						qCon[j].style.backgroundColor = "white";
						qCon[j].style.color = "black";
					} else {
						qCon[j].style.backgroundColor = "#2e2e2e";
						qCon[j].style.color = "white";
					}
				}

			}
		}


	}


	if (hls) {
		hls.destroy();
	}

	if (type == "hls") {


		if (Hls.isSupported()) {

			hls = new Hls({
			});

			if (x == null) {

				hls.loadSource(defURL);
			}
			else {
				hls.loadSource(x);

			}


			hls.attachMedia(a.vid);
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				a.vid.play();
				loadHLSsource();
				a.vid.currentTime = skipTo;
			});
		}

	}
	else {
		try {
			if (x == null) {
				a.vid.src = defURL;

			} else {
				a.vid.src = x;
			}
			a.vid.load();
			a.vid.currentTime = skipTo;
			a.vid.play();


		} catch (err) {
			console.error(err);
			sendNoti([0, null, "Error", "Wait until the episode is being loaded."]);

		}
	}
}


function loadHLSsource() {
	try {
		let qCon = document.getElementById("hls_con");

		qCon.innerHTML = "";

		document.getElementById("qualityTitle").style.display = "block";
		document.getElementById("qualityHr").style.display = "block";


		let hlsqualnum = parseInt(localStorage.getItem("hlsqualnum"));
		let hslLevel = -1;
		if (isNaN(hlsqualnum)) {
			hslLevel = -1;
		}

		else {
			let differences = [];
			for (let i = 0; i < hls.levels.length; i++) {
				differences.push(Math.abs(hlsqualnum - hls.levels[i].height));
			}

			let min = differences[0];
			let minIndex = 0;

			for (let i = 0; i < differences.length; i++) {
				if (min > differences[i]) {
					minIndex = i;
					min = differences[i];
				}
			}

			hslLevel = minIndex;
		}

		hls.loadLevel = hslLevel;
		for (var i = -1; i < hls.levels.length; i++) {
			let style = {

			};
			if (i == hslLevel) {
				style["backgroundColor"] = "white";
				style["color"] = "black";
			} else {
				style["backgroundColor"] = "#2e2e2e";
				style["color"] = "white";
			}

			let temp1;
			if (i == -1) {
				temp1 = createElement({
					"class": "qual",
					"innerText": "Auto",
					"attributes": {
						"data-url": i.toString(),
						"data-type": "hls",
					},
					"listeners": {
						"click": function () {
							chooseQualHls(this.getAttribute("data-url"), this.getAttribute("data-type"), this);
						}
					},
					style
				});
			} else {
				temp1 = createElement({
					"class": "qual",
					"innerText": hls.levels[i].height + "p",
					"attributes": {
						"data-url": i.toString(),
						"data-type": "hls",
					},
					"listeners": {
						"click": function () {
							chooseQualHls(this.getAttribute("data-url"), this.getAttribute("data-type"), this);
						}
					},
					style
				});
			}

			qCon.append(temp1);
		}
	} catch (err) {
		console.error(err);
	}
}


async function get_ep(x = 0) {
	if (get_ep_check == 1) {
		return;
	}

	get_ep_check = 1;
	try {
		let tttf = location.search.replace("?watch=", "");


		let qCon = document.getElementById("quality_con");
		qCon.innerHTML = "";
		for (var i = 0; i < data_main.sources.length; i++) {
			let style = {

			};
			if (i == 0) {
				style["backgroundColor"] = "white";
				style["color"] = "black";
			} else {
				style["backgroundColor"] = "#2e2e2e";
				style["color"] = "white";
			}

			let temp1;

			// if(data_main.sources[i].type != "hls"){			
			temp1 = createElement({
				"class": "qual",
				"innerText": data_main.sources[i].name,
				"attributes": {
					"data-url": data_main.sources[i].url,
					"data-type": data_main.sources[i].type,
					"data-name": data_main.sources[i].name,
				},
				"listeners": {
					"click": function () {
						localStorage.setItem(`${engine}-sourceName`, this.getAttribute("data-name"));
						chooseQual(this.getAttribute("data-url"), this.getAttribute("data-type"), this);
					}
				},
				style
			});
			// }

			qCon.append(temp1);
		}


		if (typeof data_main.prev == "undefined" || data_main.prev == null) {
			document.getElementById("prev_ep").style.display = "none";
		} else {
			document.getElementById("prev_ep").style.display = "table-cell";

		}

		if (typeof data_main.next == "undefined" || data_main.next == null) {
			document.getElementById("next_ep").style.display = "none";

		}
		else {
			document.getElementById("next_ep").style.display = "table-cell";

		}



		let response = await window.parent.apiCall("POST", { "username": username, "action": 2, "name": data_main.nameWSeason, "nameUm": data_main.name, "ep": data_main.episode, "cur": cur_link }, (x) => { });


		document.getElementById("ep_dis").innerHTML = data_main.episode;
		clearInterval(update_int);
		update_int = setInterval(update, int_up);

		let skipTo = 0;

		if (localStorage.getItem("rewatch") == "true") {

		} else {
			skipTo = response.data.time;
		}


		if (data_main.sources[0].type == "hls") {
			chooseQual(null, "hls", skipTo);


		}
		else {

			chooseQual(null, "", skipTo);


		}







		get_ep_check = 0;






	} catch (error) {
		console.error(error);
		sendNoti([0, null, "Error", error]);

	}



}

if (localStorage.getItem("autoplay")) {
	if (localStorage.getItem("autoplay") == "true") {
		document.querySelector("#autoplay").checked = true;
	} else {
		document.querySelector("#autoplay").checked = false;

	}

} else {
	document.querySelector("#autoplay").checked = false;
	localStorage.setItem("autoplay", "false");
}



if (localStorage.getItem("rewatch")) {
	if (localStorage.getItem("rewatch") == "true") {
		document.querySelector("#rewatch").checked = true;
	} else {
		document.querySelector("#rewatch").checked = false;

	}

} else {
	document.querySelector("#rewatch").checked = false;
	localStorage.setItem("rewatch", "false");
}

document.querySelector("#autoplay").addEventListener("change", function () {
	if (document.querySelector("#autoplay").checked) {
		localStorage.setItem("autoplay", "true");
	} else {
		localStorage.setItem("autoplay", "false");

	}
});

document.querySelector("#rewatch").addEventListener("change", function () {
	if (document.querySelector("#rewatch").checked) {
		localStorage.setItem("rewatch", "true");
	} else {
		localStorage.setItem("rewatch", "false");

	}
});


document.querySelector("#repBack").onclick = function () {
	a.vid.currentTime -= skipButTime;
	a.updateTime(a);

};


document.querySelector("#popOut").onclick = function () {
	backToNormal();
};

document.querySelector("#closeSetting").onclick = function () {
	document.getElementById("setting_con").style.display = "none";
};



document.querySelector("#repForward").onclick = function () {
	a.vid.currentTime += skipButTime;
	a.updateTime(a);

};




let socketCalledIni = false;


if (location.search.includes("engine=3")) {
	if (!config.chrome) {
		CustomXMLHttpRequest = XMLHttpRequest2;
	} else {
		chrome.webRequest.onBeforeSendHeaders.addListener(
			function (details) {
				details.requestHeaders.push({
					"name": "origin",
					"value": "https://rapid-cloud.ru"
				});

				details.requestHeaders.push({
					"name": "referer",
					"value": "https://rapid-cloud.ru/"
				});

				details.requestHeaders.push({
					"name": "sid",
					"value": sid
				});





				return { requestHeaders: details.requestHeaders };
			},
			{ urls: ['https://*.dayimage.net/*'] },
			['blocking', 'requestHeaders']
		);
	}
	let socket = io("https://ws1.rapid-cloud.ru", { transports: ["websocket"] });
	socket.on("connect", () => {
		sid = socket.id;
		if(socketCalledIni === false){
			if (config.local || downloaded) {
				ini_main();
			} else {
				window.parent.postMessage({ "action": 20, data: "" }, "*");

			}
		}
		socketCalledIni = true;


	});
} else {
	if (config.local || downloaded) {
		ini_main();
	} else {
		window.parent.postMessage({ "action": 20, data: "" }, "*");

	}

}



let playerFitDOM = document.getElementById("playerFit").children;
for (var i = 0; i < playerFitDOM.length; i++) {
	playerFitDOM[i].onclick = function () {
		a.setObjectSettings(parseInt(this.getAttribute("data-num")));
	};
}




try {
	navigator.mediaSession.setActionHandler('nexttrack', () => {
		next_ep_func(1);

	});
	navigator.mediaSession.setActionHandler('previoustrack', () => {
		next_ep_func(-1);

	});
}
catch (error) {

}
window.addEventListener("keydown", function (event) {

	if (event.keyCode == 32) {
		a.togglePlay(a);
	}
	else if (event.keyCode == 38 || event.keyCode == 40) {
		a.updateTimeout(a);
	} else if (event.keyCode == 39) {
		if (a.seekMode || config.chrome) {
			a.vid.currentTime += 30;
			a.updateTime(a);
			event.preventDefault();
		} else {
			a.updateTimeout(a);

		}
	} else if (event.keyCode == 37) {
		if (a.seekMode || config.chrome) {
			a.vid.currentTime -= 30;
			a.updateTime(a);

			event.preventDefault();

		} else {
			a.updateTimeout(a);

		}

	} else if (event.keyCode == 77) {
		a.toggleMute(a);

	} else if (event.keyCode == 70) {
		a.goFullScreen(a);

	} else if (event.keyCode == 76) {
		a.toggleLock(a);

	} else if (event.keyCode == 80) {
		a.togglePictureInPicture(a);

	}
});

if (config.chrome) {
	document.getElementById("fullscreenToggle").style.display = "block";
}
document.getElementById("fullscreenToggle").onclick = function () {
	a.goFullScreen(a);
};
