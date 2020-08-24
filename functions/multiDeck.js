const main = require('../index');
const { buildDeckList } = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const { fabric } = require('fabric');
const width = 600, height = 840;

const multiDeck = (message, params, flags) => {
	const lang = getFlagLang(flags);
	if(0 >= params.length) return;
	fetchDeck(params).then(decks => {
		const deckImages = decks.filter(Boolean).map(deck => buildDeckList(deck, lang));
		Promise.all(deckImages).then(deckImages => {
			const canvas = new fabric.StaticCanvas('multiDeck');
			canvas.setDimensions({ width: ((width * decks.length) + (decks.length > 1 && 5 * decks.length)), height });
			const decklists = deckImages.map(img => new Promise(resolve => fabric.Image.fromURL(img.toDataURL(), image => resolve(image))));
			Promise.all(decklists).then(decklists => {
				decklists.forEach((img, index) => {
					img.set({ left: width * index + 5 * index, top: 0 });
					canvas.add(img);
				});
				canvas.renderAll();
				const name = decks.map(deck => deck.name).join(' vs ');
				const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.6 }).replace('data:image/jpeg;base64,', '');
				canvas.dispose();
				main.sendImageMessage(message, name, Buffer.from(dataUrl, 'base64'));
			});
		});
	});
};

exports.multiDeck = multiDeck;
