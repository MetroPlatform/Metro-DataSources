const allSorts = {
  mc: null, // Keep a ref to the client
  name: 'all-sorts',

  /*
   * Attaches to instagram photos to display a transparent div to give
   * rate/comment options.
   */
  attachToPhotos: function() {
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
          "right": "10%"
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
          "right": "3%"
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
  },

  commentClickHandler: function() {
    allSorts.mc.readData("projectID", function(pid) {
      if(pid == null) {
        console.log("Not working on any job...")
      } else {
        allSorts.mc.createModalForm({
          description: "What's your comment?",
          submitCallback: allSorts.sendCommentDatapoint
        });
      }
    });
  },

  rateClickHandler: function() {
    allSorts.mc.readData("projectID", function(pid) {
      if(pid == null) {
        console.log("Not working on any job...")
      } else {
        allSorts.mc.createModalForm({
          description: "What's your rating?",
          // TODO: Change to sendRateDatapoint
          submitCallback: allSorts.sendCommentDatapoint
        });
      }
    });
  },

  /*
   * Create the datapoint to show how long the user was working for.
   */
  jobDoneHandler: function() {
    // Sets the button to be useless.
    $(this).text("Complete");
    $(this).off("click");

    let endTime = Date.now();

    // Gets the datapoint for shipping off.
    allSorts.mc.readData("jobStart", function(startTime) {
      allSorts.mc.readData("projectID", function(projectID) {
        allSorts.mc.readData("jobID", function(jobID) {
          let datapoint = {
            "projectID": projectID,
            "jobID": jobID,
            "startTime": startTime,
            "endTime": endTime
          };

          allSorts.mc.sendDatapoint(datapoint);
          console.log(datapoint);
          // Finally set the data values to null so we know we're no longer in a job.
          allSorts.mc.storeData("projectID", null);
          allSorts.mc.storeData("jobID", null);
          allSorts.mc.storeData("jobStart", null);
        });
      });
    });
  },

  /*
   * Run initially to take all nodes with class 'start-button' and register
   * them as starting a Metro job.
   */
  registerJobStarts: function() {
    $(".start-button").on("click", function() {
      // Move the click handler to be the jobDoneHandler.
      $(this).text("Done");
      $(this).off("click");
      $(this).on("click", allSorts.jobDoneHandler);

      // Store the relevant pieces of data.
      let projectID = $(this).data()['projectId'];
      let jobID = $(this).data()['jobId'];

      allSorts.mc.storeData("projectID", projectID);
      allSorts.mc.storeData("jobID", jobID);
      allSorts.mc.storeData("jobStart", Date.now());
    });
  },

  /*
   * Adds the right click button if the project ID is populated.
   */
  addRightClickButton: function() {
    allSorts.mc.readData("projectID", function(pid) {
      if(pid != null) {
        allSorts.mc.createContextMenuButton({
          functionName: 'allSortsLabel',
          buttonTitle: ' AllSorts Label',
          contexts: ['all']
        }, allSorts.rightClickCallback);
      }
    });
  },

  /*
   * Decides if the right click button should display the modal based on if
   * the project ID is populated.
   */
  rightClickCallback: function(contextInfo) {
    // Only create the modal if the user is working on a job.
    allSorts.mc.readData("projectID", function(pid) {
      if(pid == null) {
        return {'status': 0, 'msg': 'not working on any job.'};
      } else {
        allSorts.mc.createModalForm({
          description: "What's your comment?",
          submitCallback: allSorts.sendCommentDatapoint
        });
        return {'status': 1, 'msg': 'success'};
      }
    });
  },

  /*
   * Triggered when a comment is made using the right-click modal.
   */
  sendCommentDatapoint: function(comment) {
    // Creates the datapoint for shipping off.
    allSorts.mc.readData("projectID", function(projectID) {
      allSorts.mc.readData("jobID", function(jobID) {
        let datapoint = {
          "projectID": projectID,
          "jobID": jobID,
          "comment": comment
        };

        allSorts.mc.sendDatapoint(datapoint);
        console.log(datapoint);
      });
    });
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.registerJobStarts();

    // The MutationObserver ended up crashing the browser as Instagram loads so
    // much content on the fly. This is the workaround:
    setInterval(this.attachToPhotos, 1200);
    //this.addRightClickButton();
  }
}

registerDataSource(allSorts); // Register the DataSource to start it.
