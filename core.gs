function disconnect() {
  TwtrService.disconnectTwitter();
}

/**
* Launches key/secret and auth flow
*/
function setup() {
  if (TwtrService.isUserConnectedToTwitter()){
   var result = Browser.msgBox("Twitter Authorisation",
                   "You appear to already be connected to Twitter.\\n\\nWould you like to run the setup again?",
                   Browser.Buttons.YES_NO);
    // Process the user's response.
    if (result == 'yes') {
      // User clicked "Yes".
      showTwitterKeySecret(SlidesApp);
    }
  } else {
    showTwitterKeySecret(SlidesApp);
  }
}
 
/**
* Used as part of setup() to process form data
*/
function processForm(formObject) {
  TwtrService.setUserKeySecret(formObject);
  TwtrService.showTwitterLogin(SlidesApp);
  SlidesApp.getUi().createAddonMenu().addItem("Launch Player", "openPlayer").addItem("Disconnect Account" , "disconnect").addToUi();
}

function checkKeys() {
  Logger.log("Connected: " + TwtrService.isUserConnectedToTwitter());
  Logger.log("Key: " + TwtrService.getUserKey());
  Logger.log("Secret: " + TwtrService.getUserSecret());
}

function onInstall(e) {
  onOpen(e)
}


// Add the menu item to the Slides Editor
function onOpen(e) {
  if(TwtrService.isUserConnectedToTwitter()) {
    SlidesApp.getUi().createAddonMenu().addItem("Launch Player", "openPlayer").addItem("Disconnect Account" , "disconnect").addToUi();
  } else {
    SlidesApp.getUi().createAddonMenu().addItem("Connect Account", "setup").addToUi();
  }
}

// Get the stored hashtag for the presentation
function getProps() {
  return PropertiesService.getDocumentProperties().getProperty('tag');
}

// Return the URL and title of the published webapp
function getUrl(formObject) {
  var props = { "tag": formObject.hashtag, "id": formObject.id };
  
  Logger.log(props);
  
  PropertiesService.getScriptProperties().setProperties(props, true);
  var obj = {};
    obj.url = "Public Key Here";
    obj.title = formObject.title;
    return obj;
}

function checkProps() {
  Logger.log(PropertiesService.getScriptProperties().getProperties());
}

// Engage a user interaction to open the custom player in a new tab
function openPlayer() {
  if(TwtrService.isUserConnectedToTwitter()) {
    var html = HtmlService.createTemplateFromFile('popup').evaluate();
    SlidesApp.getUi().showModelessDialog(html, "Slide Tweeter Settings");  
  } else {
    setup(SlidesApp);
  }
}

// Serve HTML for the custom presentation page
function doGet(e) {
  Logger.log(e);
  return HtmlService.createHtmlOutputFromFile('player').setHeight(700).setWidth(1600).setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


// Loop the presentation and get the thumbnails
// Write to an array and give back to index

function getThumbnails() {
  var thumbs = [];
  var id = PropertiesService.getScriptProperties().getProperty("id");
  var slides = SlidesApp.openById(id).getSlides();
  
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
  Logger.log(res);

  if(res) {
    Logger.log("Upload successful: " + res.media_id);
    var status = PropertiesService.getScriptProperties().getProperty('tag');
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

function testTweetSpeed() {
  var status = "How fast will this go?";
  var base = 'statuses/update';

  try {
    var res = TwtrService.post('statuses/update', { status: status });
    if(res) {
      Logger.log(res);
    }
  } catch(e) {
    Logger.log(e.toString())
  }
}