const fs = require('fs');
const puppeteer = require("puppeteer");

const { setupBrowser, twitterLogin, gotoTwitterDM, sendTwitterDM, getRandBotAccount, getBotAccount, sendTwitterPost, limitarLongitud, timeout } = require('./utils')

async function Initiator(apiUrl, twitterAccount) {
	const account = getRandBotAccount()
	const [browser, page] = await setupBrowser()
	try{
		await twitterLogin(page, account)
	}catch(err){
		await browser.close()
		return
	}
	

	const mainBotInfo = await getBotAccount()
	const mainBotAccount = mainBotInfo.bot_accounts[0].username
	console.log("mainBotAccount: ", mainBotAccount)

	//await page.goto(`https://twitter.com/${mainBotAccount}`);

	if (mainBotInfo.send_dm) {
		console.log("send_dm = True")
		await page.goto(`https://twitter.com/${twitterAccount}`);
		await page.waitForSelector("[data-testid=\"UserName\"]")

		const companyName = await page.evaluate(() => {
			return document.querySelector("[data-testid=\"UserName\"] [dir='ltr']").innerText
		});


		// return customerIssue
		await browser.close()
		return initialDM
	}else{
		console.log("send_dm = False")
	}

}

module.exports = Initiator