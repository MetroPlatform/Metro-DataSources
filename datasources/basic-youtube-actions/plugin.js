const basicYoutubeActions = {
  mc: null,
  name: 'basic-youtube-actions',

  registerEventsHandler: function(node) {
    // First we need to get the video player element:
    let $videoPlayer = $('#movie_player');
    // There is a class that is dynamically changed on this element. Either
    // "paused-mode" or "playing-mode" or "ended-mode". We are going to
    // setInterval on this and monitor it for changes to the class. When it
    // changes, we fire that event.
    let currentEvent = "";
    const self = this;

    setInterval(function() {
      let playing = $videoPlayer.hasClass("playing-mode");
      let paused = $videoPlayer.hasClass("paused-mode");
      let ended = $videoPlayer.hasClass("ended-mode");

      if(playing && currentEvent != "play") {
        self.sendDatapoint("play");
        currentEvent = "play";
      } if(paused && currentEvent != "pause") {
        self.sendDatapoint("pause");
        currentEvent = "pause";
      } if(ended && currentEvent != "finished") {
        self.sendDatapoint("finished");
        currentEvent = "finished";
      }
    }, 250);
  },

  sendDatapoint: function(eventType) {
    // Create the datapoint:
    let datapoint = {};
    datapoint['event'] = eventType;
    datapoint['time'] = Date.now();
    datapoint['url'] = window.location.href;
    datapoint['title'] = document.title;

    // Log it
    console.log(datapoint);

    // And ship it off:
    this.mc.sendDatapoint(datapoint);
  },

  initDataSource: function(metroClient) {
    // The entrypoint
    this.mc = metroClient;
    console.log("Beginning YouTube actions DataSource.");

    // Set up the event listeners on the page.
    this.registerEventsHandler(document.body);
  }
}

registerDataSource(basicYoutubeActions);
