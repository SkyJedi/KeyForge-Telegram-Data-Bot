const main = require('../index');
const { toUpper } = require('lodash');
const timing = require('../card_data/timing');
const { format } = require('./fetch');
const { rules } = require('../card_data');

const timingChart = (msg, params) => {
	const step = params.length > 0 && timing.find(x => params.every(y => x.phase.toLowerCase().includes(y.toLowerCase())));
	let text = '';
	if(step) text += `**${toUpper(step.phase)}**\n\n${format(step.steps)}`;
	else {
		text += '**TIMING CHART**';
		text += '\n1) FORGE A KEY';
		text += '\n2) CHOOSE A HOUSE';
		text += '\n3) PLAY, DISCARD, OR USE CARDS';
		text += '\n4) READY CARDS';
		text += '\n5) DRAW CARDs';
	}
	text += `\n\n[Data pulled from Official rules v${rules.version} ${rules.date}](${rules.url}`;
	main.sendMessage(msg, text);
};

exports.timingChart = timingChart;





