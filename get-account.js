(function () {
    setTimeout(async function () {
        while (true) {
            if (!accountMeta) {
                await new Promise(r => setTimeout(r, 500));
                continue;
            }

            window.postMessage({
                type: 'getAccountFromPage',
                value: accountMeta.toLowerCase()
            });

            setTimeout(function () {
                document.querySelector('script[src$="get-account.js"]').remove();
            }, 300);

            break;
        }
    }, 1000);
})();