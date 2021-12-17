const ColorMode = {
    DEFINED: 0,
    INITIALLETTER: 1,
	INITIALNUMBER:2,
};

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
	
	static LightenDarkenColor(col, amt) {
	  col = parseInt(col, 16);
	  return (((col & 0x0000FF) + amt) | ((((col >> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16);
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
	
	static alphabetPosition(text) {
	  text.split(' ').join('');
	  var chari = "";
	  var arr = [];
	  var alphabet = "abcdefghijklmnopqrstuvwxyz".split('');
	  for(var i = 0; i < text.length; i++){
		chari = text.charAt(i).toLowerCase();
		if(alphabet.indexOf(chari) > -1){
		  arr.push(alphabet.indexOf(chari));
		}
	  }
	  return arr;
	}
	
	static numberPosition(text) {
	  text.split(' ').join('');
	  var chari = "";
	  var arr = [];
	  var numbers = "1234567890".split('');
	  for(var i = 0; i < text.length; i++){
		chari = text.charAt(i).toLowerCase();
		if(numbers.indexOf(chari) > -1){
		  arr.push(numbers.indexOf(chari));
		}
	  }
	  return arr;
	}
	
	static ColorFoldersByInitialLetter (htmlarray){
		for(const dirItem of htmlarray){
			if (dirItem.children[0].attributes.style){
				//let letterCode = dirItem.children[0].querySelector('h3').textContent[0].charCodeAt(0);
				let lowerCaseTitle = dirItem.children[0].querySelector('h3').textContent[0].toLowerCase();
				let letterCode = autoColorFolder.alphabetPosition(lowerCaseTitle);
				let rgbColorRange = 0xFFFFFF;
				let letterBasisColor = (rgbColorRange / 26 /*Number of alphabet letters*/);
				let strLetterBasisColor = 0;
				if (letterCode.length > 0)
					strLetterBasisColor = autoColorFolder.LightenDarkenColor(Math.floor(((letterCode[0]-1) * letterBasisColor)).toString(16),20);
				//let strLetterBasisColor = PIXI.utils.string2hex(letterBasisColor);
				//dirItem.children[0].attributes.style.nodeValue = 'background-color: rgb('+letterCode+',0,0,0.5)';
				dirItem.children[0].attributes.style.nodeValue = 'background-color: #'+strLetterBasisColor+'80';
			}
		}
		
		return;
	}
	
	static ColorFoldersByInitialNumber (htmlarray){
		for(const dirItem of htmlarray){
			if (dirItem.children[0].attributes.style){
				let lowerCaseTitle = dirItem.children[0].querySelector('h3').textContent[0].toLowerCase();
				if (isNaN(lowerCaseTitle)) continue;
				let letterCode = autoColorFolder.numberPosition(lowerCaseTitle);
				let rgbColorRange = 360;
				let letterBasisColor = (rgbColorRange / 10 /*Number of numbers*/);
				let strLetterBasisColor = 0;
				if (letterCode.length > 0)
					strLetterBasisColor =Math.floor(((letterCode[0]) * letterBasisColor));
				dirItem.children[0].attributes.style.nodeValue = 'background-color: hsl('+strLetterBasisColor+',90%,40%,0.4)';
			}
		}
		return;
	}
	
	static RedefineColorFolder(html,category){
		let actorStartColor = game.settings.get("autoColorFolder", category+"DirectoryMainColor").slice(0, -2); // Returns color code, eg: "#000000ff"
		let rgbActorStartColor = PIXI.utils.hex2rgb(PIXI.utils.string2hex(actorStartColor));
		if (game.settings.get('autoColorFolder', 'autoColorFolder')) {
			let state = Number(game.settings.get("autoColorFolder", "selectColorMode"));
			const dirlist = html[0].querySelector("ol.directory-list");
			switch(state){
				case ColorMode.DEFINED:
					autoColorFolder.AutoColorFolders(rgbActorStartColor[0]*255,rgbActorStartColor[1]*255,rgbActorStartColor[2]*255,255,dirlist.children);
					break;
				case ColorMode.INITIALLETTER:
					autoColorFolder.ColorFoldersByInitialLetter(dirlist.children);
					break;
				case ColorMode.INITIALNUMBER:
					autoColorFolder.ColorFoldersByInitialNumber(dirlist.children);
					break;
				default:
					console.log('[AUTO-COLOR-FOLDER] Something went wrong [$state] does not exists in fonts choices (in AutoColorFolder module)');
			}
		}
	}

}

Hooks.once("init", async function () {
	// TURN ON OR OFF HOOK DEBUGGING
    CONFIG.debug.hooks = false;
	
	game.settings.register("autoColorFolder", "selectColorMode", {
            name: game.i18n.localize("AUTOCOLORFOLDER.selectColorMode"),
            hint: game.i18n.localize("AUTOCOLORFOLDER.selectColorModeHint"),
            scope: "client",
            config: true,
            default: 0,
            type: Number,
			choices: {
				0: "AUTOCOLORFOLDER.options.colormode.choices.0",
				1: "AUTOCOLORFOLDER.options.colormode.choices.1",
				2: "AUTOCOLORFOLDER.options.colormode.choices.2"
			},
			onChange: (value) => {
				location.reload();
			}
        });

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
	
	new window.Ardittristan.ColorSetting("autoColorFolder", "sceneDirectoryMainColor", {
		name: "Scene Directory Start Color",           // The name of the setting in the settings menu
		hint: "Define start color on scene directories for gradient.",        // A description of the registered setting and its behavior
		label: game.i18n.localize('AUTOCOLORFOLDER.colorPicker'),              // The text label used in the button
		restricted: false,                  // Restrict this setting to gamemaster only?
		defaultColor: "#000000FF",          // The default color of the setting
		scope: "client",                    // The scope of the setting
		onChange: (value) => {location.reload();},  			// A callback function which triggers when the setting is changed
		insertAfter: "autoColorFolder.autoColorFolder"
	});		

	new window.Ardittristan.ColorSetting("autoColorFolder", "actorDirectoryMainColor", {
		name: "Actor Directory Start Color",           // The name of the setting in the settings menu
		hint: "Define start color on actor directories for gradient.",        // A description of the registered setting and its behavior
		label: game.i18n.localize('AUTOCOLORFOLDER.colorPicker'),              // The text label used in the button
		restricted: false,                  // Restrict this setting to gamemaster only?
		defaultColor: "#640000FF",          // The default color of the setting
		scope: "client",                    // The scope of the setting
		onChange: (value) => {location.reload();},             // A callback function which triggers when the setting is changed
		insertAfter: "autoColorFolder.sceneDirectoryMainColor"
	});
	
	new window.Ardittristan.ColorSetting("autoColorFolder", "itemDirectoryMainColor", {
		name: "Item Directory Start Color",           // The name of the setting in the settings menu
		hint: "Define start color on item directories for gradient.",        // A description of the registered setting and its behavior
		label: game.i18n.localize('AUTOCOLORFOLDER.colorPicker'),              // The text label used in the button
		restricted: false,                  // Restrict this setting to gamemaster only?
		defaultColor: "#000032FF",          // The default color of the setting
		scope: "client",                    // The scope of the setting
		onChange: (value) => {location.reload();},             // A callback function which triggers when the setting is changed
		insertAfter: "autoColorFolder.actorDirectoryMainColor"
	});		
	
	new window.Ardittristan.ColorSetting("autoColorFolder", "journalDirectoryMainColor", {
		name: "Journal Directory Start Color",           // The name of the setting in the settings menu
		hint: "Define start color on journal directories for gradient.",        // A description of the registered setting and its behavior
		label: game.i18n.localize('AUTOCOLORFOLDER.colorPicker'),              // The text label used in the button
		restricted: false,                  // Restrict this setting to gamemaster only?
		defaultColor: "#003399FF",          // The default color of the setting
		scope: "client",                    // The scope of the setting
		onChange: (value) => {location.reload();},             // A callback function which triggers when the setting is changed
		insertAfter: "autoColorFolder.itemDirectoryMainColor"
	});
});

Hooks.on("ready", () => {
    
	try{window.Ardittristan.ColorSetting.tester} catch {
        ui.notifications.notify('Please make sure you have the "lib - ColorSettings" module installed and enabled.', "error");
    }
	
	autoColorFolder.singleton = new autoColorFolder();
    autoColorFolder.singleton.init();
});

Hooks.on("renderActorDirectory", (app, html, data) => {
	autoColorFolder.RedefineColorFolder(html,"actor");
});

Hooks.on("renderSceneDirectory", (app, html, data) => {
	autoColorFolder.RedefineColorFolder(html,"scene");
});

Hooks.on("renderJournalDirectory", (app, html, data) => {
	autoColorFolder.RedefineColorFolder(html,"journal");
});

Hooks.on("renderItemDirectory", (app, html, data) => {
	autoColorFolder.RedefineColorFolder(html,"item");
});



