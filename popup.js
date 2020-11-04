var lang = 'English';
chrome.storage.sync.get({
		language: 'English',
	}, function(items) {
		lang = items.language;
	});

const pr = 'Pronunciation'; // in case support for other Wiktionary languages will be added in the futur...
var selection;
var sectry = false;

var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		try {
			if (this.readyState == 4 && this.status == 200) {
				var content = this.responseText;
				if (content.startsWith('{"error":{"code":"missingtitle"'))
					throw 'miss';
				var match = content.match('<h2><span class=\\\\"mw-headline\\\\" id=\\\\"' + lang.replace(' ', '_') + '\\\\">' + lang +'<\\/span>.*?<hr \\/>');
				if (!match) {
					match = content.match('<h2><span class=\\\\"mw-headline\\\\" id=\\\\"' + lang.replace(' ', '_') + '\\\\">' + lang +'<\\/span>.*');
				}
				if (!match)
						throw 'miss';
				const matches = match[0].matchAll(/(<h\d>)(<span class=\\"mw-headline\\" id=\\"Pronunciation.*?)\1/g);
				content = '<hr />';
				var i = 0;
				for (const match of matches) {
					i++;
					content += match[0].replace(pr + '</span>', String(i) + '</span>') + '<hr />';
				}
				if (i == 0)
					throw 'miss';
				if (i == 1)
					content = content.replace('1</span>', '</span>');
				content = content.replace(/ class=\\".*?\\"/g, '');
				content = content.replace(/\[.*?\]/g, '');
				content = content.replace(/<style.*?<\/style>/g, '');
				content = content.replace(/\/\//g, 'https://');
				content = content.replace(/\/wiki\//g, 'https://en.wiktionary.org/wiki/');
				content = content.replace(/\\"/g, '"');
				content = content.replace(/\\n/g, '');
				content = content.replace(/\\u/g, '&#x');
				content = content.replace(/preload="none"/g, 'preload="auto"');
				document.getElementById('title').innerHTML = pr + ': ' + selection;
				document.getElementById('text').innerHTML = content;
			}
		}
		catch (err) {
			if (err == 'miss') {
				if (sectry) {
					document.getElementById('title').innerHTML = pr + ': ' + selection;
					document.getElementById('text').innerHTML = 'Wiktionary does not have a pronunciation for "<b>' + selection + '</b>" in <b>' + lang + '</b>';
				}
				else {
					sectry = true;
					xhrsend (selection.toLowerCase());
				}	
			}
			else if (this.readyState == 4) {
				if (this.status != 200) {
					document.getElementById('title').innerHTML = 'Oups';
					document.getElementById('text').innerHTML = '<br />Error while connecting to Wiktionnary.<br />Status code: ' + String(this.status);
				}
				else {
					document.getElementById('title').innerHTML = 'Oupsie';
					document.getElementById('text').innerHTML = '<br />Unkown error.<br />Status code: ' + String(this.status) + '<br />' + err;
				}
		}
	}
};

//Adding a handler when a message is recieved from content scripts
chrome.extension.onMessage.addListener(function (message, sender) {
	if (message.data) {
		selection = message.data;
		document.getElementById('input').value = selection;
		xhrsend (selection);
	}
});

function submit () {
	selection = document.getElementById('input').value;
	xhrsend (selection);
}

document.getElementById("input").addEventListener("keyup", function(event) {
	if (event.keyCode === 13)
		document.getElementById("submit").click();
});

function xhrsend (word) {
	try {
		if (word) {
			document.getElementById('text').innerHTML = '<img width="128" alt="Loading" src="images/loading.gif">'
			page = encodeURI(word.trim());
			url = 'https://en.wiktionary.org/w/api.php?action=parse&prop=text&format=json&page=' + page;
			xhttp.open('GET', url, true);
			xhttp.send();
		}
	}
	catch (err) {
			document.getElementById('title').innerHTML = 'Oupsie';
			document.getElementById('text').innerHTML = '<br />Unkown error :<br />' + err;
	}
}

// Send selection when popup is loaded
document.addEventListener("DOMContentLoaded", function () {
	chrome.tabs.query({
		"active": true,
		"currentWindow": true,
		"status": "complete",
		"windowType": "normal"
	}, function (tabs) {
		for (tab in tabs) {
			//Send Message to the tab
			chrome.tabs.sendMessage(tabs[tab].id, {
				method: "getSelection"
			});
		}
	});
});
