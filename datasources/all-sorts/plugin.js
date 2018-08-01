const allSorts = {
  mc: null, // Keep a ref to the client
  name: 'all-sorts',

  /*
   * Attaches to instagram photos to display a transparent div to give
   * rate/comment options if the user is currently working on a project.
   */
  attachToPhotos: function() {
    allSorts.mc.readData("projectID", function(pid) {
      if(pid == null) {
        console.log("Not working on any job...")
      } else {
        // Actually load the panels.
        $(document).ready(function() {
          // For each photo pane on the page.
          $("._97aPb").each(function(i) {
            // Create a container div for the top panel to fade in
            let new_div = $("<div>");

            // And then two more divs for the comment/rate buttons.
            let comment_div = $("<div>");
            let comment_img = $("<img>");
            $(comment_img).attr("src", "https://www.shareicon.net/data/32x32/2015/09/22/105038_message_512x512.png");
            $(comment_img).attr("height", "32px");
            $(comment_img).attr("width", "32px");
            // Position must be absolute.
            $(comment_div).css({
              "position": "absolute",
              "right": "10%",
              "cursor": "pointer"
            });
            $(comment_img).click(allSorts.commentClickHandler);
            $(comment_div).prepend(comment_img);
            $(new_div).prepend(comment_div);

            let rate_div = $("<div>");
            let rate_img = $("<img>");
            $(rate_img).attr("src", "https://www.shareicon.net/data/128x128/2015/05/29/46104_star_32x32.png");
            $(rate_img).attr("height", "32px");
            $(rate_img).attr("width", "32px");
            $(rate_div).css({
              "position": "absolute",
              "right": "3%",
              "cursor": "pointer"
            });
            $(rate_img).click(allSorts.rateClickHandler);
            $(rate_div).prepend(rate_img);
            $(new_div).prepend(rate_div);

            // Style the container div to make it 100% transparent by default, have
            // a very high z-index and a transition attribute to make it fade
            // in/out.
            $(new_div).css({
              "transition": "0.8s ease",
              "opacity": "0.0",
              "position": "absolute",
              "top": "3%",
              "z-index": "100000000",
              "width": "100%",
              "height": "32px",
            });

            // Save the actual image div so we can apply opacity directly to it and
            // not the container (which would cause the newly loaded panel to also
            // have opacity).
            let main_image = $(this).find("img");
            $(main_image).css({
              "transition": "0.8s ease",
            });

            // And add this div to the existing image container.
            $(this).prepend(new_div);

            $(this).mouseenter(function() {
              // On mouse over make the main image blurred and make the new div in
              // focus.
              $(main_image).css({
                "opacity": "0.3",
              });
              $(new_div).css({
                "opacity": "1.0",
              });
            }).mouseleave(function() {
              // On mouse exit do the opposite.
              $(main_image).css({
                "opacity": "1.0",
              });
              $(new_div).css({
                "opacity": "0.0",
              });
            });
          });
        });
      }
    });
  },

  // Pop up the modal input box when the comment button is pressed.
  commentClickHandler: function() {
    allSorts.mc.createModalForm({
      description: "What's your comment?",
      submitCallback: allSorts.sendCommentDatapoint
    });
  },

  // Pop up the modal input box when the rate button is pressed.
  rateClickHandler: function() {
    allSorts.mc.createModalForm({
      description: "What's your rating?",
      submitCallback: allSorts.sendRateDatapoint
    });
  },

  /*
   * Reset the project/job IDs to null.
   */
  jobDoneHandler: function() {
    // Set the data values to null so we know we're no longer in a job.
    allSorts.mc.storeData("projectID", null);
    allSorts.mc.storeData("jobID", null);
  },

  /*
   * Run initially to take all nodes with class 'start-button' and register
   * them as starting a Metro job.
   */
  registerJobs: function() {
    // Jobs aren't always visible so update every time the jobs list updates:
    let mainNode = document.getElementById("task_list");
    this.jobRegisterObserver.observe(mainNode, this.jobRegisterConfig);

    $(".start-button").on("click", function() {
      // Store the relevant pieces of data.
      let projectID = $(this).data()['projectId'];
      let jobID = $(this).data()['jobId'];
      console.log("attached:");
      console.log(projectID);
      console.log(jobID);
      console.log("yeaa");

      allSorts.mc.storeData("projectID", projectID);
      allSorts.mc.storeData("jobID", jobID);
    });

    // Similarly for the job done button.
    $(".stop-button").on("click", function() {
      // Change the click handler to be the jobDoneHandler.
      $(this).on("click", allSorts.jobDoneHandler);

      console.log("detached");
    });
  },

  sendCommentDatapoint: function(comment) {
    allSorts.sendDatapoint("comment", comment);
  },

  sendRateDatapoint: function(rating) {
    allSorts.sendDatapoint("rate", rating);
  },

  // Creates the datapoint with the correct type field to ship off.
  sendDatapoint: function(type, content) {
    allSorts.mc.readData("projectID", function(projectID) {
      allSorts.mc.readData("jobID", function(jobID) {
        let datapoint = {
          "projectID": projectID,
          "jobID": jobID,
          "type": type,
          "content": content
        };

        console.log(datapoint);
        allSorts.mc.sendDatapoint(datapoint);
      });
    });
  },

  jobRegisterObserver: new MutationObserver(function(mutations) {
    allSorts.registerJobs();
  }),

  jobRegisterConfig: {
    attributes: false,
    childList: true,
    subtree: false
  },

  observer: new MutationObserver(function(mutations) {
    allSorts.attachToPhotos();
  }),

  observerConfig: {
    attributes: false,
    childList: true,
    subtree: false
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.registerJobs();

    // The MutationObserver ended up crashing the browser as Instagram loads so
    // much content on the fly. This is the workaround. Get the first "article"
    // (photo) on the page, go to the parent div, whenever any of it directly
    // gets a new child node (not its subtree. This is specified in the
    // observerConfig) run the attachToPhotos method.
    let gThis = this;
    $(document).ready(function() {
      // Only run on Instagram:
      if(window.location.href.indexOf("instagram.com") > -1) {
        gThis.attachToPhotos();
        let articleNode = document.getElementsByTagName("article")[0];
        let targetNode = articleNode.parentElement;
        gThis.observer.observe(targetNode, gThis.observerConfig);
      }
    });
  }
}

registerDataSource(allSorts); // Register the DataSource to start it.
