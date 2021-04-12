const { Telegraf } = require('telegraf')
const config = require('./config');
const knownCommands = require('./functions/');
const { version } = require('./package');
const { dropWhile, get } = require('lodash');

const bot = new Telegraf(config.token);

// bot.use(async (ctx, next) => {
// 	const start = new Date();
// 	await next();
// 	const ms = new Date() - start;
// 	console.log('Response time: %sms', ms);
// });

bot.on('text', ctx => {
	let params = ctx.message.text.toLowerCase().split(' '),
		commandName = params.map(a => a.startsWith('/') && a).filter(Boolean).join().slice(1),
		flags = params.filter(a => a.startsWith('-')).map(flag => flag.slice(1)),
		types = {
			brackets: /\[(.*?)]/,
			d: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
			deck: /{(.*?)}/,
		};

	if(commandName) {
		params = dropWhile(params, a => !a.includes('/')).slice(1).filter(a => !a.startsWith('-'));
	} else {
		Object.keys(types).forEach(a => {
			let message = ctx.message.text.toLowerCase(), arr = [];
			do {
				let param = message.match(types[a]);
				if(param) {
					arr.push(get(param, '1', param[0]));
					message = message.replace(get(param, '0'), '');
				}
			} while (message.match(types[a]));
			if(arr.length > 0) {
				commandName = a;
				params = arr;
			}
			if((commandName === 'd' || commandName === 'deck') && params.length > 1) {
				commandName = 'multiDeck';
				params = params.slice(0, 3);
			}
		});
	}

	if(!commandName) return;
	switch (commandName) {
		case 'c':
		case 'card':
		case 'cards':
			commandName = 'cards';
			params = [params.join(' ')];
			break;
		case 'brackets':
			commandName = 'cards';
			break;
		case 'd':
		case 'deck':
		case 'decks':
			commandName = 'deck';
			params = [params.join(' ')];
			break;
		case 'f':
			commandName = 'faq';
			break;
		case 'r':
			commandName = 'rule';
			break;
		case 'v':
		case 'ver':
			commandName = 'version';
			break;
		case 'rh':
		case 'randomhand':
			commandName = 'randomHand';
			break;
		case 'rc':
		case 'randomcard':
			commandName = 'randomCard';
			break;
		case 'randomdeck':
			commandName = 'randomDeck';
			break;
		case 'time':
		case 'timing':
		case 'chart':
		case 'timingchart':
			commandName = 'timingChart';
			break;
		default:
			break;
	}

	if(commandName in knownCommands) {
		console.log(`User: ${ctx.message.from.first_name}. Command: ${commandName}. Params: ${params} Flags: ${flags}. ${new Date()}`);
		knownCommands[commandName](ctx, params, flags);
	}
}).catch(error => console.error('Command Error: ' + error));

bot.telegram.getMe().then(bot_information => {
	console.log(`${bot_information.username} online.`);
	console.log(`Version: ${version}`);
});

bot.launch().catch(error => console.error('Command Error: ' + error));

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

const sendImageMessage = async (ctx, message, image) => {
	ctx.replyWithPhoto({source: image}, {caption: message, parse_mode: 'Markdown', disable_web_page_preview: true});
}
const sendMessage = (ctx, message) => ctx.replyWithMarkdown(message, {disable_web_page_preview: true});

exports.sendImageMessage = sendImageMessage;
exports.sendMessage = sendMessage;
