const fs = require('fs');
const puppeteer = require("puppeteer");

const { setupBrowser, tracks, gotoTwitterDM, sendTwitterDM, getRandBotAccount, getBotAccount, sendTwitterPost, limitarLongitud, timeout } = require('./utils')

async function Initiator(apiUrl, twitterAccount) {
	const account = getRandBotAccount()
	const [browser, page] = await setupBrowser()
	try{
		await tracks(page, account)
	}catch(err){
		await browser.close()
		return
	}	

	const mainBotInfo = await getBotAccount()
	const mainBotAccount = mainBotInfo.bot_accounts[0].username || "nothing"
	//console.log("mainBotAccount: ", mainBotAccount)


	

}

module.exports = Initiator
