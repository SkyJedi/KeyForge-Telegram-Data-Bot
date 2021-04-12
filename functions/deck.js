const main = require('../index');
const { buildDeckList } = require('./buildDeckList');
const { fetchDeck, fetchDoK, getFlagLang } = require('./fetch');
const { sets } = require('../card_data');
const { get } = require('lodash');

const deck = (ctx, params, flags) => {
    if (0 >= params.length) return;
    fetchDeck(params)
        .then(deck => buildDeck(ctx, deck[0], flags))
        .catch(() => main.sendMessage(ctx, `Deck - ${params.join(' ')}: not found!`));
};

const buildDeck = (ctx, deck, flags) => {
    const lang = getFlagLang(flags);
    const dokStats = fetchDoK(deck.id);
    const attachment = buildDeckList(deck, lang);

    Promise.all([dokStats, attachment]).then(([dokStats, attachment]) => {
        const cardStats = getCardStats(deck.cards);
        const mavericks = cardStats.is_maverick > 0 ? `${cardStats.is_maverick} Maverick` : false;
        const anomaly = cardStats.is_anomaly > 0 ? `${cardStats.is_anomaly} Anomaly}` : false;
        const legacy = deck.set_era_cards.Legacy.length > 0 ? `${deck.set_era_cards.Legacy.length} Legacy` : false;
        const set = get(sets.filter(set => deck.expansion === set.set_number), '[0].flag', 'ERROR');
        let description = deck._links.houses.map(house => house).join(' • ');
        description += deck.wins === 0 && deck.losses ===
                       0 ? '\n' : ` • ${deck.power_level} Power • ${deck.chains} Chains} • ${deck.wins}W/${deck.losses}L\n`;
        description += Object.keys(cardStats.card_type)
                             .map(type => `${cardStats.card_type[type]} ${type}s`)
                             .join(' • ') + '\n';
        description += `${cardStats.amber} Æmber • `;
        description += ['Special', 'Rare', 'Uncommon', 'Common'].map(
            type => cardStats.rarity[type] ? `${cardStats.rarity[type]} ${type}` : false).filter(Boolean).join(' • ');
        description += ([mavericks, legacy, anomaly].some(type => type) ? ' • ' : '') +
            [mavericks, legacy, anomaly].filter(type => type).join(' • ') + '\n';
        description += `${dokStats.sas}  •  ${dokStats.sasStar}\n`;
        description += `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixTelegram) • [AA](https://archonarcana.com/Deck:${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixTelegram)`;
        const stream = attachment.createJPEGStream();
        stream.on('end', () => attachment.dispose());
        main.sendImageMessage(ctx, `${deck.name} • ${set} • ${description}`, stream);
    }).catch(console.error);
};

const getCardStats = (cards) => {
    return {
        amber: cards.reduce((acc, card) => acc + card.amber, 0),
        card_type: cards.reduce((acc, card) => ({ ...acc, [card.card_type.replace(/\d+/g, '')]: acc[card.card_type.replace(/\d+/g, '')] + 1 }),
            { Action: 0, Artifact: 0, Creature: 0, Upgrade: 0 }
        ),
        rarity: cards.reduce((acc, card) =>
            ({
                ...acc,
                [rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1 : 1
            }), {}),
        is_maverick: cards.filter(card => card.is_maverick).length,
        is_anomaly: cards.filter(card => card.is_anomaly).length
    };
};

const rarityFix = rarity => rarity === 'FIXED' || rarity === 'Variant' ? 'Special' : rarity;

exports.deck = deck;
exports.buildDeck = buildDeck;
