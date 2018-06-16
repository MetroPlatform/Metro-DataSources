const redditTimeBetweenActions = {
  mc: null,
  name: 'reddit-time-between-actions',

  // List of events that when they occur will send a datapoint.
  triggeringEvents: [
    "click",
    "copy",
    "cut",
    "paste",
    "drag",
    "drop",
    "keypress",
    "wheel"
  ],

  registerEventsHandler: function (node) {
    let gThis = this;

    // Set up an event handler for each triggeringEvent:
    for(var i=0; i<this.triggeringEvents.length; i++) {
      let currentEvent = this.triggeringEvents[i];

      // Add the event listener:
      document.addEventListener(currentEvent, function(event) {
        // An event was triggered - record the current time:
        let eventTime = Date.now();

        // And get the previously stored time:
        gThis.mc.readData("timepoint", function(prevTime) {
          console.log(prevTime);
          if(prevTime > 0) {
            // Find the time difference:
            let duration = eventTime - prevTime;
            console.log(duration);

            // And create the datapoint:
            let datapoint = {};
            datapoint['event'] = currentEvent;
            datapoint['time'] = duration;

            // Don't send more than 1 datapoint per 5 seconds:
            if(duration > 5000) {
              gThis.mc.sendDatapoint(datapoint);
            }
          }

          // Finally, store the updated timepoint:
          gThis.mc.storeData("timepoint", eventTime);
        });
      });
    }
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    console.log("Beginning reddit-time-between-actions data source.");

    // We want to set the initial load time here:
    let currentTime = Date.now();
    this.mc.storeData("timepoint", currentTime);

    // Then start our plugin.
    this.registerEventsHandler(document.body);
  }
}

registerDataSource(redditTimeBetweenActions);
