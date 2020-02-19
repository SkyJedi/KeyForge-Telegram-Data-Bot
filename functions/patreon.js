const main = require('../index');

const patreon = (msg) => {
	main.sendMessage(msg, `**SkyJedi's Patreon**
Click [here](https://www.patreon.com/SkyJedi) find out how you can support this and other projects!`)};

exports.patreon = patreon;