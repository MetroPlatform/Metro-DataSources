const sendDatapoint = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  datapoint['timestamp'] = Date.now();
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const createMenuButton = function(mc) {
  console.log('Creating contextMenu button');
  chrome.contextMenus.create({
    title: "Difficult Word",
    contexts: ["selection"],
    onclick: function(info, tab) {
      console.log('Clicked');
      let text = window.getSelection().toString();
      sendDatapoint(text, mc);
    }
  });
}

function initDataSource(metroClient) {
  console.log('Loading difficult-words DataSource...')
  createMenuButton(metroClient);
  console.log("Done!");
}
