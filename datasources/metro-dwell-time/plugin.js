const metroDwellTime = {
  name: 'metro-dwell-time',

  monitorDwellTime: function(metroClient) {
    loadTime = (new Date).getTime();
    URL = window.location.href;

    window.addEventListener("beforeunload", function() {
      leaveTime = (new Date).getTime();

      let datapoint = {
        "loadTime": loadTime,
        "leaveTime": leaveTime,
        "URL": URL
      }

      metroClient.sendDatapoint(datapoint);
    });
  },

  initDataSource: function(metroClient) {
    this.monitorDwellTime(metroClient);
  }
}

registerDataSource(metroDwellTime);
