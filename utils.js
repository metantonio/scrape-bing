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
        //'https://www.mgmresorts.com/en/restaurants.html?filter=property,Bellagio',
        //'https://www.mgmresorts.com/en/restaurants.html?filter=property,Delano_Las_Vegas',
        //'https://www.mgmresorts.com/en/restaurants.html?filter=property,Luxor_Hotel_Casino',
        //'https://www.mgmresorts.com/en/restaurants.html?filter=property,ARIA',
        //'https://www.mgmresorts.com/en/restaurants.html?filter=property,The_Cosmopolitan_of_Las_Vegas',
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
        console.log(`Casino Hotel nummber ${k + 1}/${url.length}`)
        try {
            //console.log("MGMgoIn function");
            await page.goto(url[k]);
            await page.waitForSelector("[class=\"css-1eatf5e\"]", { visible: true, timeout: 5000 });

            const scrape = await page.evaluate(() => {
                const restaurants = [];
                const cards = Array.from(document.querySelectorAll(".css-1eatf5e"));

                for (const card of cards) {
                    const restaurant = {
                        name: '',
                        hotel: '',
                        gastronomy: '',
                        price: '',
                        description: '',
                        phone: '',
                        hours: '',
                        link_detail: '',
                    };

                    const title = card.querySelector("[data-testid=\"discovery-result-card-title\"]");
                    if (title) {
                        restaurant["name"] = title.innerHTML;

                        const detail_a = card.querySelector("[data-testid=\"discovery-result-card-detail-a\"]");
                        if (detail_a) restaurant["hotel"] = detail_a.innerHTML;

                        const detail_b = card.querySelector("[data-testid=\"discovery-result-card-detail-b\"]");
                        if (detail_b) restaurant["gastronomy"] = detail_b.innerText;

                        const detail_c = card.querySelector("[data-testid=\"discovery-result-card-detail-c\"]");
                        if (detail_c) restaurant["price"] = detail_c.innerHTML;

                        const detail_img = card.querySelector("[data-testid=\"discovery-result-card-image\"]");
                        if (detail_img) {
                            try {
                                restaurant["image"] = detail_img.getAttribute("src");
                            } catch (err2) {
                                console.error('Error2 in page.goto:', err2);
                            }
                        }

                        const detail_link = card.querySelector("[data-testid=\"discovery-result-card-image-link\"]");
                        if (detail_link) {
                            try {
                                restaurant["link_detail"] = detail_link.getAttribute("href");
                            } catch (err) {
                                console.error('Error in page.goto:', err);
                            }
                        }

                        restaurants.push(restaurant);
                    }
                }

                return restaurants;
            });

            let contador = 0
            for (const restaurant of scrape) {
                console.log(`subprocess ${contador + 1}/${scrape.length}`)
                if (restaurant["link_detail"] !== '') {
                    console.log("entrando en: ", restaurant["link_detail"]);
                    let viewportHeight = 800;
                    let viewportWidth = 800;
                    var browser = await puppeteer.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

                    let newPage = await browser.newPage();
                    await newPage.setDefaultNavigationTimeout(0);
                    await newPage.setViewport({ width: viewportWidth, height: viewportHeight });
                    try {
                        await newPage.goto(restaurant["link_detail"]);

                        await newPage.waitForSelector("[class=\"OverviewHeaderSection__content\"]", { visible: true, timeout: 5000 });

                        restaurant["description"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"CustomContent CustomContent--variant--large CustomContent--color--default\"]");
                            if (description) return `${description.innerText}`;

                            let description2 = document.querySelector("[class=\"description-text\"]");
                            if (description2) return `${description2.innerText}`;

                            return "";
                        });

                        if (restaurant["description"] === undefined) {
                            restaurant["description"] = "";
                        }

                        const other_details = await newPage.evaluate(() => {
                            let temp_data = {};
                            let descriptions = document.querySelectorAll("[class=\"OverviewSidebarSection__item__label\"]");
                            let detailed = document.querySelectorAll("[class=\"OverviewSidebarSection__item__content\"]");

                            if (descriptions.length > 0) {
                                temp_data["time"] = {};
                                for (let n = 0; n < descriptions.length; n++) {
                                    if (descriptions[n].innerText === "INFORMATION" || descriptions[n].innerText === "RESERVATIONS") {
                                        temp_data["phone"] = detailed[n].innerText;
                                    } else if (descriptions[n].innerText.includes("MON") || descriptions[n].innerText.includes("TUE") || descriptions[n].innerText.includes("WED") || descriptions[n].innerText.includes("THU") || descriptions[n].innerText.includes("FRI") || descriptions[n].innerText.includes("SUN")) {
                                        temp_data["time"][descriptions[n].innerText] = detailed[n].innerText;
                                    } else {
                                        temp_data[descriptions[n].innerText] = detailed[n].innerText;
                                    }
                                }

                                return temp_data;
                            }
                            return {};
                        });

                        scrape[contador] = { ...restaurant, ...other_details };
                        await newPage.close();
                    } catch (err4) {
                        await browser.close();
                    }
                    await browser.close();
                }
                contador = contador + 1;
            }

            //console.log('scrape: ', scrape);
            const dataJSON = JSON.stringify(scrape, null, 2);

            fs.writeFile(`${ruta}/${scrape[0]["hotel"]}.json`, dataJSON, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log('Archivo JSON creado exitosamente:', ruta);
                }
            });

        } catch (err) {
            console.error('Error in page.goto:', err);
        }
    }


}

async function tracks(page, config) {
    const ruta = './raw_tracks';
    const url = [
        'https://www.twinspires.com/edge/racing/tracks/'
    ]
    for (let k = 0; k < url.length; k++) {
        console.log(`Track Base ${k + 1}/${url.length}`)
        try {
            //console.log("MGMgoIn function");
            await page.goto(url[k]);
            await page.waitForSelector("[class=\"content-columns columns-3\"]", { visible: true, timeout: 5000 });

            const scrape = await page.evaluate(() => {
                const restaurants = [];
                const cards = Array.from(document.querySelectorAll("li"));

                for (const card of cards) {
                    const restaurant = {
                        link_detail: '',
                        Title: '',
                        Address: '',
                        img: ''
                    };

                    const title = card.querySelector("a");
                    if (title) {
                        const detail_link = card.querySelector("a");
                        if (detail_link) {
                            try {
                                restaurant["link_detail"] = detail_link.getAttribute("href");
                            } catch (err) {
                                console.error('Error in page.goto:', err);
                            }
                        }

                        restaurants.push(restaurant);
                    }
                }

                return restaurants;
            });

            let contador = 0
            console.log(scrape)
            for (const restaurant of scrape) {
                console.log(`subprocess ${contador + 1}/${scrape.length}`)
                if (restaurant["link_detail"] !== '') {
                    //console.log("entrando en: ", restaurant["link_detail"]);
                    let viewportHeight = 800;
                    let viewportWidth = 800;
                    var browser = await puppeteer.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

                    let newPage = await browser.newPage();
                    await newPage.setDefaultNavigationTimeout(0);
                    await newPage.setViewport({ width: viewportWidth, height: viewportHeight });
                    try {
                        await newPage.goto(restaurant["link_detail"]);

                        await newPage.waitForSelector("[class=\"dynamic-content-container\"]", { visible: true, timeout: 5000 });

                        restaurant["Title"] = await newPage.evaluate(() => {
                            let description = document.querySelector("h1");
                            console.log("Title: ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (restaurant["Title"] === undefined) {
                            restaurant["Title"] = "";
                        }

                        restaurant["Address"] = await newPage.evaluate(() => {
                            let description = document.querySelector(".content-columns.columns-2");
                            if (description) {
                                console.log("encontró content-column columns-2")
                                let nivel2 = description.querySelector(".content-text")
                                if (nivel2) {
                                    let paragraph = nivel2.querySelector("p")
                                    console.log("found paragraph")
                                    console.log("paragraph: ", paragraph.textContent)
                                    return `${paragraph.textContent}`
                                }

                            };

                            return "";
                        });

                        if (restaurant["Address"] === undefined) {
                            restaurant["Address"] = "";
                        }

                        restaurant["img"] = await newPage.evaluate(() => {
                            let description = document.querySelector(".content-columns.columns-2");
                            if (description) {
                                console.log("encontró content-column columns-2")
                                let nivel2 = description.querySelector(".content-text")
                                if (nivel2) {
                                    let imgLink = nivel2.querySelector("img")
                                    console.log("found img")
                                    console.log("img: ", imgLink.getAttribute("src"))
                                    return `${imgLink.getAttribute("src")}`
                                }

                            };

                            return "";
                        });

                        if (restaurant["img"] === undefined) {
                            restaurant["img"] = "";
                        }

                        /* const other_details = await newPage.evaluate(() => {
                            let temp_data = {};
                            let descriptions = document.querySelectorAll("[class=\"OverviewSidebarSection__item__label\"]");
                            let detailed = document.querySelectorAll("[class=\"OverviewSidebarSection__item__content\"]");

                            if (descriptions.length > 0) {
                                temp_data["time"] = {};
                                for (let n = 0; n < descriptions.length; n++) {
                                    if (descriptions[n].innerText === "INFORMATION" || descriptions[n].innerText === "RESERVATIONS") {
                                        temp_data["phone"] = detailed[n].innerText;
                                    } else if (descriptions[n].innerText.includes("MON") || descriptions[n].innerText.includes("TUE") || descriptions[n].innerText.includes("WED") || descriptions[n].innerText.includes("THU") || descriptions[n].innerText.includes("FRI") || descriptions[n].innerText.includes("SUN")) {
                                        temp_data["time"][descriptions[n].innerText] = detailed[n].innerText;
                                    } else {
                                        temp_data[descriptions[n].innerText] = detailed[n].innerText;
                                    }
                                }

                                return temp_data;
                            }
                            return {};
                        }); */

                        scrape[contador] = { ...restaurant, ...other_details };
                        await newPage.close();
                    } catch (err4) {
                        await browser.close();
                    }
                    await browser.close();
                }
                contador = contador + 1;
            }

            //console.log('scrape: ', scrape);
            const dataJSON = JSON.stringify(scrape, null, 2);

            fs.writeFile(`${ruta}/Tracks.json`, dataJSON, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log('Archivo JSON creado exitosamente:', ruta);
                }
            });

        } catch (err) {
            console.error('Error in page.goto:', err);
        }
    }


}

async function pokeratlasInfo(page, config) {
    const ruta = './raw_poker_events';
    const url = [
        'https://www.pokeratlas.com/poker-tournament-series',
        'https://www.pokeratlas.com/poker-tournament-series?page=2'

    ]
    for (let k = 0; k < url.length; k++) {
        console.log(`Poker event ${k + 1}/${url.length}`)
        try {
            //console.log("MGMgoIn function");
            await page.goto(url[k]);
            await page.waitForSelector("[class=\"modal-close\"]")
            const dmButton = await page.$("[class=\"modal-close\"]")
            await dmButton.click();
            await page.waitForSelector("[class=\" cds-itemu series-list-item\"]", { visible: true, timeout: 5000 });

            const scrape = await page.evaluate(() => {
                const restaurants = [];
                const cards = Array.from(document.querySelectorAll(".series-list-item"));

                for (const card of cards) {
                    let restaurant = {
                        name: '',
                        place: '',
                        date: '',
                        count: '',
                        location: '',
                        phone: '',
                        hours: '',
                        link_detail: '',
                        events: []
                    };

                    const title = card.querySelector("[class=\"series-meta\"]");
                    if (title) {
                        const detail_0 = card.querySelector(".title");
                        restaurant["name"] = detail_0.innerHTML.trim();

                        const detail_a = card.querySelector(".venue");
                        if (detail_a) restaurant["place"] = detail_a.innerHTML.trim();

                        const detail_b = card.querySelector(".date");
                        if (detail_b) restaurant["date"] = detail_b.innerText;

                        const detail_c = card.querySelector(".count");
                        if (detail_c) restaurant["count"] = detail_c.innerHTML;

                        const detail_1 = card.querySelector(".location");
                        if (detail_1) restaurant["location"] = detail_1.innerHTML.trim();

                        const detail_img = card.querySelector("img");
                        if (detail_img) {
                            try {
                                restaurant["image"] = detail_img.getAttribute("src");
                            } catch (err2) {
                                console.error('Error2 in page.goto:', err2);
                            }
                        }

                        const detail_link = card.querySelector("a");
                        if (detail_link) {
                            try {
                                restaurant["link_detail"] = detail_link.getAttribute("href");
                            } catch (err) {
                                console.error('Error in page.goto:', err);
                            }
                        }

                        restaurants.push(restaurant);
                    }
                }

                return restaurants;
            });

            let contador = 0
            for (const restaurant of scrape) {
                console.log(`subprocess ${contador + 1}/${scrape.length}`)
                if (restaurant["link_detail"] !== '') {
                    console.log("entrando en: ", restaurant["link_detail"]);
                    let viewportHeight = 800;
                    let viewportWidth = 800;
                    let browser2 = await puppeteer.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

                    let newPage = await browser2.newPage();
                    await newPage.setDefaultNavigationTimeout(0);
                    await newPage.setViewport({ width: viewportWidth, height: viewportHeight });
                    try {
                        await newPage.goto("https://www.pokeratlas.com" + restaurant["link_detail"]);
                        let dmButton2 = await page.$("[class=\"modal-close\"]")
                        await dmButton2.click();

                        await newPage.waitForSelector(".tournaments-list", { visible: true, timeout: 5000 });
                        /* let tempData = {
                            event_name: "",
                            event_number: "",
                            buy_in: "",
                            type: "",
                            structure: ""
                        }; */
                        /* tempData["event_name"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"detail name\"]");
                            //console.log("event_name: ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (tempData["event_name"] === undefined) {
                            tempData["event_name"] = "";
                        }

                        tempData["event_number"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"detail event-number\"]");
                            //console.log("event_number: ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (tempData["event_number"] === undefined) {
                            tempData["event_number"] = "";
                        }

                        tempData["buy_in"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"buy_in\"]");
                            //console.log("buy_in: ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (tempData["buy_in"] === undefined) {
                            tempData["buy_in"] = "";
                        }

                        tempData["type"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"type\"]");
                            //console.log("type: ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (tempData["type"] === undefined) {
                            tempData["type"] = "";
                        }

                        tempData["structure"] = await newPage.evaluate(() => {
                            let description = document.querySelector("[class=\"structure-info\"]");
                            //console.log("structure ", description.innerText);
                            if (description) return `${description.innerText}`;
                            return "";
                        });

                        if (tempData["structure"] === undefined) {
                            tempData["structure"] = "";
                        }
 */
                        //restaurant["events"].push(tempData)

                        const other_details = await newPage.evaluate(async () => {
                            let listEvents = []
                            let tempData = {
                                event_name: "",
                                event_number: "",
                                buy_in: "",
                                type: "",
                                structure: ""
                            };
                            let descriptions = Array.from(document.querySelectorAll(".panel-stripe"));
                            console.log("array: ", descriptions)
                            //let detailed = document.querySelectorAll("[class=\"OverviewSidebarSection__item__content\"]");

                            /* tempData["event_name"] = await newPage.evaluate(() => {
                                let description = document.querySelector("[class=\"detail name\"]");
                                console.log("event_name: ", description.innerText);
                                if (description) return `${description.innerText}`;
                                return "";
                            });

                            if (tempData["event_name"] === undefined) {
                                tempData["event_name"] = "";
                            }

                            tempData["event_number"] = await newPage.evaluate(() => {
                                let description = document.querySelector("[class=\"detail event-number\"]");
                                console.log("event_number: ", description.innerText);
                                if (description) return `${description.innerText}`;
                                return "";
                            });

                            if (tempData["event_number"] === undefined) {
                                tempData["event_number"] = "";
                            }
 */
                            if (descriptions.length > 0) {
                                for (let n = 0; n < descriptions.length; n++) {
                                    tempData = {
                                        event_name: "",
                                        event_number: "",
                                        buy_in: "",
                                        type: "",
                                        structure: ""
                                    }
                                    tempData["event_name"] = descriptions[n].querySelector("[class=\"detail name\"]") ? descriptions[n].querySelector("[class=\"detail name\"]").innerText : "";
                                    tempData["event_number"] = descriptions[n].querySelector("[class=\"detail event-number\"]") ? descriptions[n].querySelector("[class=\"detail event-number\"]").innerText : "";
                                    tempData["buy_in"] = descriptions[n].querySelector("[class=\"buy_in\"]") ? descriptions[n].querySelector("[class=\"buy_in\"]").innerText : "";
                                    tempData["type"] = descriptions[n].querySelector("[class=\"type\"]") ? descriptions[n].querySelector("[class=\"type\"]").innerText : "";
                                    tempData["structure"] = descriptions[n].querySelector("[class=\"structure-info\"]") ? descriptions[n].querySelector("[class=\"structure-info\"]").innerText : "";
                                    tempData["date"] = descriptions[n].querySelector("[class=\"date\"]") ? descriptions[n].querySelector("[class=\"month\"]").innerText + "/" + descriptions[n].querySelector("[class=\"day\"]").innerText+" - "+  descriptions[n].querySelector("[class=\"hour\"]").innerText : "";

                                    listEvents.push(tempData)
                                }
                                console.log(tempData)
                                //return tempData;
                            }
                            return listEvents;
                        });

                        scrape[contador] = { ...restaurant, events: other_details };
                        await newPage.close();
                    } catch (err4) {
                        console.log("error: ", err4)
                        await browser2.close();
                    }
                    await browser2.close();
                }
                contador = contador + 1;
            }

            //console.log('scrape: ', scrape);
            let dataJSON = JSON.stringify(scrape, null, 2);
            console.log("file name: ", `page${k + 1}.json`)
            fs.writeFile(`${ruta}/page${k + 1}.json`, dataJSON, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log('Archivo JSON creado exitosamente:', ruta);
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
    mgmgoin,
    tracks,
    pokeratlasInfo
}
