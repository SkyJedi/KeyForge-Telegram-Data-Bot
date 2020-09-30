const main = require('../index');
const { fetchDeck, getFlagNumber } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');
const { shuffle, sortBy } = require('lodash');

const randomHand = async (ctx, params, flags) => {
    const decks = await fetchDeck([params.join(' ')]);
    const number = getFlagNumber(flags, 6);
    const deck = decks[0];
    if (deck) {
        //grab 6 random cards
        const randomCards = sortBy(shuffle(deck.cards).slice(0, Math.min(number ? number : 6, 8)), [
            'house',
            'card_number']);

        //build Title
        const text = '**Random hand from ' + deck.name + '**';
        const attachment = await buildAttachment(randomCards, flags);
        main.sendImageMessage(ctx, text, attachment.createJPEGStream());
        attachment.dispose();
    }

};

exports.randomHand = randomHand;
