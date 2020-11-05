var lang = 'English';
chrome.storage.sync.get({
		language: 'English',
	}, function(items) {
		lang = items.language;
	});

const pr = 'Pronunciation'; // in case support for other Wiktionary languages will be added in the futur...
var selection;
var title;
var sectry = false;

var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		try {
			if (this.readyState == 4 && this.status == 200) {
				var obj = JSON.parse(this.responseText);
				if (obj.error)
					throw 'miss';
				var content = obj.parse.text['*'];
				//console.log(content);
				var match = new RegExp('<h2><span class="mw-headline" id="' + lang.replace(' ', '_') + '">' + lang +'<\/span>.*?<hr \/>', 'gms').exec(content);
				if (!match)
					match = new RegExp('<h2><span class="mw-headline" id="' + lang.replace(' ', '_') + '">' + lang +'<\/span>.*', 'gms').exec(content);
				if (!match)
					throw 'miss';
				const matches = match[0].matchAll(/(<h\d>)(<span class="mw-headline" id="Pronunciation.*?)\1/gms);
				content = '<hr />';
				var i = 0;
				for (const match of matches) {
					i++;
					content += match[0].replace(pr + '</span>', String(i) + '</span>') + '<hr />';
				}
				if (i == 0)
					throw 'miss';
				sectry = false;
				if (i == 1)
					content = content.replace('1</span>', '</span>');
				content = content.replace(/<span class="mw-editsection-bracket">\[.*?\]<\/span>/gms, '');
				content = content.replace(/ class=".*?"/gms, '');
				content = content.replace(/<style.*?<\/style>/gms, '');
				content = content.replace(/src="\/\//gm, 'src="https://');
				content = content.replace(/href="\/wiki\//gm, 'href="https://en.wiktionary.org/wiki/');
				content = content.replace(/preload="none"/gm, 'preload="auto"');
				content = content.replace(/<a /gm, '<a  target="_blank" ');
				content += '<br /><a href="https://en.wiktionary.org/wiki/' + title + '#' + lang + '" target="_blank">See in Wiktionary</a>';
				document.getElementById('title').innerHTML = pr + ': ' + title;
				document.getElementById('text').innerHTML = content;
			}
		}
		catch (err) {
			if (err == 'miss') {
				if (sectry) {
					document.getElementById('title').innerHTML = pr + ': ' + selection;
					document.getElementById('text').innerHTML = 'Wiktionary does not have a pronunciation for "<b>' + selection + '</b>" in <b>' + lang + '</b><br /><br /><a href="https://en.wiktionary.org/wiki/' + selection + '" target="_blank">Search in Wiktionary</a>';
				}
				else {
					sectry = true;
					title = title.toLowerCase();
					xhrsend ();
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
		title = selection;
		document.getElementById('input').value = selection;
		xhrsend ();
	}
});

function submit () {
	selection = document.getElementById('input').value;
	title = selection;
	xhrsend ();
}

document.getElementById("submit").onclick = submit;

document.getElementById("input").addEventListener("keyup", function(event) {
	if (event.keyCode === 13)
		document.getElementById("submit").click();
});

function xhrsend () {
	try {
		if (title) {
			document.getElementById('text').innerHTML = '<img width="128" alt="Loading" src="images/loading.gif">'
			url = 'https://en.wiktionary.org/w/api.php?action=parse&prop=text&format=json&page=' + encodeURI(title.trim());
			xhttp.open('GET', url, true);
			xhttp.send();
		}
	}
	catch (err) {
			document.getElementById('title').innerHTML = 'Oupsie';
			document.getElementById('text').innerHTML = '<br />Unkown error :<br />' + err;
	}
}

// Close when a link is opened in new tab
window.addEventListener('click',function(e){
  if(e.target.target == "_blank" || e.target.parentNode.target == "_blank") {
    self.close();
  }
})

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
