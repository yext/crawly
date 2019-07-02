const puppeteer = require("puppeteer");

(async () =>
{
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    let url = "http://jxu.yextdemos.com.yextpages.net";
    console.log(`Fetching page data for : ${url}...`);
    await page.goto(url);
    await page.waitForSelector("[data-ya-track]");
    let arrMainLinks: ElementHandle[] = await page.$$('[data-ya-track] > a');   //get the main links

    console.log(arrMainLinks.length); // 16


    for (let mainLink of arrMainLinks) //foreach main link let's click it
    {
        let hrefValue =await (await mainLink.getProperty('href')).jsonValue();
        console.log("Clicking on " + hrefValue);
        await Promise.all([
                              page.waitForNavigation(),
                              mainLink.click({delay: 100})
                          ]);


        break;

    }

    await browser.close();
})();
