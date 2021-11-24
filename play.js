(() => {
    const play = async callback => {
        if (location.pathname != '/play') {
            return callback('Enter in Play Page');
        }

        const need = $('.playbtng[data-bs-toggle]').attr('data-bs-original-title');

        if (/need/.test(need)) {
            return callback('Empty Rods');
        }

        $('#datapanel').on('shown.bs.modal', async () => {
            const fishing = $('#1008').closest('.cardr2').find('.list-group-item.list-item-rework').text().split('[').pop().replace(/\D/g, '');
            const stick = $('#1009').closest('.cardr2').find('.list-group-item.list-item-rework').text().split('[').pop().replace(/\D/g, '');
            const charcoal = $('#1010').closest('.cardr2').find('.list-group-item.list-item-rework').text().split('[').pop().replace(/\D/g, '');
            const net = $('#1040').closest('.cardr2').find('.list-group-item.list-item-rework').text().split('[').pop().replace(/\D/g, '');

            const rods = [
                {
                    id: 1008,
                    name: 'Fishing Rod',
                    quantity: fishing
                },
                {
                    id: 1009,
                    name: 'Stick with Thread',
                    quantity: stick
                },
                {
                    id: 1010,
                    name: 'Charcoal stick',
                    quantity: charcoal
                },
                {
                    id: 1040,
                    name: 'Fishing net',
                    quantity: net
                }
            ].filter(r => r.quantity);

            for (let rod of rods) {
                for (let i = 0; i < rod.quantity; i++) {
                    callback(`Fishing with ${rod.name}`);

                    await request(rod.id, 5, '');

                    await new Promise(r => setTimeout(r, 1500));

                    const response = await request(0, 6, '');
                    const rewards = await getRewards(response);

                    callback(`Won ${rewards.join(', ')}`);

                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            callback('Finished');

            $('#datapanel').modal('hide');
        });

        getFishData(0, 4, '', '');

        const el = document.querySelector('script[src$="play.js"]');

        if (el) {
            return setTimeout(function () {
                el.remove();
            }, 300);
        }
    };

    const request = async (id, type, food) => {
        const data = new FormData();

        data.append('key', connectionLock);
        data.append('skey', secretKey);
        data.append('account', accountMeta);

        data.append('fishid', id);
        data.append('type', type);

        data.append('extradata', typeof food != 'undefined' && food.length > 0 ? food : '');
        data.append('extradata2', '');
        data.append('perform', elvlbattery);

        return fetch('/pages/posts/getFishData.php', {
            method: 'POST',
            body: data
        });
    };

    const getRewards = async response => {
        const html = await response.text();
        const rewards = $(html).find('.list-group-item').map((i, el) => {
            return $(el).text();
        }).toArray();

        const corals = $(html).find('u').text();

        if (corals == '') {
            return rewards;
        }

        rewards.push(`Corals ${corals}`);

        return rewards;
    };

    window.addEventListener('message', function (event) {
        if (event.data.type == 'play') {
            return play(function (message) {
                window.postMessage({
                    type: 'comunicate',
                    data: message
                });
            })
        }
    });
})();