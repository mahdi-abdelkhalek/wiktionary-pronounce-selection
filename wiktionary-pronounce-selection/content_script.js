 // Add a handler to handle message sent from popup.html
 chrome.runtime.onMessage.addListener(function (request, sender) {
     if (request.method == "getSelection")
     chrome.runtime.sendMessage({
         data: window.getSelection().toString()
     });
     else chrome.extension.sendMessage({});
 });
