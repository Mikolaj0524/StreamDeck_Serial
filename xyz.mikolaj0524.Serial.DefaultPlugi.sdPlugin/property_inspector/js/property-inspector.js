// global websocket, used to communicate from/to Stream Deck software
// as well as some info about our plugin, as sent by Stream Deck software 
var websocket = null,
  uuid = null,
  inInfo = null,
  actionInfo = {},
  settingsModel = {
	  Port: "COM",
	  Baud: 9600,
	  Data: "Some data.."
  };

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  actionInfo = JSON.parse(inActionInfo);
  inInfo = JSON.parse(inInfo);
  websocket = new WebSocket('ws://localhost:' + inPort);

  if (actionInfo.payload.settings.settingsModel) {
	settingsModel.Port = actionInfo.payload.settings.settingsModel.Port;
	settingsModel.Baud = actionInfo.payload.settings.settingsModel.Baud;
	settingsModel.Data = actionInfo.payload.settings.settingsModel.Data;
  }

  document.getElementById('txtPort').value = settingsModel.Port;
  document.getElementById('txtBaud').value = settingsModel.Baud;
  document.getElementById('txtData').value = settingsModel.Data;

  websocket.onopen = function () {
	var json = { event: inRegisterEvent, uuid: inUUID };
	websocket.send(JSON.stringify(json));
  };

  websocket.onmessage = function (evt) {
	var jsonObj = JSON.parse(evt.data);
	var sdEvent = jsonObj['event'];
	switch (sdEvent) {
	  case "didReceiveSettings":
		if (jsonObj.payload.settings.settingsModel.Port) {
			settingsModel.Port = jsonObj.payload.settings.settingsModel.Port;
			document.getElementById('txtPort').value = settingsModel.Port;
		}
		if (jsonObj.payload.settings.settingsModel.Baud) {
			settingsModel.Baud = jsonObj.payload.settings.settingsModel.Baud;
			document.getElementById('txtBaud').value = settingsModel.Baud;
		}
		if (jsonObj.payload.settings.settingsModel.Data) {
			settingsModel.Data = jsonObj.payload.settings.settingsModel.Data;
			document.getElementById('txtData').value = settingsModel.Data;
		}
		break;
	  default:
		break;
	}
  };
}

const setSettings = (value, param) => {
  if (websocket) {
	settingsModel[param] = value;
	var json = {
	  "event": "setSettings",
	  "context": uuid,
	  "payload": {
		"settingsModel": settingsModel
	  }
	};
	websocket.send(JSON.stringify(json));
  }
};

