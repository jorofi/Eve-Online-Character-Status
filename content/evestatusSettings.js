var eveStatusPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var eveStatusPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var eveStatusStrbundle;

function eveStatusloadDefault() {
	var cList = document.getElementById("evestatuscharacterlist");
    eveStatusStrbundle = document.getElementById("eveStatusProperties");
	var Profiles = eveStatusPrefService.getBranch("extensions.evestats.profiles.").getChildList("",{});
	document.getElementById("cndisplay").setAttribute("checked", ( eveStatusPrefBranch.getBoolPref("extensions.evestats.display.character") ? true : false )); //Display Skill Name
	document.getElementById("sndisplay").setAttribute("checked", ( eveStatusPrefBranch.getBoolPref("extensions.evestats.display.skill") ? true : false )); //Display Character Name
	document.getElementById("eddisplay").setAttribute("checked", ( eveStatusPrefBranch.getBoolPref("extensions.evestats.display.exactdate") ? true : false )); //Remining Time or Exact End Date
	document.getElementById("evestatussyncid").value = eveStatusPrefBranch.getIntPref("extensions.evestats.synchronize");
	if(Profiles.length > 0) {
		cList.removeItemAt(0);
	} else {
		document.getElementById("btnRemove").setAttribute("disabled", true);
		document.getElementById("btnChange").setAttribute("disabled", true);
	}
	for (var i=0;i<Profiles.length;i++) {
		cList.appendItem(Profiles[i],eveStatusPrefBranch.getCharPref("extensions.evestats.profiles." + Profiles[i]));
	}
}
function eveStatusClrScreen() {
	document.getElementById("evestatususerid").value = "";
	document.getElementById("evestatusapikey").value = "";
	document.getElementById("evestatuscharacterid").value = "";
	document.getElementById("evestatuscharacterid").setAttribute("label", "");
}
function eveStatusSetSelected(aObj) {
	if(aObj.value == null || aObj.value.split(",")[0] == -1) return;
	document.getElementById("evestatususerid").value = aObj.value.split(",")[0];
	document.getElementById("evestatusapikey").value = aObj.value.split(",")[1];
	document.getElementById("evestatuscharacterid").value = aObj.value.split(",")[2];
	document.getElementById("evestatuscharacterid").setAttribute("label", aObj.selectedItem.getAttribute("label"));
}
function eveStatusAddUser() {
	var tempUserID = document.getElementById("evestatususerid").value;
	var tempApiKey = document.getElementById("evestatusapikey").value;
	var tempCharacterObj = document.getElementById("evestatuscharacterid");
    if( tempUserID == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertUserID")); return; }
	if( tempApiKey == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertAPIKEY")); return; }
	if( tempCharacterObj.value == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertCharacter")); return; }
	var cList = document.getElementById("evestatuscharacterlist");
	for (var i=0;i<cList.getRowCount();i++) {
		if(cList.getItemAtIndex(i).value.split(",")[0] == tempUserID) {
			alert(EveStatusLocal("eveStatusPUserID") + tempUserID + "(" + cList.getItemAtIndex(i).label + ") " + EveStatusLocal("eveStatusPAlreadyExist"));
			return;
		}
	}
	if(cList.getItemAtIndex(0).value.split(",")[0] == -1) {
		document.getElementById("btnRemove").setAttribute("disabled", false);
		document.getElementById("btnChange").setAttribute("disabled", false);
		cList.removeItemAt(0);
	}
	cList.appendItem(tempCharacterObj.label, tempUserID + "," + tempApiKey + "," + tempCharacterObj.value);
	eveStatusClrScreen();
}
function EveStatusLocal(str) {
    return eveStatusStrbundle.getString(str);
}
function eveStatusRemoveUser() {
	var cList = document.getElementById("evestatuscharacterlist");
	if(cList.getRowCount() == 1 && cList.value.split(",")[0] != -1) {
		cList.appendItem("","-1,-1,null");
		document.getElementById("btnRemove").setAttribute("disabled", true);
		document.getElementById("btnChange").setAttribute("disabled", true);
	}
	cList.removeItemAt(cList.selectedIndex);
	eveStatusClrScreen();
}
function eveStatusSetChange() {
	var tempUserID = document.getElementById("evestatususerid").value;
	var tempApiKey = document.getElementById("evestatusapikey").value;
	var tempCharacterObj = document.getElementById("evestatuscharacterid");
	if( tempUserID == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertUserID")); return;}
	if( tempApiKey == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertAPIKEY")); return; }
	if( tempCharacterObj.value == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertCharacter")); return; }
	var cList = document.getElementById("evestatuscharacterlist");
	for (var i=0;i<cList.getRowCount();i++) {
		if(cList.getItemAtIndex(i).value.split(",")[0] == tempUserID) {
			cList.getItemAtIndex(i).label = tempCharacterObj.label;
			cList.getItemAtIndex(i).value = tempUserID + "," + tempApiKey + "," + tempCharacterObj.value;
		}
	}
}
function eveStatusSetSettings() {
	eveStatusPrefBranch.setBoolPref("extensions.evestats.display.skill", document.getElementById("sndisplay").checked); //Display Skill Name
	eveStatusPrefBranch.setBoolPref("extensions.evestats.display.character", document.getElementById("cndisplay").checked); //Display Character Name
	eveStatusPrefBranch.setBoolPref("extensions.evestats.display.exactdate", document.getElementById("eddisplay").checked); //Remining Time or Exact End Date
	eveStatusPrefBranch.setIntPref("extensions.evestats.synchronize", document.getElementById("evestatussyncid").value); //Synchronize with EVE Api Server
	var cList = document.getElementById("evestatuscharacterlist");
	var tempValue = "";
	eveStatusPrefBranch.deleteBranch("extensions.evestats.profiles.");
	var tempUserID = document.getElementById("evestatususerid").value;
	var tempApiKey = document.getElementById("evestatusapikey").value;
	var tempCharacterObj = document.getElementById("evestatuscharacterid");
	for (var i=0;i<cList.getRowCount();i++) {
		if(cList.getItemAtIndex(i).value.split(",")[0] == -1) { continue; }
		if(cList.getItemAtIndex(i).value.split(",")[0] == tempUserID && tempUserID != "" && tempApiKey != "" && tempCharacterObj.value != ""  ) {
			tempValue = tempUserID;
			tempValue += "," + tempApiKey;
			tempValue += "," +  tempCharacterObj.value;
			eveStatusPrefBranch.setCharPref("extensions.evestats.profiles." + tempCharacterObj.label, tempValue);
		} else {
			tempValue = cList.getItemAtIndex(i).value.split(",")[0];/*evestatususerid*/
			tempValue += "," + cList.getItemAtIndex(i).value.split(",")[1];/*evestatusapikey*/
			tempValue += "," + cList.getItemAtIndex(i).value.split(",")[2];/*evestatuscharacterid*/
			eveStatusPrefBranch.setCharPref("extensions.evestats.profiles." + cList.getItemAtIndex(i).getAttribute("label")/*CharacterName*/, tempValue);
		}
	}
	Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser').eveStatusInit();
}
function eveStatusGotoURL(aUrl) {
    if(aUrl == -1) { aUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=jorofi%40gmail%2ecom&lc=BG&item_name=Eve%20Online%20Character%20Status&item_number=101&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted"; }
	const EVESTATUS_WINDOW_MEDIATOR_ID = "@mozilla.org/appshell/window-mediator;1";
	const EVESTATUS_WINDOW_MEDIATORI_ID = Components.interfaces.nsIWindowMediator;
	const EVESTATUS_WINDOW_MEDIATOR = Components.classes[EVESTATUS_WINDOW_MEDIATOR_ID].getService(EVESTATUS_WINDOW_MEDIATORI_ID);
	var browserWindow = EVESTATUS_WINDOW_MEDIATOR.getMostRecentWindow("navigator:browser");
	var browser = browserWindow.getBrowser();
	browser.selectedTab = browser.addTab(aUrl);
	close();
}
function eveStatusGetCharacters() {
	var tempUserID = document.getElementById("evestatususerid").value;
	var tempApiKey = document.getElementById("evestatusapikey").value;
	if( tempUserID == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertUserID")); return false;}
	if( tempApiKey == "" ) { alert(EveStatusLocal("eveStatusPleaseInsertAPIKEY")); return false; }
	
	var eveAPI = "http://api.eve-online.com/account/Characters.xml.aspx?userid=" + tempUserID + "&apikey=" + tempApiKey;
	var http_request = false;
	http_request = new XMLHttpRequest();
	if (http_request.overrideMimeType) {
	  http_request.overrideMimeType('text/xml');
	}
	if (!http_request) {
	  alert(EveStatusLocal("eveStatusCCXMLHTTP"));
	  return false;
	}
	http_request.onreadystatechange = function() {
		if (http_request.readyState == 4) {
			if (http_request.status == 200) {
				var xmlobject = http_request.responseXML;
				try {
					if(!xmlobject.getElementsByTagName("error")[0]){
                        var rows = xmlobject.getElementsByTagName("row");
                        var tempCharacterID = document.getElementById("evestatuscharacterid").value;
                        var CharacterIDObj = document.getElementById("evestatuscharacterid");
                        CharacterIDObj.removeAllItems();
                        CharacterIDObj.selectedItem=null;
                        for (var i=0;i<rows.length;i++) {
                            var menuItem = CharacterIDObj.appendItem(rows[i].getAttribute("name"),rows[i].getAttribute("characterID"));
                            if(rows[i].getAttribute("characterID") == tempCharacterID) {
                                CharacterIDObj.selectedItem = menuItem;
                                continue;
                            }
                            if(CharacterIDObj.selectedItem == null) {
                                CharacterIDObj.selectedItem = menuItem;
                                continue;
                            }
                        }
                    } else {
                        alert(xmlobject.getElementsByTagName("error")[0].firstChild.nodeValue);
                    }
				} catch (e) {
					alert(e);
				}
			} else {
				alert(EveStatusLocal("eveStatusPanelLabelError"));
			}
		}
	}
	http_request.open('GET', eveAPI, true);
	http_request.send(null);
}
window.addEventListener("load", eveStatusloadDefault, false);