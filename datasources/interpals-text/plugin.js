const registerEventsHandler = function(doc, mc) {
  let textarea = $('#message');
  let sendButton = $("#msg_submit");

  sendButton.bind("click", function(event) {
    sendDatapoint(textarea.val(), mc)
  });
}

const sendDatapoint = function(message, mc) {
  let datapoint = {};
  datapoint['message'] = message;
  datapoint['timestamp'] = Date.now();
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

function initDataSource(metroClient) {
  registerEventsHandler(document, metroClient);
  console.log("Loaded Interpals-Text DataSource");
}
