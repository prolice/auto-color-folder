"use strict";

class autoColorFolder {
	
    constructor() {
        this.autoColorFolder = new Map();
        this.TIMEOUT_INTERVAL = 50; // ms
        this.MAX_TIMEOUT = 1000; // ms
        // Random id to prevent collision with other modules;
        this.ID = randomID(24);
    }

    log(msg, ...args) {
        if (game && game.settings.get("autoColorFolder", "verboseLogs")) {
            const color = "background: #6699ff; color: #000; font-size: larger;";
            console.debug(`%c autoColorFolder: ${msg}`, color, ...args);
        }
    }

    async init() {
		
		game.settings.register("autoColorFolder", "verboseLogs", {
            name: "Enable more module logging.",
            hint: "Enables more verbose module logging. This is useful for debugging the module. But otherwise should be left off.",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        });
		
		this.switchStyleSheet();

    }
		
	static interpolateColor(color1, color2, factor) {
		if (arguments.length < 3) { 
			factor = 0.5; 
		}
		var result = color1.slice();
		for (var i = 0; i < 3; i++) {
			result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
		}
		return result;
	};
	// My function to interpolate between two colors completely, returning an array
	// call --> var colorArray = swffgUIModule.interpolateColors("rgb(255, 0, 0)","rgb(0, 0, 255)",5);
	
	static interpolateColors(color1, color2, steps) {
		var stepFactor = 1 / (steps - 1);
		const interpolatedColorArray = [];

		color1 = color1.match(/\d+/g).map(Number);
		color2 = color2.match(/\d+/g).map(Number);

		for(var i = 0; i < steps; i++) {
			interpolatedColorArray.push(this.interpolateColor(color1, color2, stepFactor * i));
		}

		return interpolatedColorArray;
	}
	
	static AutoColorFolders (red, green, blue, max, htmlarray){
		let boolRed = red != -1;
		let boolGreen = green != -1;
		let boolBlue = blue != -1;
		if (!boolRed)red = 0;
		if (!boolGreen)green = 0;
		if (!boolBlue)blue = 0;
		let colorRatioRed = (max-red) / (htmlarray.length-1);
		let colorRatioGreen = (max-green) / (htmlarray.length-1);
		let colorRatioBlue = (max-blue) / (htmlarray.length-1);
		for(const dirItem of htmlarray){
			if (dirItem.children[0].attributes.style)
				dirItem.children[0].attributes.style.nodeValue = 'background-color: rgb('+red+','+green+','+blue+',0.5)';
			if (boolRed) red = red + colorRatioRed;
			if (boolGreen) green = green + colorRatioGreen;
			if (boolBlue) blue = blue + colorRatioBlue;
		}
		return;
	}

}


Hooks.once("init", async function () {
	// TURN ON OR OFF HOOK DEBUGGING
    CONFIG.debug.hooks = false;
	
	game.settings.register('autoColorFolder', 'autoColorFolder', {
        name: game.i18n.localize('AUTOCOLORFOLDER.autocolorfolder'),
        hint: game.i18n.localize('AUTOCOLORFOLDER.autocolorfolderHint'),
        scope: 'client',
        type: Boolean,
        default: true,
        config: true,
        onChange: () => {
            location.reload();
        },
    });
});

Hooks.on("ready", () => {
    autoColorFolder.singleton = new autoColorFolder();
    autoColorFolder.singleton.init();
});

/*Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof Settings) {
    const details = html.find("#game-details");
    const swffgUIDetails = document.createElement("li");
    swffgUIDetails.classList.add("donation-link");
    //let swffgUiVersion = game.i18n.localize('SWFFG.Version');
	let swffgUiVersion = game.modules.get("swffgUI-cc").data.version
	let swffgUiDonate = game.i18n.localize('SWFFG.donate');
	let swffgUiThemeMaintenance = game.i18n.localize('SWFFG.thememaintenance');
    let swffgUiReportThemeIssue = game.i18n.localize('SWFFG.reportthemeissue');
	swffgUIDetails.innerHTML = "Star Wars UI (CC)<a style='animation: textShadow 1.6s infinite;' title='"+swffgUiDonate+"' href='https://ko-fi.com/prolice1403'><img src='https://storage.ko-fi.com/cdn/cup-border.png'></a><span style='font-size:var(--major-button-font-size);'>"+swffgUiVersion+"</span>";
    details.append(swffgUIDetails);
	
	this.section = document.createElement("section");
	this.section.classList.add("swffgui-maintenance");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("#settings-game").nextSibling;
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `
		  <h2>`+swffgUiThemeMaintenance+`</h2>
		  <button class="swffgui-maintenance" onclick="window.open('https://github.com/prolice/swffgUI-cc/issues','_blank')"><i class="fas fa-paint-roller"></i>`+swffgUiReportThemeIssue+`</button>`
		);
	
  }
});*/

Hooks.on("renderActorDirectory", (app, html, data) => {
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	
	if (game.settings.get('swffgUI-cc', 'autoColorFolder')) {
		const dirlist = html[0].querySelector("ol.directory-list");
		autoColorFolder.AutoColorFolders(100,-1,-1,255,dirlist.children);
		//autoColorFolder.AutoColorFolders(226,-1,29,255,dirlist.children);
	}	


});

Hooks.on("renderSceneDirectory", (app, html, data) => {
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
    
	if (game.settings.get('swffgUI-cc', 'autoColorFolder')) {
		const dirlist = html[0].querySelector("ol.directory-list");
		autoColorFolder.AutoColorFolders(0,0,0,150,dirlist.children);
	}

});


Hooks.on("renderJournalDirectory", (app, html, data) => {
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	
	if (game.settings.get('swffgUI-cc', 'autoColorFolder')) {
		const dirlist = html[0].querySelector("ol.directory-list");
		autoColorFolder.AutoColorFolders(-1,51,153,255,dirlist.children);
	}
});

Hooks.on("renderItemDirectory", (app, html, data) => {
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	
	if (game.settings.get('swffgUI-cc', 'autoColorFolder')) {
		const dirlist = html[0].querySelector("ol.directory-list");
		autoColorFolder.AutoColorFolders(-1,-1,50,255,dirlist.children);
	}	
});



