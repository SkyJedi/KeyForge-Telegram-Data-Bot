const main = require('../index');
const errataText = require('../card_data/errata');
const { format } = require('./fetch');
const { rules } = require('../card_data');

const errata = (msg) => {
	let text = '*Card Errata*\n\n';
	Object.keys(errataText).map(card => {
		text += `*${card}*\n\t\t\t${format(errataText[card])}\n`;
		text += '\n';
	});
	text += `\n\n[Data pulled from Official rules v${rules.version} ${rules.date}](${rules.url}`;
	main.sendMessage(msg, text);
};

exports.errata = errata;