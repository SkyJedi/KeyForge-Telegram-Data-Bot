const main = require('../index');
const { fetchFAQ } = require('./fetch');
const { rules } = require('../card_data');

const faq = (msg, params) => {
	const data = fetchFAQ(params.join(' '));
	if(data) {
		let text = `FAQ results for "${params.join(' ')}"\n`;
		text += `**${data.question}**\n\n${format(data.answer)}`;
		text += `\n\n[Data pulled from Official rules v${rules.version} ${rules.date}](${rules.url}`;
		main.sendMessage(msg, text);
	}
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, '**$1:**');

exports.faq = faq;