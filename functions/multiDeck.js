const main = require('../index');
const { buildDeckList } = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const { fabric } = require('fabric');
const width = 600, height = 840;

const multiDeck = async (message, params, flags) => {
    const lang = getFlagLang(flags);
    if (0 >= params.length) return;
    const canvas = new fabric.StaticCanvas('multiDeck');
    const decks = (await fetchDeck(params)).filter(Boolean);
    canvas.setDimensions({ width: ((width * decks.length) + (decks.length > 1 && 5 * decks.length)), height });
    for(const [index, deck] of decks.entries()) {
        const image = await buildDeckList(deck, lang)
        const img = new fabric.Image(image.getElement());
        img.set({ left: width * index + 5 * index, top: 0 });
        canvas.add(img);
    }
    canvas.renderAll();
    const name = decks.map(deck => deck.name).join(' vs ');
    const stream = canvas.createJPEGStream()
    stream.on('end', () => canvas.dispose());
    main.sendImageMessage(message, name, stream);
    canvas.dispose();
}

exports.multiDeck = multiDeck;
