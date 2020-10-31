 //Add a handler to handle message sent from popup.html
 chrome.runtime.onMessage.addListener(function (request, sender) {
     //Hanlde request based on method
     if (request.method == "getSelection")
     //Send selected text back to popup.html
     chrome.runtime.sendMessage({
         data: document.getSelection().toString()
     });
     else chrome.extension.sendMessage({}); // snub them.
 });
