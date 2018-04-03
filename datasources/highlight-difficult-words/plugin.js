const sendDatapoint = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  datapoint['timestamp'] = Date.now();
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const sendDifficultWord = function() {
  console.log("Callback triggered");
  let text = window.getSelection().toString();
  sendDatapoint(text, mc);
}

const createMenuButton = function(mc) {
  console.log('Creating contextMenu button');
  mc.createContextMenuButton({
    buttonFunction: 'highlightDifficultWordsFunction',
    buttonTitle: 'Difficult Word',
    contexts: ['selection']
  }, sendDifficultWord)
}

var mc;

function initDataSource(metroClient) {
  mc = metroClient;
  console.log('Loading difficult-words DataSource...')
  createMenuButton(metroClient);
  console.log("Done!");
}
