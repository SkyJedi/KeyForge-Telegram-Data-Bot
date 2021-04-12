const {fabric} = require('fabric');
const QRCode = require('qrcode');
const path = require('path');
const card_titles = require('../card_data/card_titles');
const houses_languages = require('../card_data/houses_languages');
const {sets} = require('../card_data/index');
const {get} = require('lodash');
const shadowProps = {color: 'gray', offsetX: 10, offsetY: 10, blur: 3};
const fontProps = {
    fontWeight: 800,
    fontFamily: 'Keyforge',
    textAlign: 'left',
    fill: 'black',
    fontSize: 20
};

fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Oswald-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/ZCOOL-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Kanit-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Oswald-Bold.ttf'), {
    family: 'Keyforge',
    weight: 'bold',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Kanit-Bold.ttf'), {
    family: 'Keyforge',
    weight: 'bold',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/BlackHanSans-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});

const buildDeckList = ({houses, cards, expansion, ...deck}, lang = 'en') => {
    return new Promise(async res => {
        const canvas = new fabric.StaticCanvas('decklist');
        canvas.setDimensions({width: 600, height: 840});
        const Common = loadImage('../card_images/cardback/rarity/Common.png');
        const Rare = loadImage('../card_images/cardback/rarity/Rare.png');
        const Special = loadImage('../card_images/cardback/rarity/Special.png');
        const Uncommon = loadImage('../card_images/cardback/rarity/Uncommon.png');
        const Action = loadImage('../card_images/cardback/action.png');
        const Artifact = loadImage('../card_images/cardback/artifact.png');
        const Upgrade = loadImage('../card_images/cardback/upgrade.png');
        const Creature = loadImage('../card_images/cardback/creature.png');
        const Evil_Twin = loadImage('../card_images/cardback/evil-twin.png');
        const cardBack = loadImage('../card_images/cardback/decklist.png');
        const set = loadImage(`../card_images/cardback/${sets.find(x => x.set_number === expansion)
            .flag
            .toLowerCase()}.png`);
        const crest = loadImage('../card_images/cardback/crest.png');

        const houseData = {
            size: 35,
            0: {x: 55, y: 132},
            1: {x: 55, y: 510},
            2: {x: 310, y: 227}
        };
        const cardData = {
            size: 20,
            start: {x: 58, y: 173}
        };
        const lineStyle = { fill: 'black', stroke: 'black', strokeWidth: 2 };
        const qrCode = new Promise(qrRes => {
            QRCode.toCanvas(fabric.util.createCanvasElement(),
                `https://www.keyforgegame.com/deck-details/${deck.id}`,
                { margin: 3 }, (err, qr) => qrRes(new fabric.Image(qr)));
        });

        const title = getCircularText(deck.name, 1700, 75);
        Promise.all([cardBack, Common, Uncommon, Rare, Special, set, title, crest, qrCode, Action, Artifact, Creature, Evil_Twin, Upgrade])
            .then(([cardBack, Common, Uncommon, Rare, Special, set, title, crest, qrCode, Action, Artifact, Creature, Evil_Twin, Upgrade]) => {
                const line1 = new fabric.Line([55, 165, 295, 165], lineStyle);
                const line2 = new fabric.Line([55, 543, 295, 543], lineStyle);
                const line3 = new fabric.Line([310, 260, 550, 260], lineStyle);
                const text = new fabric.Text('DECK LIST', {...fontProps, fontWeight: 200});
                const Rarities = {Common, Uncommon, Rare, Special};
                const CardTypes = {Action, Artifact, Creature, Evil_Twin, Upgrade}
                cardBack.scaleToWidth(600);
                text.set({left: 255, top: 100});
                qrCode.set({left: 331, top: 614}).scaleToWidth(150);
                set.set({left: 232, top: 98}).scaleToWidth(20);
                crest.set({left: 504, top: 749}).scaleToWidth(50);
                title.set({left: 0});
                canvas.add(cardBack, line1, line2, line3, qrCode, set, title, text, crest);

                const houseProm = houses.sort().map((house, index) => {
                    return new Promise(houseRes => {
                        loadImage(`../card_images/cardback/decklist_houses/${house}.png`).then(img => {
                            img.set({
                                left: houseData[index].x,
                                top: houseData[index].y,
                                shadow: new fabric.Shadow(shadowProps)
                            })
                                .scaleToWidth(30)
                                .scaleToHeight(30);

                            const houseText = new fabric.Text(houses_languages[lang][house], {
                                fontWeight: lang === 'ko' ? 100 : 800,
                                fontFamily: 'Keyforge',
                                textAlign: 'left',
                                fillStyle: 'black',
                                fontSize: 25
                            }).set({left: houseData[index].x + 35, top: houseData[index].y + 5});
                            canvas.add(houseText, img);
                            houseRes();
                        });
                    });
                });

                const cardProm = cards.map((card, index) => {
                    return new Promise(async cardRes => {
                        let x = cardData.start.x,
                            y = cardData.start.y + (index * 28);
                        const name = get(card_titles, `[${card.expansion}][${card.card_number}][${lang}]`, card.card_title);
                        if (index > 11) {
                            y = y + 45;
                        }

                        if (index > 20) {
                            x = x + 249;
                            y = cardData.start.y + ((index - 22.1) * 28);
                        }

                        if (index > 23) {
                            y = y + 44;
                        }

                        const rarity = new fabric.Image(Rarities[card.rarity === 'FIXED' || card.rarity ===
                        'Variant' ? 'Special' : card.rarity].getElement())
                            .set({left: x, top: y, shadow: new fabric.Shadow(shadowProps)})
                            .scaleToWidth(cardData.size);

                        const number = new fabric.Text(card.card_number,
                            {...fontProps, fill: card.is_enhanced ? '#0081ad' : 'black'}
                        )
                            .scaleToWidth(30)
                            .set({
                                left: x + rarity.getScaledWidth() + 2,
                                top: y
                            });

                        const typeIcon = new fabric.Image(CardTypes[card.card_type.replace(/\d+/g, '')].getElement());
                        typeIcon.scaleToWidth(cardData.size)
                            .set({
                                left: x + rarity.getScaledWidth() + number.getScaledWidth() + 2,
                                top: y,
                                shadow: new fabric.Shadow({...shadowProps, offsetX: 1, offsetY: 1, blur: 1})
                            })
                        ;

                        const title = new fabric.Text(name, {
                            ...fontProps,
                            fontWeight: 300,
                            fill: card.is_enhanced ? '#0081ad' : 'black'
                        }).set({
                            left:
                                x +
                                rarity.getScaledWidth() +
                                number.getScaledWidth() +
                                typeIcon.getScaledWidth() +
                                2,
                            top: y
                        });

                        canvas.add(number, rarity, title, typeIcon);

                        let iconX =
                            rarity.getScaledWidth() +
                            number.getScaledWidth() +
                            typeIcon.getScaledWidth() +
                            title.getScaledWidth() +
                            2;

                        if (card.is_maverick) {
                            const maverick = await loadImage('../card_images/cardback/Maverick.png');
                            const maverickImage = new fabric.Image(maverick.getElement())
                                .set({left: iconX, top: y, shadow: new fabric.Shadow(shadowProps)})
                                .scaleToHeight(cardData.size);
                            canvas.add(maverickImage);
                            iconX = iconX + maverickImage.getScaledWidth();
                        }

                        if (card.is_legacy) {
                            const legacy = await loadImage('../card_images/cardback/Legacy.png');
                            const legacyImage = new fabric.Image(legacy.getElement())
                                .set({left: iconX, top: y, shadow: new fabric.Shadow(shadowProps)})
                                .scaleToHeight(cardData.size);
                            canvas.add(legacyImage);
                        }

                        if (card.is_anomaly) {
                            const anomaly = await loadImage('../card_images/cardback/Anomaly.png');
                            const anomalyImage = new fabric.Image(anomaly.getElement())
                                .set({left: iconX, top: y, shadow: new fabric.Shadow(shadowProps)})
                                .scaleToHeight(cardData.size);
                            canvas.add(anomalyImage);
                        }

                        if (card.enhancements) {
                            for (const enhancement of card.enhancements) {
                                const enhancementImg = await loadImage(`../card_images/cardback/enhancements/${enhancement}.png`);
                                const enhancementElement = new fabric.Image(enhancementImg.getElement())
                                    .set({left: iconX, top: y, shadow: new fabric.Shadow(shadowProps)})
                                    .scaleToHeight(cardData.size);
                                canvas.add(enhancementElement);
                                iconX = iconX + enhancementElement.getScaledWidth();
                            }
                        }

                        cardRes();
                    });
                });

                Promise.all([...houseProm, ...cardProm]).then(() => {
                    canvas.renderAll();
                    res(canvas);
                });
            });
    });
};

const getCurvedFontSize = (length) => {
    if (length < 30) return 42;
    return 35 / (length / 35);
};

const loadImage = (imgPath) => new Promise(resolve => fabric.Image.fromURL(`file://${path.join(__dirname, imgPath)}`, resolve));

const getCircularText = (text = '', diameter, yOffset = 0) => {
    const canvas = fabric.util.createCanvasElement();

    let ctx = canvas.getContext('2d');
    let textHeight = 40, startAngle = 0;

    canvas.width = 600;
    canvas.height = 800;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    ctx.shadowColor = 'rgb(32,32,32)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.font = `${getCurvedFontSize(text.length)}px Keyforge`;

    text = text.split('').reverse().join('');

    ctx.translate(300, Math.max((diameter + yOffset) / 2, 400 + yOffset)); // Move to center
    ctx.textBaseline = 'middle'; // Ensure we draw in exact center
    ctx.textAlign = 'center'; // Ensure we draw in exact center

    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width;
        startAngle += (charWid) / (diameter / 2 - textHeight) / 2;
    }

    ctx.rotate(startAngle);

    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width; // half letter
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
        ctx.fillText(text[j], 0, (0 - diameter / 2 + textHeight / 2));
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1); // rotate half letter
    }

    return new fabric.Image(canvas, {left: 0, top: 0});
};

exports.buildDeckList = buildDeckList;
