const registerEventsHandler = function(node) {
  // Get all result nodes:
  let resultNodes = node.getElementsByClassName("r");

  for(let resultIndex=0; resultIndex<resultNodes.length; resultIndex++) {
    let resultNode = resultNodes[resultIndex];
    let linkNode = resultNode.getElementsByTagName("a")[0];
    let linkURL = linkNode.getAttribute("href");
    let linkText = linkNode.innerHTML;

    linkNode.addEventListener("click", function(event) {
      sendClickDatapoint(resultIndex, linkURL, linkText);
    });
  }
}

const getQueryText = function() {
  let queryBox = document.getElementById("lst-ib");
  return queryBox.getAttribute("value");
}

const sendClickDatapoint = function(resultIndex, linkURL, linkText) {
  // Create the datapoint:
  let datapoint = {};
  datapoint['event'] = "click";
  datapoint['time'] = Date.now();
  datapoint['query'] = getQueryText();
  datapoint['resultIndex'] = resultIndex;
  datapoint['url'] = linkURL;
  datapoint['resultTitle'] = linkText;

  // And ship it off:
  mc.sendDatapoint(datapoint);
}

const sendLoadDatapoint= function() {
  // Create the datapoint:
  let datapoint = {};
  datapoint['event'] = "load";
  datapoint['time'] = Date.now();
  datapoint['query'] = getQueryText();
  datapoint['resultIndex'] = -1;
  datapoint['url'] = "";
  datapoint['resultTitle'] = "";

  // And ship it off:
  mc.sendDatapoint(datapoint);
}

var mc;
function initDataSource(metroClient) {
  mc = metroClient;
  console.log("Beginning google-search-clicks data source.");

  // On a page load we want to push it as a datapoint:
  sendLoadDatapoint();

  // Then start our plugin.
  registerEventsHandler(document.body);
}
