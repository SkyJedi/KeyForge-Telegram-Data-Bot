const main = require('../index');
const { fetchCard, fetchReprints, getSet, getCardLink } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');

const cards = async (ctx, params, flags) => {
        //fetch cards data
        const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
        if (0 >= cards.length) return;
        const attachment = await buildAttachment(cards, flags);
        let text = cards.map(card => {
            const reprints = fetchReprints(card, flags);
            const title = `**${card.card_title}**`;
            const value = `[${reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`)
                                      .join(' • ')}](${getCardLink(card)})`;
            return title + ' • ' + value;
        }).join('\n');
        main.sendImageMessage(ctx, text, attachment.createJPEGStream());
        attachment.dispose();
    }
;

exports.cards = cards;
