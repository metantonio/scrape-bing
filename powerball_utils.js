const puppeteer = require('puppeteer-extra');
const fs = require('fs');

function timeout(miliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve() }, miliseconds)
    })
}

async function setupBrowser() {
    const viewportHeight = 800;
    const viewportWidth = 1080;
    const browser = await puppeteer.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: viewportWidth, height: viewportHeight });

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            try {
                console.log("open page: ", await msgArgs[i].jsonValue());
            } catch (e) {
                console.log(e);
            }
        }
    });

    return [browser, page]
}

async function twitterLogin(page, config) {
    try {
        await page.goto('https://www.bing.com/maps/?cp=36.111468%7E-115.175598&lvl=17.4')
        await timeout(1000)
        await page.waitForSelector("[data-listtype=\"Restaurant\"]", { visible: true })
        await page.focus("[data-listtype=\"Restaurant\"]")
        //console.log(page)
        let scrape = await page.evaluate(() => {
            //let cards = document.querySelectorAll(".b_recCardData")
            let cards = Array.from(document.querySelectorAll("[data-listtype=\"Restaurant\"]"))

            //console.log(cards, cards.length)
            let slides = Array.from(cards[0].querySelectorAll(".slide"))
            console.log(slides.innerText, slides.length)
            let list = []
            for (let i = slides.length - 1; i >= 0; i--) {
                let restaurant = slides[i];
                let name = restaurant.querySelectorAll("h2")
                let info = restaurant.querySelectorAll(".b_recCardData")
                for (let j = 0; j < name.length; j++) {
                    console.log("\nRestaurant: ", name[j].innerHTML)
                    for (let k = 0; k < info.length; k++) {
                        console.log("Info:", info[k].innerText)
                    }
                }


                /* let h2Split = restaurant.innerHTML.split("h2>")
                console.log(h2Split[0]) */
                //console.log("Restaurant: ", name.innerHTML/* , " - info: ", info.innerText */);


                /* console.log(message.getAttribute('role'))
                if (message.getAttribute('role') === "button") {
                    break;
                }
    
                list.unshift(message.innerText) */
            }
            return list
        })

        //const cookies = await page.cookies();
        //fs.writeFileSync('./raw/cookies.json', JSON.stringify(cookies, null, 2));
        //console.log("Logged in and saved cookies");
    } catch (err) {
        console.log(err)
    }

}

async function powerballInfo(page, config) {
    const ruta = './raw_powerball';
    const url = [
        'https://www.powerball.com/previous-results?gc=powerball'
    ]
    for (let k = 0; k < url.length; k++) {
        console.log(`Powerball page ${k + 1}/${url.length}`)
        try {
            //console.log("MGMgoIn function");
            await page.goto(url[k]);
            /* await page.waitForSelector("[class=\"onetrust-pc-btn-handler\"]")
            const dmButton2 = await page.$("[class=\"onetrust-pc-btn-handler\"]")
            await dmButton2.click();
            await page.waitForSelector("[class=\"onetrust-accept-btn-handler\"]")
            const dmButton = await page.$("[class=\"onetrust-accept-btn-handler\"]")
            await dmButton.click(); */
            await page.waitForSelector("[id=\"searchNumbersResults\"]", { visible: true, timeout: 5000 });

            const scrape = await page.evaluate(() => {
                const powerballs = [];
                const cards = Array.from(document.querySelectorAll(".card"));

                for (const card of cards) {
                    let powerball = {
                        power_play: '',
                        //place: '',
                        date: '',
                        //count: '',
                        //location: '',
                        //phone: '',
                        //hours: '',
                        //link_detail: '',
                        numbers: []
                    };

                    let title = card.querySelector("[class=\"card-body ps-3 pe-4 pe-lg-5\"]");
                    if (title) {
                        const detail_0 = card.querySelector(".multiplier");
                        powerball["power_play"] = detail_0.innerHTML.trim();

                        const detail_b = card.querySelector(".card-title");
                        if (detail_b) powerball["date"] = detail_b.innerText;

                        let power_numbers = card.querySelectorAll("[class=\"form-control col white-balls item-powerball\"]");
                        //console.log(JSON.stringify(Array.from(card.querySelectorAll(".form-control col white-balls item-powerball"))), JSON.stringify(card.querySelectorAll(".form-control col white-balls item-powerball")))
                        if (power_numbers.length > 0) {
                            //console.log("obtained powerballs: ", power_numbers)
                            for (let added_number of power_numbers) {
                                powerball.numbers.push({ number: added_number.innerText })
                            }
                        }

                        const powerball_number = card.querySelector("[class=\"form-control col powerball item-powerball\"]");
                        if (powerball_number) powerball.numbers.push({ powerball: powerball_number.innerText });

                        /* const detail_img = card.querySelector("img");
                        if (detail_img) {
                            try {
                                powerball["image"] = detail_img.getAttribute("src");
                            } catch (err2) {
                                console.error('Error2 in page.goto:', err2);
                            }
                        } */

                        /* const detail_link = card.querySelector("a");
                        if (detail_link) {
                            try {
                                powerball["link_detail"] = detail_link.getAttribute("href");
                            } catch (err) {
                                console.error('Error in page.goto:', err);
                            }
                        } */

                        powerballs.push(powerball);
                    }
                }

                return powerballs;
            });

            let contador = 0

            let dataJSON = JSON.stringify(scrape, null, 2);
            console.log("file name: ", `page${k + 1}.json`)
            fs.writeFile(`${ruta}/powerball${k + 1}.json`, dataJSON, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log('Archivo JSON creado exitosamente:', ruta);
                    return
                }
            });
        } catch (err) {
            console.error('Error in page.goto:', err);
        }
    }


}

async function loadCookies(page) {
    const cookiesString = fs.readFileSync('./cookies.json');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
}



async function getRandBotAccount() {
    const config = JSON.parse(fs.readFileSync('./config.json'))
    return config.company_accounts[Math.floor(Math.random() * config.company_accounts.length)]
}

async function getBotAccount() {
    const config = JSON.parse(fs.readFileSync('./config.json'))
    return config
}

module.exports = {
    setupBrowser,
    twitterLogin,
    getRandBotAccount,
    getBotAccount,
    powerballInfo
}
