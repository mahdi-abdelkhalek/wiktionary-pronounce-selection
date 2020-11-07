var languages;
// Save options to chrome.storage
function save_options() {
	if (languages.length) {
		chrome.storage.sync.set({
			languages: languages,
		}, function() {
			document.getElementById('status').textContent = 'Options saved.';
			setTimeout(function() {
				status.textContent = '';
			}, 1000);
		});
	}
	else
		document.getElementById('status').textContent = 'You must specify at least 1 language';
}

function add() {
	var l = document.getElementById('language').value;
	if (languages.indexOf(l) < 0) {
		languages.push(l);
		load_options();
	}
}

function remove(e) {
	languages.splice(languages.indexOf(e.target.parentNode.parentNode.id), 1);
	load_options();
}

function up(e) {
	var l = e.target.parentNode.parentNode.id;
	var i = languages.indexOf(l);
	if (i > 0) {
		languages[i] = languages[i-1];
		languages[i-1] = l;
		load_options();
	}
}

function down(e) {
	var l = e.target.parentNode.parentNode.id;
	var i = languages.indexOf(l);
	if (i < languages.length-1) {
		languages[i] = languages[i+1];
		languages[i+1] = l;
		load_options();
	}
}

// Restore the preferences stored in chrome.storage.
function restore_options() {
	// Set default value for languages
	chrome.storage.sync.get({
		languages: ['English','French','German'],
	}, function(items) {
		languages = items.languages;
		load_options();
	});
}

// Reflect languages in document
function load_options() {
	const btns = '<td><button name="up">&#x25B2;</button></td><td><button name="down">&#x25BC;</button></td><td><button name="remove">&#8213;</button></td>';
	document.getElementById('table').innerHTML = '';
	for (i = 0; i < languages.length; i++)
		document.getElementById('table').innerHTML += '<tr id="' + languages[i] + '"><td>' + languages[i] + '</td>' + btns + '</tr>';
	var ups = document.getElementsByName('up');
	var downs = document.getElementsByName('down');
	var rems = document.getElementsByName('remove');
	for (i = 0; i < languages.length; i++) {
		ups[i].addEventListener('click', up);
		downs[i].addEventListener('click', down);
		rems[i].addEventListener('click', remove);
	}	
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('add').addEventListener('click', add);

