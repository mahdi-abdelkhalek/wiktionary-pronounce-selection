// Save options to chrome.storage
function save_options() {
var language = document.getElementById('language').value;
	chrome.storage.sync.set({
		language: language,
	}, function() {
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 1000);
	});
}

// Restore the preferences stored in chrome.storage.
function restore_options() {
	// Use default value language = 'English'
	chrome.storage.sync.get({
		language: 'English',
	}, function(items) {
		document.getElementById('language').value = items.language;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
