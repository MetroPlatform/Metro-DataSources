const sendDatapoint = function(text, mc) {
  let datapoint = {};
  datapoint['text'] = text;
  console.log(datapoint);

  mc.sendDatapoint(datapoint);
}

const modalSubmitCallback = function(response) {
  console.log(response);
}

const markPageAsFake = function() {
  console.log("Marking page as fake... plz pop up dialog.");

  dialogDetails = {
    "description": "This is the modal description...",
    "submitCallback": modalSubmitCallback
  };

  mc.createModalForm(dialogDetails);
}

const createMenuButton = function(mc) {
  mc.createContextMenuButton({
    buttonFunction: 'markFakeNewsFunction',
    buttonTitle: 'Mark as 2!',
    contexts: ['all']
  }, markPageAsFake);
}

var mc;

function initDataSource(metroClient) {
  mc = metroClient;

  // Add the modal HTML/CSS:
  createMenuButton(metroClient);
}
