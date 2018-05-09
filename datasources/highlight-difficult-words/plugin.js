const send = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const validateInput = function(text) {
  if(text.includes(' ')) {
    var resp = {
      'status': 0,
      'msg': 'Please select one word at a time.'
    }
  } else {
    var resp = {
      'status': 1,
      'msg': 'Success!'
    };
  }

  return resp;
}

const sendDifficultWord = function(contextInfo) {
  let text = contextInfo['selectionText'];
  var resp = validateInput(text);

  if(resp['status'] == 1){
    send(text, mc);
  }

  return resp;
}

const createMenuButton = function(mc) {
  mc.createContextMenuButton({
    functionName: 'highlightDifficultWordsFunction',
    buttonTitle: 'Difficult Word',
    contexts: ['selection']
  }, sendDifficultWord);
}

var mc;

function initDataSource(metroClient) {
  mc = metroClient;
  createMenuButton(metroClient);
}
