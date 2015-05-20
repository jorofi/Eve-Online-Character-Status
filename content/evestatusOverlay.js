var eveStatusPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var eveStatusPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var eveStatusCS, synchronizeEveStatus, eveStatusTimerID, eveStatusPl, eveStatusDSN, eveStatusDSC, eveStatusROE, eveStatusSOO, eveStatusISP, eveStatusStrbundle;

function eveStatusInit(){ //Eve Character Status Initialize
    eveStatusStrbundle = document.getElementById("eveStatusProperties");
	if(eveStatusTimerID || synchronizeEveStatus) {
		clearTimeout(eveStatusTimerID); eveStatusTimerID  = 0;
		clearTimeout(synchronizeEveStatus); synchronizeEveStatus  = 0;
	}
	eveStatusPrefBranch.deleteBranch("extensions.evestats.settings."); //old staf cleaning
	eveStatusDSN = eveStatusPrefBranch.getBoolPref("extensions.evestats.display.skill"); //Display Skill Name
	eveStatusDSC = eveStatusPrefBranch.getBoolPref("extensions.evestats.display.character"); //Display Character Name
	eveStatusROE = eveStatusPrefBranch.getBoolPref("extensions.evestats.display.exactdate"); //Remining Time or Exact End Date
	eveStatusSOO = eveStatusPrefBranch.getBoolPref("extensions.evestats.sound"); //Sound On/OFF
	eveStatusISP = eveStatusPrefBranch.getBoolPref("extensions.evestats.sound.isplayed"); //IS Sound Played
	eveStatusCS = new Array(); //characters
	document.getElementById('eveStatusSoundID').setAttribute("checked", eveStatusSOO);
	document.getElementById("eveStatusStatusID").setAttribute("checked", eveStatusPrefBranch.getBoolPref("extensions.evestats.status"));
	if(eveStatusPrefBranch.getBoolPref("extensions.evestats.status") == false) {
		document.getElementById("evestats-panel").label = EveStatusLocal("eveStatusPanelLabelOff.label");
		document.getElementById("evestats-panel").tooltipText = EveStatusLocal("eveStatusPanelLabelOff.tooltipText");
		return;
	}
	var p = eveStatusPrefService.getBranch("extensions.evestats.profiles.").getChildList("",{}); //Profiles
	if(p.length == 0){
		document.getElementById("evestats-panel").label = EveStatusLocal("eveStatusPanelLabelIsNotSet");
		document.getElementById("evestats-panel").tooltipText = EveStatusLocal("eveStatusPanelLabelIsNotSet");
		return;
	}
	eveStatusPl = p.length; //ProfilesLength
	for (var i=0;i<eveStatusPl;i++){
		var ps = eveStatusPrefBranch.getCharPref("extensions.evestats.profiles." + p[i]); //ProfileSettings
		var EveAPI = "http://api.eve-online.com/char/SkillInTraining.xml.aspx";
		if(isNaN(p[i])) {
			EveAPI += "?userid=" + ps.split(",")[0];/*UserID*/
			EveAPI += "&apikey=" + ps.split(",")[1];/*ApiKey*/
			EveAPI += "&characterID=" + ps.split(",")[2];/*CharacterID*/
			new EveStatusCharacter(p[i]/*CharacterName*/, EveAPI, evestatuscallback);
		} else {
			EveAPI += "?userid=" + p[i];/*UserID*/
			EveAPI += "&apikey=" + ps.split(",")[0];/*ApiKey*/
			EveAPI += "&characterID=" + ps.split(",")[1];/*CharacterID*/
			new EveStatusCharacter(ps.split(",")[2]/*CharacterName*/, EveAPI, evestatuscallback);
			eveStatusPrefBranch.deleteBranch("extensions.evestats.profiles." + p[i]);
			eveStatusPrefBranch.setCharPref("extensions.evestats.profiles." + ps.split(",")[2], p[i] + "," + ps.split(",")[0] + "," + ps.split(",")[1]);
		}
	}
	synchronizeEveStatus = setTimeout("eveStatusInit()", (eveStatusPrefBranch.getIntPref("extensions.evestats.synchronize") * 60000));
}
var evestatuscallback = function(aSelf){
	var i = eveStatusCS.push();
	eveStatusCS[i] = new Array(aSelf.settings.name, aSelf.trainingEndTime, aSelf.fullSkillName, aSelf.settings.status);
	if(eveStatusCS.length == eveStatusPl ) {
		eveStatusIRT();
	}
}
function eveStatusIRT() { //InitializeReminingTime
	try {
		var minTime, Label, tooltipText = "", IsTrainedLabel = "";
		if(eveStatusTimerID) {
			clearTimeout(eveStatusTimerID); eveStatusTimerID  = 0;
		}
		for (var i=0;i<eveStatusCS.length;i++) {
			if( eveStatusCS[i][3] == "NO" || eveStatusCS[i][3] == "ERROR" ) { //If no skill in training or have problem with request.
				if(!minTime) { //If no other character show to status bar
					Label =  ( eveStatusDSC ? eveStatusCS[i][0] + " - " : "" ) + eveStatusCS[i][2];
				}
				tooltipText += eveStatusCS[i][0] + " - " + eveStatusCS[i][2] + "\n";
				continue;
			}
			if(!minTime ||  minTime > eveStatusCS[i][1].RemainingTime) { //If is first character or time remaining < minTime
				minTime = eveStatusCS[i][1].RemainingTime;
				Label = ( eveStatusDSC ? eveStatusCS[i][0] + " - " : "" );
				Label += ( eveStatusDSN ? eveStatusCS[i][2] + " - " : "" );
				Label += ( eveStatusROE ? eveStatusCS[i][1].GetExactEndDate() + " - " : "");
				Label += eveStatusCS[i][1].GetRemainingTime();
			}
			if(eveStatusCS[i][1].RemainingTime <= 0 ) { //If skill training is Complete
				IsTrainedLabel = ( eveStatusDSC ? eveStatusCS[i][0] + " - " : "" )+ ( eveStatusDSN ? eveStatusCS[i][2] + " - " : "" ) + EveStatusLocal("eveStatusPanelLabeSTComplete");
				tooltipText += eveStatusCS[i][0] + " - " + eveStatusCS[i][2] + " - " + EveStatusLocal("eveStatusPanelLabeSTComplete") + "\n";
				if( eveStatusSOO && !eveStatusISP ){ //If 'eveStatusSOO' is true ( sound is on ) and 'eveStatusISP' is false ( sound is not played )
					eveStatusPrefBranch.setBoolPref("extensions.evestats.sound.isplayed", eveStatusISP = true);
					eveStatusPlaySkillTrained();
				}
			} else {
				eveStatusCS[i][1].SetRemainingTimeOffset(1000); /* TimeOnEveApiServer - 1 second */
				tooltipText += eveStatusCS[i][0] + " - ";
				tooltipText += eveStatusCS[i][2] + " - ";
				tooltipText += ( eveStatusROE ? eveStatusCS[i][1].GetExactEndDate() + " - " : "");
				tooltipText += eveStatusCS[i][1].GetRemainingTime() + "\n";
			}
		}
		if(IsTrainedLabel == ""){ //After skill is Complete and skill is new
			document.getElementById("evestats-panel").label = Label;
			eveStatusPrefBranch.setBoolPref("extensions.evestats.sound.isplayed", eveStatusISP = false);
		} else {
			document.getElementById("evestats-panel").label = IsTrainedLabel;
		}
		document.getElementById("evestats-panel").tooltipText = tooltipText;
		eveStatusTimerID = setTimeout("eveStatusIRT()", 1000);
	} catch(e) {
		alert(e);
	}
}
function EveStatusLocal(str) {
    return eveStatusStrbundle.getString(str);
}
function eveStatusSettingsWindow(){
	window.openDialog("chrome://evestats/content/evestatusSettings.xul", "settingswin", "chrome,dialog,centerscreen","");
}
function eveStatusSoundOnOff(aObj){
	eveStatusSOO = (aObj.getAttribute('checked') == "true" ? true : false);
	eveStatusPrefBranch.setBoolPref("extensions.evestats.sound", eveStatusSOO);
}
function eveStatusOnOff(aObj){
	eveStatusPrefBranch.setBoolPref("extensions.evestats.status", (aObj.getAttribute('checked') == "true" ? true : false));
	eveStatusInit();
}
function eveStatusPlaySkillTrained(){
	var nsISound = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
	var iios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	try {
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath("chrome://evestats/content/SkillTrained.wav");
		nsISound.play(iios.newFileURI(file));
	} catch(e) {
		try{
			nsISound.play(iios.newURI("chrome://evestats/content/SkillTrained.wav", null, null));
		} catch(ex){
			alert(ex);
		}
	}
}
window.addEventListener("load", eveStatusInit, false);