function eveStatusDateObject() {
	this.DateObj = new Date();
	this.RemainingTime = 0;
    this.StringToDate = function (aString){
        var d = aString.split(" ")[0];
        var h = aString.split(" ")[1];
        var mont = Number(d.split("-")[1]) - 1;
        this.DateObj.setFullYear(d.split("-")[0],mont,d.split("-")[2]);
        this.DateObj.setHours(h.split(":")[0],h.split(":")[1],h.split(":")[2]);
        return this;
    }
    this.GetExactEndDate = function(){
        var tDate = new Date();
        tDate.setTime(tDate.getTime() + this.RemainingTime);
        return tDate.getDate() + "." + (tDate.getMonth() + 1) + "." + tDate.getFullYear() + " " + tDate.toLocaleTimeString();
    }
    this.SetRemainingTimeOffset = function (aMiliseconds){
        this.RemainingTime = this.RemainingTime - aMiliseconds;
    }
    this.GetRemainingTime = function(){
        var scratch=Math.floor(this.RemainingTime/1000); /* Discard miliseconds */
        var seconds=scratch % 60; /* Get modulus 60 for seconds */
        scratch = Math.floor((scratch-seconds)/60); /* Discard seconds. */
        var minutes=scratch % 60; /* Get modulus 60 for minutes */
        scratch = Math.floor((scratch-minutes)/60); /* Discard minutes. */
        var hours=scratch%24; /* Get modulus 24 for hours */
        scratch = Math.floor((scratch-hours)/24); /* Discard Hours */
        var days=scratch; /* Only days remain. */
        return ( days ? days + EveStatusLocal("eveStatusDate") : "") + ( hours ? hours + EveStatusLocal("eveStatusHour") : "") + ( minutes || hours ? minutes + EveStatusLocal("eveStatusMin") : "") + seconds + EveStatusLocal("eveStatusSec");
    }
}

var EveStatusCharacter = function(aName,aApi, aCallback){
	this.settings ={
		name :aName,
		api  :aApi,
		status :"NO",
		callback :aCallback
	}
	this.http_request  = false;
	this.panel         = document.getElementById("evestats-panel");
	this.fullSkillName = false;
	this.trainingEndTime;
	this.initialize();
}
function eveStatusGetSkillName(aTrainingTypeID) {
	var xmlDoc=document.implementation.createDocument("","",null);	
        xmlDoc.async=false;
        xmlDoc.load("chrome://evestats/content/SkillTree.xml");
	var rows = xmlDoc.getElementsByTagName("row");
	for (var i=0;i<=rows.length;i++) {
		if(rows[i].getAttribute("typeID") == aTrainingTypeID && rows[i].getAttribute("groupID") != null) {
			return rows[i].getAttribute("typeName");
		}
	}
}
EveStatusCharacter.prototype = {
	initialize: function() {
		this.panel.label = EveStatusLocal("eveStatusInitializingCharacter") + this.settings.name;
		this.ajaxRequest()
	},
	ajaxRequest: function() {
		var self = this;
		this.http_request = new XMLHttpRequest();
		if (!this.http_request) {
			this.panel.label = EveStatusLocal("eveStatusCCXMLHTTP");
			return false;
		}
		this.http_request.onreadystatechange = function() {
			if (self.http_request.readyState != 4) return;
			if (self.http_request.status == 200) {
				var xmlobject = self.http_request.responseXML;
				try {
                    if(xmlobject.getElementsByTagName("skillInTraining")[0]) {
                        if(xmlobject.getElementsByTagName("skillInTraining")[0].firstChild.nodeValue == 1) {
                            self.settings.status = "OK";
                            var trainingToLevel = Number(xmlobject.getElementsByTagName("trainingToLevel")[0].firstChild.nodeValue);
                            switch(trainingToLevel) {
                                case 1: { trainingToLevel = " I"; break; }
                                case 2: { trainingToLevel = " II"; break; }
                                case 3: { trainingToLevel = " III"; break; }
                                case 4: { trainingToLevel = " IV"; break; }
                                case 5: { trainingToLevel = " V"; break; }
                                default : { trainingToLevel = " Zero"; }
                            }
                            var SkillName = eveStatusGetSkillName(xmlobject.getElementsByTagName("trainingTypeID")[0].firstChild.nodeValue)
                            self.fullSkillName = SkillName + trainingToLevel;
                            self.trainingEndTime = new eveStatusDateObject().StringToDate(xmlobject.getElementsByTagName("trainingEndTime")[0].firstChild.nodeValue);
                            var currentTQTime = new eveStatusDateObject().StringToDate(xmlobject.getElementsByTagName("currentTQTime")[0].firstChild.nodeValue);
                            self.trainingEndTime.RemainingTime = self.trainingEndTime.DateObj - currentTQTime.DateObj;
                            self.settings.callback(self);
                        } else {
                            self.fullSkillName = EveStatusLocal("eveStatusNoSkillInTraining");
                            self.settings.status = "NO";
                            self.settings.callback(self);
                        }
                    } else {
                        self.fullSkillName = xmlobject.getElementsByTagName("error")[0].firstChild.nodeValue;
                        self.settings.status = "ERROR";
                        self.settings.callback(self);
                    }

				} catch (ex) {
                    alert(ex);
				}
			} else {
				self.panel.label = EveStatusLocal("eveStatusPanelLabelError");
			}
		}
		this.http_request.open('GET', this.settings.api, true);
		this.http_request.send(null);
	}
}