// List of events that when they occur will send a datapoint.
const triggeringEvents = [
  "click",
  "copy",
  "cut",
  "paste",
  "drag",
  "drop",
  "keypress",
  "wheel"
]

const registerEventsHandler = function (node) {
  // Set up an event handler for each triggeringEvent:
  for(var i=0; i<triggeringEvents.length; i++) {
    let currentEvent = triggeringEvents[i];

    // Add the event listener:
    document.addEventListener(currentEvent, function(event) {
      // An event was triggered - record the current time:
      let eventTime = Date.now();

      // And get the previously stored time:
      mc.readData("timepoint", function(prevTime) {
        if(prevTime > 0) {
          // Find the time difference:
          let duration = eventTime - prevTime;

          // And create the datapoint:
          let datapoint = {};
          datapoint['event'] = currentEvent;
          datapoint['time'] = duration;

          // Don't send more than 1 datapoint per 5 seconds:
          if(duration > 5000) {
            mc.sendDatapoint(datapoint);
          }
        }
        
        // Finally, store the updated timepoint:
        mc.storeData("timepoint", eventTime);
      });
    });
  }
}


var mc;
function initDataSource(metroClient) {
  mc = metroClient;
  console.log("Beginning reddit-time-between-actions data source.");

  // We want to set the initial load time here:
  let currentTime = Date.now();
  mc.storeData("timepoint", currentTime);

  // Then start our plugin.
  registerEventsHandler(document.body);
}
