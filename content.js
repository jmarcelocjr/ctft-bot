var ACCOUNT_META = '';
var INJECT_URL = 'get-account.js';

function inject(script, callback = null) {
    var src = chrome.extension.getURL(script);
    var existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
        return callback();
    }

    var el = document.createElement('script');

    el.src = src;
    el.type = 'text/javascript';
    el.async = true;

    document.body.appendChild(el);

    if (callback) {
        el.onload = callback;       
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == 'getAccount') {
        sendResponse(ACCOUNT_META);
    }

    if (['eat', 'play'].includes(message.type)) {
        inject(message.value, function () {
            window.postMessage(message);
        });
    }

    return true;
});

inject(INJECT_URL, null, true);

window.addEventListener('message', function(event) {
    if (event.data.type == 'comunicate') {
        return chrome.runtime.sendMessage(event.data)
    }

    if (event.data.type == 'getAccountFromPage') {
        return chrome.runtime.sendMessage({
            type: 'getAccountFromPage',
            data: ACCOUNT_META = event.data.value
        });
    }
});
