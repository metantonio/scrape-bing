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

async function mgmgoin(page, config) {
    const ruta = './raw_restaurants';
    const url = [
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Bellagio',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Delano_Las_Vegas',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Luxor_Hotel_Casino',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,ARIA',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,The_Cosmopolitan_of_Las_Vegas',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Excalibur_Hotel_Casino',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Mandalay_Bay',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,MGM_Grand_Las_Vegas',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,NoMad_Las_Vegas',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,The_Signature_at_MGM_Grand',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,New_York_New_York_Hotel_Casino',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Park_MGM',
        'https://www.mgmresorts.com/en/restaurants.html?filter=property,Vdara_Hotel_Spa_at_ARIA'
    ]
    for (let k = 0; k < url.length; k++) {
        try {
            console.log("MGMgoIn function")
            await page.goto(url[k])
            await timeout(1000)
            await page.waitForSelector("[class=\"css-1eatf5e\"]", { visible: true })
            //await page.focus("[class=\"css-1eatf5e\"]")
            //console.log(page)


            let scrape = await page.evaluate(() => {
                let restaurants = []
                console.log("evaluation")
                //let cards = document.querySelectorAll(".b_recCardData")
                let cards = Array.from(document.querySelectorAll(".css-1eatf5e"))
                console.log("length cards: ", cards.length)
                for (let i = 0; i < cards.length; i++) {
                    let restaurant = { name: '', hotel: '', gastronomy: '', price: '' }

                    let title = cards[i].querySelector("[data-testid=\"discovery-result-card-title\"]")
                    if (title) {
                        restaurant["name"] = title.innerHTML
                        let detail_a = cards[i].querySelector("[data-testid=\"discovery-result-card-detail-a\"]")
                        if (detail_a) {
                            restaurant["hotel"] = detail_a.innerHTML
                        }
                        let detail_b = cards[i].querySelector("[data-testid=\"discovery-result-card-detail-b\"]")
                        if (detail_b) {
                            restaurant["gastronomy"] = detail_b.innerText
                        }
                        let detail_c = cards[i].querySelector("[data-testid=\"discovery-result-card-detail-c\"]")
                        if (detail_c) {
                            restaurant["price"] = detail_c.innerHTML
                        }
                        restaurants.push(restaurant)
                        //console.log("restaurant:", restaurant)
                    }


                }
                //console.log(restaurants)
                return restaurants;
            })
            console.log('scrape: ', scrape)
            const dataJSON = JSON.stringify(scrape, null, 2);
            // Escribe el archivo JSON en el sistema de archivos
            fs.writeFile(`${ruta}/${scrape[0]["hotel"]}.json`, dataJSON, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log('Archivo JSON creado exitosamente:', ruta);
                }
            });


            //return scrape
            //const cookies = await page.cookies();
            //fs.writeFileSync('./raw/cookies.json', JSON.stringify(cookies, null, 2));
            //console.log("Logged in and saved cookies");
        } catch (err) {
            console.log(err)
        }
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
    limitarLongitud,
    mgmgoin
}