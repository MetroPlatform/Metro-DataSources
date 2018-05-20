const registerEventsHandler = function(mc) {
  let textarea = $('#message');
  let sendButton = $("#msg_submit");

  sendButton.bind("click", function(event) {
    sendDatapoint(textarea.val(), mc)
  });
}

const sendDatapoint = function(message, mc) {
  let datapoint = {};
  datapoint['message'] = message;

  mc.sendDatapoint(datapoint);
}

function initDataSource(metroClient) {
  registerEventsHandler(metroClient);
  console.log("Loaded Interpals-Text DataSource");
}
