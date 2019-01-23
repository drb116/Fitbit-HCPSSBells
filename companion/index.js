import * as messaging from "messaging";
import { settingsStorage } from "settings";

// A user changes settings
settingsStorage.onchange = evt => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(
        {key: evt.key,
        value: JSON.parse(evt.newValue)
    });
  }
  else {
    console.log("No peerSocket connection");
  }
};


