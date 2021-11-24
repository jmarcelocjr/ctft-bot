(() => {
    const eat = async callback => {
        if (location.pathname != '/inventory') {
            return callback('Enter in Inventory Page');
        }

        const quantityFoodPerFish = {
            'Common': 1,
            'Uncommon': 2,
            'Rare': 3,
            'Super Rare': 4,
            'Epic': 5,
            'Legendary': 6
        };

        const foods = [
            {
                id: 1025,
                name: 'pumpkin',
                quantity: $('.mealq1025').text().replace(/\D/g, '')
            },
            {
                id: 1003,
                name: 'bread',
                quantity: $('.mealq1003').text().replace(/\D/g, '')
            },
            {
                id: 1002,
                name: 'apple',
                quantity: $('.mealq1002').text().replace(/\D/g, '')
            },
            {
                id: 1004,
                name: 'seaweed',
                quantity: $('.mealq1004').text().replace(/\D/g, '')
            }
        ].filter(f => f.quantity);

        let noFoods = false;

        const food = () => {
            const rarity = $('#fishdata table tr:nth-child(3) td').text();
            const index = foods.findIndex(f => f.quantity >= quantityFoodPerFish[rarity]);

            noFoods = index == -1;

            return [index, quantityFoodPerFish[rarity]];
        };

        const hunger = (id) => {
            let hunger = $(`.${id}`).find('div.card-body').find('span').first().attr('data-bs-original-title').split(' ').pop().split('/');
            hunger = hunger[0] / hunger[1];
            return hunger >= 0.5 ? 0 : hunger > 0 ? 1 : 2;
        };

        const fishes = $('.feedfish').toArray().sort((a, b) => {
            const aId = $(a).attr('id');
            const aLevel = $(`div.${aId}`).find(`.exp${aId}`).text().match(/\S\s(?<level>\d)/).groups.level;;

            const bId = $(b).attr('id');
            const bLevel = $(`div.${bId}`).find(`.exp${bId}`).text().match(/\S\s(?<level>\d)/).groups.level;

            return aLevel - bLevel;
        });

        for (fish of fishes) {
            const id = $(fish).attr('id');

            const currentHunger = hunger(id);

            if (currentHunger == 0) {
                callback(`Fish ${id} not hunger`);
                continue;
            }

            callback(`Fish ${id} will eat ${currentHunger} times`);

            for (i = 0; i < currentHunger; i++) {
                getFishData(id, 0, '', '');

                await new Promise(r => setTimeout(r, 2000));

                const [index, total] = food();

                if (noFoods) {
                    callback("Food is over");
                    break;
                }

                foods[index].quantity -= total;

                callback(`Feeding ${id} with ${foods[index].name}, using a total of ${total}`);

                getFishData(id, 1, foods[index].id, '');

                await new Promise(r => setTimeout(r, 2500));
            }
        }

        callback('Finished');

        const el = document.querySelector('script[src$="eat.js"]');

        if (el) {
            return setTimeout(function () {
                el.remove();
            }, 300);
        }
    };

    window.addEventListener('message', function (event) {
        if (event.data.type == 'eat') {
            return eat(function (message) {
                window.postMessage({
                    type: 'comunicate',
                    data: message
                });
            })
        }
    });
})();