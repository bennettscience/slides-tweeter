var KEY = "KEY";
var SECRET = "SECRET";

// Initialize Twitter login
function setup() {
  if (TwtrService.isUserConnectedToTwitter()){
   var result = Browser.msgBox("Twitter Authorisation",
                   "You appear to already be connected to Twitter.\\n\\nWould you like to run the setup again?",
                   Browser.Buttons.YES_NO);
    // Process the user's response.
    if (result == 'yes') {
      // User clicked "Yes".
      TwtrService.showTwitterKeySecret(SlidesApp);
    }
  } else {
    TwtrService.showTwitterKeySecret(SlidesApp);
  }
}
 
/**
* Used as part of setup() to process form data
*/
function processForm(formObject) {
  TwtrService.setUserKeySecret(formObject);
  TwtrService.showTwitterLogin(SlidesApp);
}

function checkKeys() {
  Logger.log("Connected: " + TwtrService.isUserConnectedToTwitter());
  Logger.log("Key: " + TwtrService.getUserKey());
  Logger.log("Secret: " + TwtrService.getUserSecret());
}

// Serve HTML for the custom presentation page
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}


// Loop the presentation and get the thumbnails
// Write to an array and give back to index

function getThumbnails() {
  var thumbs = [];
  var id = SlidesApp.getActivePresentation().getId();
  var slides = SlidesApp.getActivePresentation().getSlides();
  
  for(var i=0; i<slides.length; i++) {
    var objID = slides[i].getObjectId();
    var slide = Slides.Presentations.Pages.getThumbnail(id, objID)
    thumbs.push(slide);
  }
  return thumbs;
}


// Post a tweet with the image
function postTweet(img) {
  
  // Get the image
  Logger.log("Getting image blob...")
  var img = UrlFetchApp.fetch(img).getBlob();

  var picture_data = Utilities.base64Encode(img.getBytes());
  
  var params = {
    'media':picture_data
  }
  
  Logger.log("Uploading to Twitter...");
  // Don't use TwtrService, fetch directly to Twitter
  //var res = UrlFetchApp.fetch(baseUrl, options);
  var res = TwtrService.upload('media/upload', params);

  if(res) {
    Logger.log("Upload successful: " + res.media_id);
    var status = "How long will this take?";
    try {
      Logger.log("Posting tweet with media");
      var response = TwtrService.post('statuses/update', { status: status, media_ids: res.media_id_string });
      if(response) {
        Logger.log(response);
        return response;
      }
    } catch(e) {
      Logger.log("Error: " + e.toString());
    }
  }
} 
