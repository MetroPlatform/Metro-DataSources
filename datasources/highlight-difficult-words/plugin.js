const highlightDifficultWords = {
  mc: null,
  name: "highlight-difficult-words",

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.createMenuButton(metroClient);
  },

  send: function(text) {
    let datapoint = {};
    datapoint['text'] = text;
    console.log(datapoint);

    this.mc.sendDatapoint(datapoint);
  },

  validateInput: function(text) {
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
  },

  sendDifficultWord: function(contextInfo) {
    let text = contextInfo['selectionText'];
    var resp = this.validateInput(text);

    if(resp['status'] == 1){
      this.send(text);
    }

    return resp;
  },

  createMenuButton: function() {
    this.mc.createContextMenuButton({
      functionName: 'highlightDifficultWordsFunction',
      buttonTitle: 'Difficult Word',
      contexts: ['selection']
    }, this.sendDifficultWord.bind(this));
  }
}

registerDataSource(highlightDifficultWords);
