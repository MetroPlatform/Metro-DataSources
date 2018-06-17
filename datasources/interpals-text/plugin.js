const interpalsText = {
  mc: null,
  name: 'interpals-text',

  registerEventsHandler: function() {
    let textarea = $('#message');
    let sendButton = $("#msg_submit");
    let gThis = this;

    sendButton.bind("click", function(event) {
      gThis.sendDatapoint(textarea.val(), this.mc)
    });
  },

  sendDatapoint: function(message) {
    let datapoint = {};
    datapoint['message'] = message;

    this.mc.sendDatapoint(datapoint);
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.registerEventsHandler();
    console.log("Loaded Interpals-Text DataSource");
  }
}

registerDataSource(interpalsText);
