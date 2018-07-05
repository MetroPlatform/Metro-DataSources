const allSorts = {
  mc: null, // Keep a ref to the client
  name: 'all-sorts',

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    this.registerJobStarts();
    this.addRightClickButton();
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

        console.log(datapoint);
      });
    });
  }
}

registerDataSource(allSorts); // Register the DataSource to start it.
