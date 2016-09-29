var GRITS_HOST = "https://grits.eha.io";
var iframe = document.querySelector('iframe');
iframe.src = GRITS_HOST + "/new?compact=true&bsveAccessKey=loremipsumhello714902&hideBackButton=true";
BSVE.init(function() {
  BSVE.api.exchange.receive(function(data) {
    var gritsFrame = iframe.contentWindow;
    var link = data.Link || data.link;
    var content = data.Content || data.content;

    var searchPattern = new RegExp('^(Unable to extract content|Loading full article|false)');
    if (searchPattern.test(content)) {
      content = '';
    }

    console.log(">Content: " + content);
    console.log(">Link:" + link);

    var obj = {
      'content': content,
      'link': link
    };

    gritsFrame.postMessage(JSON.stringify(obj), GRITS_HOST);
  });
  BSVE.ui.dossierbar.create(function(status, ctx){
    iframe.contentWindow.postMessage(JSON.stringify({type: "screenCapture"}), GRITS_HOST);
    var screenCapturePromise = new Promise(function(resolve){
      window.addEventListener("message", function handler(event){
        if(event.origin !== GRITS_HOST) return;
        try {
          var message = JSON.parse(event.data);
          if(message.screenCapture) {
            resolve(message);
            window.removeEventListener("message", handler);
          }
        } catch(e) {
          return;
        }
      }, false);
    });
    screenCapturePromise.then(function(message){
      BSVE.api.tagItem({
        title: message.title,
        dataSource: "GRITS",
        sourceDate: (new Date()).toISOString().split("T")[0],
        itemDetail: {
          statusIconType: "Text",
          Description: '<img src="' + message.screenCapture + '"/><br /><a target="_blank" href="' + message.url + '">Link</a>'
        }
      }, status, function(result){
        console.log("done", result);
      });
    });
  });
});