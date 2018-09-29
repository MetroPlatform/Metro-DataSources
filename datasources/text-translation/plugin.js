const translateText = {
  mc: null,
  name: "text-translation",

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.createMenuButton(metroClient);
  },

  send: function(original, translation, source, destination) {
    let datapoint = {};
    datapoint['original'] = original;
    datapoint['translation'] = translation;
    datapoint['source'] = source;
    datapoint['destination'] = destination;
    console.log(datapoint);

    this.mc.sendDatapoint(datapoint);
  },

  // Validate the answer
  translationValid: function(translation) {
    if(translation['inputs'][0] === '') {
      return {
        'status': 0,
        'msg': 'Translation cannot be blank'
      }
    } else if(translation['inputs'][1] === translation['inputs'][2]) {
      return {
        'status': 0,
        'msg': 'Source and destination language cannot be the same'
      }
    } else {
      return {
        'status': 1,
        'msg': 'Success!'
      };
    }
  },

  createMenuButton: function() {
    this.mc.createContextMenuButton({
      functionName: 'translateFunction',
      buttonTitle: 'Translate',
      contexts: ['selection']
    }, this.translateWordRightClickCallback.bind(this));
  },

  translateWordRightClickCallback: function(contextInfo) {
    let original = contextInfo['selectionText'];

    this.mc.createModalForm({
      inputs: [
        {
          description: 'Translation: ',
          type: 'input'
        },
        {
          description: 'Source Language: ',
          type: 'select',
          options: [
            {val : 'fr', text: 'fr'},
            {val : 'en', text: 'en'},
            {val : 'de', text: 'de'},
            {val : 'ru', text: 'ru'},
            {val : 'it', text: 'it'},
            {val : 'por', text: 'por'},
            {val : 'esp', text: 'esp'},
          ]
        },
        {
          description: 'Dest. Language: ',
          type: 'select',
          options: [
            {val : 'fr', text: 'fr'},
            {val : 'en', text: 'en'},
            {val : 'de', text: 'de'},
            {val : 'ru', text: 'ru'},
            {val : 'it', text: 'it'},
            {val : 'por', text: 'por'},
            {val : 'esp', text: 'esp'},
          ]
        }
      ],
      submitCallback: function(translation) {
        // Callback runs when the user submits the modal form
        // Receives one argument: the text input from the user

        var resp = this.translationValid(translation);
        if(resp['status'] == 1) {
          this.send(original, translation['inputs'][0], translation['inputs'][1], translation['inputs'][2]);
        } else {
          alert(resp['msg']);
        }
      }.bind(this)
    })

    return {status: 1, msg: 'success'};
  }
}

registerDataSource(translateText);
