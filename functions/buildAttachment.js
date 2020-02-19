const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const { getFlagLang } = require('./fetch');
const width = 600, height = 840;

const buildAttachment = (data, flags) => new Promise(resolve => {
	if(0 >= data.length) resolve();
	const lang = getFlagLang(flags);
	const maverick = loadImage(path.join(__dirname, `../card_images/cardback/card_mavericks/Maverick.png`));
	const legacy = loadImage(path.join(__dirname, `../card_images/cardback/Legacy.png`));
	const cards = data.map(card => loadImage(path.join(__dirname, `../card_images/${lang}/${card.expansion}/${card.card_number}.png`)));

	Promise.all([maverick, legacy, ...cards]).then(([maverick, legacy, ...cards]) => {
		const finalCards = cards.map((card, index) => new Promise(async resolve1 => {
			const canvasCard = createCanvas(width, height);
			const ctxCard = canvasCard.getContext('2d');
			ctxCard.drawImage(card, 0, 0, width, height);

			if(data[index].is_maverick) {
				ctxCard.drawImage(await loadImage(path.join(__dirname, `../card_images/cardback/card_mavericks/${data[index].house}.png`)), 0, 0);
				ctxCard.drawImage(maverick, 0, 0);
			}
			if(data[index].is_legacy) {
				ctxCard.drawImage(legacy, 500, 735, 100, 100);
			}
			resolve1(canvasCard);
		}));
		Promise.all(finalCards).then(final => {
			const canvas = createCanvas((width * data.length) + (5 * (data.length - 1)), height);
			const ctx = canvas.getContext('2d');
			final.forEach((img, index) => ctx.drawImage(img, width * index + 5 * index, 0, width, height));
			resolve(canvas.toBuffer());
		});
	});
});

exports.buildAttachment = buildAttachment;