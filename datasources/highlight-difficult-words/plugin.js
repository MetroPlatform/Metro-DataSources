const sendDatapoint = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  datapoint['timestamp'] = Date.now();
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const createMenuButton = function(mc) {
  chrome.contextMenus.create({
    title: "Difficult Word",
    contexts: ["selection"],
    onclick: function(info, tab) {
      let text = window.getSelection().toString();
      sendDatapoint(text, mc);
    }
  });
}

function initDataSource(metroClient) {
  createMenuButton(metroClient);
  console.log("Loaded difficult-words DataSource");
}
