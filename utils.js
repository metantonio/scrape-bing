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
                console.log(await msgArgs[i].jsonValue());
            } catch (e) {
                console.log(e);
            }
        }
    });

    return [browser, page]
}

async function twitterLogin(page, config) {
    try {
        await page.goto('https://www.bing.com/maps/?cp=26.051884%7E-80.20943&lvl=17.4')
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
                for(let j =0; j< name.length; j++){
                    console.log("\nRestaurant: ",name[j].innerHTML)
                    for(let k =0; k< info.length; k++){            
                        console.log("Info:",info[k].innerText)
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

async function loadCookies(page) {
    const cookiesString = fs.readFileSync('./cookies.json');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
}

async function gotoTwitterDM(page) {
    try {
        await page.waitForSelector("[data-testid=\"sendDMFromProfile\"]")
        const dmButton = await page.$("[data-testid=\"sendDMFromProfile\"]")
        await dmButton.click();
        await timeout(1000);
        await page.waitForSelector('[data-testid="dmComposerTextInput"]')
    } catch (error) {
        console.log(error)
    }

}

async function sendTwitterDM(page, message) {
    try {
        const messageInput = await page.$("[data-testid=\"dmComposerTextInput\"]")
        await messageInput.click()
        await timeout(2000)
        await page.keyboard.type(message, { delay: 100 });
        await page.keyboard.press('Enter');
        await timeout(2000)
    } catch (error) {
        console.log(error)
    }

}

async function getRandBotAccount() {
    const config = JSON.parse(fs.readFileSync('./config.json'))
    return config.company_accounts[Math.floor(Math.random() * config.company_accounts.length)]
}

async function getBotAccount() {
    const config = JSON.parse(fs.readFileSync('./config.json'))
    return config
}

async function sendTwitterPost(page, message) {
    try {
        //const messageInput = await page.$("[class=\"DraftEditor-editorContainer\"]")
        //console.log("messageInput:",messageInput)

        //await messageInput.click()
        await timeout(2000)
        await page.keyboard.type(message, { delay: 100 });
        //await page.keyboard.press('Enter');
        const tweetButton = await page.$("[data-testid=\"tweetButton\"]")
        await timeout(1000)
        await tweetButton.click()
        await timeout(2000)
    } catch (error) {
        console.log(error)
    }

}

function limitarLongitud(texto, longitudMaxima = 280) {
    // Reemplazar los caracteres de nueva línea por espacios en blanco
    const textoSinNuevaLinea = texto.replace(/\n/g, ' ');

    // Limitar la longitud total del texto
    const textoLimitado = textoSinNuevaLinea.slice(0, longitudMaxima);

    return textoLimitado;
}


module.exports = {
    setupBrowser,
    twitterLogin,
    timeout,
    gotoTwitterDM,
    sendTwitterDM,
    getRandBotAccount,
    getBotAccount,
    sendTwitterPost,
    limitarLongitud
}