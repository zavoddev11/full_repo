import puppeteer from 'puppeteer'
import fs from 'fs'
import asyncLib from 'async'
import Sitedata from '../models/sitedata.js'
import Website from '../models/website.js';
import { querySimilarDocuments, saveWebsiteData } from './vector/ai_session.js';
import { getSitedataByWebsiteId } from '../services/sitedata.js';

async function removeAllTags(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, ""); // Removes all opening & closing tags
}

async function getInternalLinks(homepage) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
        await page.goto(homepage, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const links = await page.evaluate((home) => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href.trim())
                .filter(href => href.startsWith(home) && !href.includes('#'))  // Ensure it starts with home and excludes #
                .filter((href, index, self) => self.indexOf(href) === index); // Remove duplicates
        }, homepage);

        await browser.close();
        return links;
    } catch (error) {
        console.error(`Error fetching links from ${homepage}:`, error.message);
        await browser.close();
        return [];
    }
}

async function scrapeFullPage(url) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                metaDescription: document.querySelector('meta[name="description"]')?.content || '',
                paragraphs: Array.from(document.querySelectorAll('p')).map(el => el.innerText.trim().slice(0, 500)),
                links: Array.from(document.querySelectorAll('a')).map(el => ({
                    text: el.innerText.trim(),
                    href: el.href
                })).slice(0, 20),
            };
        });
        await browser.close();
        return pageContent;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        await browser.close();
        return null;
    }
}

async function scrapeMultipleSites(urls, website_id) {
    const batchSize = 4;
    const results = [];

    const batches = [];
    for (let i = 0; i < urls.length; i += batchSize) {
        batches.push(urls.slice(i, i + batchSize)); // Create batches of 4
    }

    console.log(`Total ${batches.length} batches to process...`);

    let batchIndex = 0;

    await asyncLib.eachSeries(batches, async (batch) => {
        batchIndex++; // Increment manually
        console.log(`\nProcessing batch ${batchIndex}/${batches.length}: ${batch.length} URLs`);

        const batchResults = [];

        await Promise.all(batch.map(async (url, index) => {
            console.log(`  - Scraping ${index + 1}/${batch.length}: ${url}`);
            const pageData = await scrapeFullPage(url);
            if (pageData) {
                batchResults.push(pageData);
                console.log(`  ✅ Successfully scraped: ${url}`);
            } else {
                console.log(`  ❌ Failed to scrape: ${url}`);
            }
        }));

        // After processing the batch, save it to the database
        console.log({ batchResults })
        if (batchResults.length > 0) {
            try {
                const sitedata = new Sitedata({
                    website_id: `${website_id}`,  // You can change the ID logic as needed
                    sitedata: batchResults
                })
                await sitedata.save();
                console.log(`Batch ${batchIndex} saved to MongoDB!`);
            } catch (error) {
                console.log(`Error saving batch ${batchIndex}:`, error);
            }
        }
        console.log(`Batch ${batchIndex} completed.`);
    });

    try {
        await Website.findByIdAndUpdate(website_id, { status: "active" });
        console.log(`Website ${website_id} status updated to active ✅`);
    } catch (error) {
        await Website.findByIdAndUpdate(website_id, { status: "interrupted" });
        console.error(`Error updating website ${website_id} status:`, error);
    }

    let fetchWebsiteData = await Sitedata.find({ website_id })
    console.log("\n✅ All batches completed!");

    console.log({ results })

    await saveWebsiteData(website_id, JSON.stringify(fetchWebsiteData))

    return results;
}


export const scrapeWebsite = async function (homepage, website_id) {
    console.log(`Fetching internal links from: ${homepage}`);
    let internalLinks = await getInternalLinks(homepage);
    if (internalLinks.length === 0) {
        console.log("No internal links found. Exiting...");
        return [];
    } else {
        internalLinks = [...new Set(internalLinks)];
        // internalLinks = internalLinks.slice(0, 3)
    }
    console.log(`Found ${internalLinks.length} internal links. Scraping now...`);
    const scrapedData = await scrapeMultipleSites(internalLinks, website_id);
    console.log("Scraping completed!");
    // fs.writeFileSync('data.json', JSON.stringify(scrapedData, null, 2), 'utf-8');
    console.log("Data saved to data.json ✅");
    return scrapedData;
}

// Start scraping & save results
