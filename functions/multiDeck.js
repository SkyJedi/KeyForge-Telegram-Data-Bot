const main = require('../index');
const { buildDeckList } = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const { createCanvas } = require('canvas');
const width = 600, height = 840;

const multiDeck = (message, params, flags) => {
	const lang = getFlagLang(flags);
	if(0 >= params.length) return;
	fetchDeck(params).then(decks => {
		const deckImages = decks.filter(Boolean).map(deck => buildDeckList(deck, lang));
		Promise.all(deckImages).then(deckImages => {
			const canvas = createCanvas((width * decks.length) + (5 * (decks.length - 1)), height);
			const ctx = canvas.getContext('2d');
			deckImages.forEach((img, index) => {
				ctx.drawImage(img, width * index + 5 * index, 0, width, height);
			});
			const name = decks.map(deck => deck.name).join(' vs ');
			main.sendImageMessage(message, name, canvas.toBuffer());
		});
	});
};

exports.multiDeck = multiDeck;