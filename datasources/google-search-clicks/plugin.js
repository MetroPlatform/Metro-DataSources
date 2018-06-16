const googleSearchClicks = {
  mc: null,
  name: 'google-search-clicks',

  registerEventsHandler: function(node) {
    // Get all result nodes:
    let resultNodes = node.getElementsByClassName("r");

    for(let resultIndex=0; resultIndex<resultNodes.length; resultIndex++) {
      let resultNode = resultNodes[resultIndex];
      let linkNode = resultNode.getElementsByTagName("a")[0];
      let linkURL = linkNode.getAttribute("href");
      let linkText = linkNode.innerHTML;

      const gThis = this;

      linkNode.addEventListener("click", function(event) {
        console.log("test");
        gThis.sendClickDatapoint(resultIndex, linkURL, linkText);
      });
    }
  },

  getQueryText: function() {
    let queryBox = document.getElementById("lst-ib");
    return queryBox.getAttribute("value");
  },

  sendClickDatapoint: function(resultIndex, linkURL, linkText) {
    // Create the datapoint:
    let datapoint = {};
    datapoint['event'] = "click";
    datapoint['time'] = Date.now();
    datapoint['query'] = this.getQueryText();
    datapoint['resultIndex'] = resultIndex;
    datapoint['url'] = linkURL;
    datapoint['resultTitle'] = linkText;

    console.log(datapoint);
    // And ship it off:
    this.mc.sendDatapoint(datapoint);
  },

  sendLoadDatapoint: function() {
    // Create the datapoint:
    let datapoint = {};
    datapoint['event'] = "load";
    datapoint['time'] = Date.now();
    datapoint['query'] = this.getQueryText();
    datapoint['resultIndex'] = -1;
    datapoint['url'] = "";
    datapoint['resultTitle'] = "";

    // And ship it off:
    this.mc.sendDatapoint(datapoint);
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    console.log("Beginning google-search-clicks data source.");

    // On a page load we want to push it as a datapoint:
    this.sendLoadDatapoint();

    // Then start our plugin.
    this.registerEventsHandler(document.body);
  }
}

registerDataSource(googleSearchClicks);
