const daftMessageSent = {
  name: 'daft-message-sent',

  getListingInfo: function(loadTime, leaveTime) {
    info = {
      user_data: {
        loadTime: loadTime,
        leaveTime: leaveTime,
        action: 'message_sent'
      },
      daft_data: {
        title: this.getTitle(),
        price: this.getPrice(),
        listing_type: this.getListingType(),
        header_info: this.getHeaderInfo(),
        property_overview: this.getPropertyOverview(),
        available_from: this.getAvailableFrom(),
        available_for: this.getAvailableFor(),
        property_description: this.getPropertyDescription(),
        facilities: this.getPropertyFacilities(),
        shortcode: this.getPropertyShortcode(),
        data_entered_renewed: this.getDateEnteredRenewed(),
        view_count: this.getViewCount(),
        image_count: this.getImageCount()
      }
    }

    return info;
  },

  getTitle: function() {
    // Get the title of the listing
    var title = $('#address_box .smi-object-header h1').text().trim();

    return title;
  },

  getPrice: function() {
    /*
    *  Get the price of the listing
    *  Usually of the forms:
    *  "From €XYZ per week"
    *  "From €XYZ per month"
    */
    var price = $('#smi-price-string').text().trim();

    return price;
  },

  getListingType: function() {
    // Get the type of the listing
    // e.g. "House Share", "Apartment Share", etc.
    var type = $('#smi-summary-items .header_text').first().text().trim();

    return type;
  },

  getHeaderInfo: function() {
    // Get the other heading info item
    // e.g. "X beds available for Y months"
    var info = $('#smi-summary-items .header_text').last().text().trim();

    return info;
  },

  getPropertyOverview: function() {
    // Get the property overview bullet points
    var overviewItems = $('#overview ul').children().toArray();

    overviewItems = $.map(overviewItems, function(x) {
      return x.innerText;
    });

    return overviewItems;
  },

  getAvailabilityBlock: function() {
    // Gets the block containing "Available From" and "Available To"
    return $('#overview').next();
  },

  getAvailableFrom: function() {
    // Get the starting move-in date
    var $block = this.getAvailabilityBlock();
    var from = $block.clone()    // clone the element
                      .children() // select all the children
                      .remove()   // remove all the children
                      .end()  // again go back to selected element
                      .text() // Get the text
                      .trim(); // Trim the whitespace

    return from;
  },

  getAvailableFor: function() {
    var $block = this.getAvailabilityBlock().find('div');
    var availableFor = $block.clone()    // clone the element
                              .children() // select all the children
                              .remove()   // remove all the children
                              .end()  // again go back to selected element
                              .text() // Get the text
                              .trim(); // Trim the whitespace

    return availableFor;
  },

  getPropertyDescription: function() {
    // Get the text description of the listing
    var $descriptionClone = $('#description').clone();

    $descriptionClone.find('#dfp-smi_ad_link_unit').remove();
    $descriptionClone.find('.description_extras').remove();
    var description = $descriptionClone.text();


    return description;
  },

  getPropertyFacilities: function() {
    /* Convert the facilities table to an array and return it
    *
    * ** BEWARE **
    * Fuctional Magic Below
    *
    */
    var $facilitiesMain = $('#facilities tbody tr');
    var facilities = $facilitiesMain.find('td').map(function(i, td) {
      return $(td).find('ul').children().toArray().map(function(li, j) {
        return li.innerText;
      });
    });

    return facilities.toArray();
  },

  getPropertyShortcode: function() {
    // Get the shortcode URL for the listing
    var shortcode = $('.description_extras a').attr('href');

    return shortcode;
  },

  getDateEnteredRenewed: function() {
    // Gets the date that the listing was created or renewed (?)
    var date = $("h3:contains('Date')")[0].nextSibling.textContent.trim();

    return date;
  },

  getViewCount: function() {
    // Gets the view count for the listing
    var views = $("h3:contains('Property Views')")[0].nextSibling.textContent.trim();

    return views;
  },

  getImageCount: function() {
    // Gets the number of images for the listing
    var imageCount = $('.smi-gallery-list').children().length;

    return imageCount;
  },

  setUpListener: function(metroClient) {
    /*
    * When the `#ad_reply_submit` button is clicked...
    */
    loadTime = (new Date).getTime();
    URL = window.location.href;

    let oThis = this;
    $('#ad_reply_submit').click(function() {
      // Do this:
      leaveTime = (new Date).getTime();

      let datapoint = oThis.getListingInfo(loadTime, leaveTime);

      console.log(datapoint);

      metroClient.sendDatapoint(datapoint);
    });
  },

  initDataSource: function(metroClient) {
    this.setUpListener(metroClient);
  }
}

registerDataSource(daftMessageSent);
