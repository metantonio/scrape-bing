const fs = require('fs');

const { program } = require('commander');
const Initiator = require('./pokeratlas_initiator');
const { setupBrowser, twitterLogin, gotoTwitterDM, sendTwitterDM, getRandBotAccount, getBotAccount, sendTwitterPost } = require('./utils')

program
	.argument('<twitter_account>', 'Customer Support Twitter Account');

program.parse(process.argv);

const options = program.args //from here take the option account from npm run....

const twitterAccount = options[0]



async function MGM(twitterAccount) {
	const mainBotInfo = await getBotAccount()
	//console.log(mainBotInfo)
	const apiUrl = mainBotInfo.api_url; //server with the LLM

	const initialDM = await Initiator(apiUrl, twitterAccount)
	if (initialDM) {
		const responderCallback = (result) => {
			if (result.finished) {
				if (interval) {
					clearInterval(interval)
				}

				console.log("Bot has got you a deal [INSERT NOTIFIER HERE]")

				//process.exit(0)
			}
		}
		console.log("starting poker atlas")
		const timeSeries = 1000 * 60 * mainBotInfo.interval_min;
	}
	console.log("End")
}


MGM(twitterAccount);
