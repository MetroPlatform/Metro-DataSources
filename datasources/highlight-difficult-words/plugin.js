const sendDatapoint = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const sendDifficultWord = function() {
  let text = window.getSelection().toString();
  sendDatapoint(text, mc);
}

const createMenuButton = function(mc) {
  mc.createContextMenuButton({
    buttonFunction: 'highlightDifficultWordsFunction',
    buttonTitle: 'Difficult Word',
    contexts: ['selection']
  }, sendDifficultWord)
}

var mc;

function initDataSource(metroClient) {
  mc = metroClient;
  createMenuButton(metroClient);
}
