const registerEventsHandler = function(node) {
  // The nodes we want to attach to are very nicely named:
  // "post-action-[upvote|downvote|favorite]"
  // This means we can just do a for loop on the keyword:
  let eventTypes = ["upvote", "downvote", "favorite"];

  for(var i=0; i<eventTypes.length; i++) {
    let eventType = eventTypes[i];
    let eventNode = node.getElementsByClassName("post-action-"+eventType)[0];

    // Got the node, attach the click listener:
    eventNode.addEventListener("click", function(event) {
      sendDatapoint(eventType);
    });
  }
}

/*
 * Helper function to send a datapoint to MetroClient for different event
 * types.
 */
const sendDatapoint = function(eventType) {
  sendDatapointWithURL(eventType, window.location.href);
}

const sendDatapointWithURL = function(eventType, url) {
  // Create the datapoint:
  let datapoint = {};
  datapoint['event'] = eventType;
  datapoint['time'] = Date.now();
  datapoint['url'] = url;

  // And ship it off:
  mc.sendDatapoint(datapoint);
}


var mc;
function initDataSource(metroClient) {
  mc = metroClient;
  console.log("Beginning imgur-basic-interaction data source.");

  // On a page load we want to push it as a datapoint:
  sendDatapoint("load");

  // We need to detect when a page is left as it's loaded dynamically so we
  // need to poll the window.location.href to check if it's changed to do this
  // :/
  var currentURL = window.location.href;
  setInterval(function() {
    if(currentURL != window.location.href) {
      // Say we're leaving the old page...
      sendDatapointWithURL("leave", currentURL);
      currentURL = window.location.href;

      // And loading the new page:
      sendDatapointWithURL("load", currentURL);
    }
  }, 200);

  // Then start our plugin.
  registerEventsHandler(document.body);
}
