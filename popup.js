const KEY = '@AUTO_EAT_AND_PLAY_CTFT';
const COINTOFISH_URL = 'cointofish.io';
const VALIDATE_URL = 'https://us-east1-blockchain-332817.cloudfunctions.net/ctft-validate';
const SCRIPT_URL = 'cointofish.js';

let TAB_ID = null;
let ACCOUNT_META = null;

const validate = async (key) => {
    const response = await fetch(VALIDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
    });
    
    const content = await response.json();

    return content.data.wallet.toLowerCase() == ACCOUNT_META;
}

const invalid = (erase = true) => {
    $('.btn-eat, .btn-play').remove();
    $('.btn-settings').addClass('hidden');
    $('.btn-save-key, #key').removeClass('hidden');

    if (!erase) {
        return;
    }

    $('.message').html('Invalid KEY<br>Please contact Administrator');
    $('.container').removeClass('info loading').addClass('error');

    return localStorage.removeItem(KEY);
};

const error = (error) => {
    $('.message').html(error);
    $('.container').removeClass('info loading').addClass('error');
};

const comunicate = (message) => {
    setTimeout(function () {
        $('.message').html(message);
        $('.container').removeClass('error loading').addClass('info');
    }, 300);
};

const listeners = () => {
    $('.btn-eat, .btn-play').removeClass('disabled');

    $('.btn-eat').off('click').on('click', async () => {
        const key = localStorage.getItem(KEY);

        if (key.replace(/\s+/g, '') == '') {
            return;
        }

        const valid = await validate(key);

        if (!valid) {
            return invalid();
        }

        return chrome.tabs.sendMessage(TAB_ID, {
            type: 'eat',
            value: 'eat.js'
        });
    });

    $('.btn-play').off('click').on('click', async () => {
        const key = localStorage.getItem(KEY);

        if (key.replace(/\s+/g, '') == '') {
            return;
        }

        const valid = await validate(key);

        if (!valid) {
            return invalid();
        }

        return chrome.tabs.sendMessage(TAB_ID, {
            type: 'play',
            value: 'play.js'
        });
    });

    $('.btn-settings').off('click').on('click', () => invalid(false));
};

const init = () => {
    $('.btn-save-key, #key').addClass('hidden');
    $('.btn-settings').removeClass('hidden');

    $('.container').append('<button class="btn btn-success btn-eat disabled">Eat</button>');
    $('.container').append('<button class="btn btn-primary btn-play disabled">Play</button>');

    return listeners();
}

const prepare = () => {
    $('.container').removeClass('loading');

    const key = localStorage.getItem(KEY) ?? '';

    if (key.replace(/\s+/g, '') != '') {
        return init();
    }

    $('.btn-save-key').on('click', async () => {
        const key = $('#key').val().replace(/\s+/g, '');
    
        if (key.replace(/\s+/g, '') == '') {
            return;
        }
    
        const valid = await validate(key);
    
        if (!valid) {
            return invalid();
        }
    
        localStorage.setItem(KEY, key);
    
        return init();
    });
};

document.addEventListener('DOMContentLoaded', function() {
    if (!chrome.tabs) {
        return;
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type == 'getAccountFromPage') {
            if (!message.data) {
                return;
            }

            if (ACCOUNT_META) {
                return;
            }

            ACCOUNT_META = message.data

            return prepare();
        }

        if (message.type == 'comunicate') {
            return comunicate(message.data);
        }        
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if(!tabs[0].url.includes(COINTOFISH_URL)) {
            return error('Extension only works<br>in Cointofish Page');
        }

        TAB_ID = tabs[0].id;

        chrome.tabs.sendMessage(TAB_ID, { type: 'getAccount' }, function (response) {
            if (!response) {
                //Mostrar mensagem para logar no metamask antes
                return;
            }

            if (ACCOUNT_META) {
                return;
            }

            ACCOUNT_META = response;

            return prepare();
        });
    });
}, false);