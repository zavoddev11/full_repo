const { DOMParser } = require('xmldom');
// const fetch = require('node-fetch');



async function fetchSitemap(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch sitemap");

        let text = await response.text();
        text = text.trim().replace(/^.*?</s, "<");

        const xmlDoc = new DOMParser().parseFromString(text, "application/xml");

        console.log({ xmlDoc });
        console.log("Raw Response:", text);

        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
            console.error("XML Parsing Error:", parseError.textContent);
            return [];
        }

        // Extract URLs from <loc> tags
        const urls = [...xmlDoc.getElementsByTagName("loc")].map(loc => loc.textContent);
        console.log("Extracted URLs:", urls);

        // Fetch titles for each URL
        const urlsWithTitles = await Promise.all(urls.map(async (pageUrl) => {
            const title = await fetchPageTitle(pageUrl);
            return { url: pageUrl, title };
        }));

        console.log("URLs with Titles:", urlsWithTitles);
        return urlsWithTitles;
    } catch (error) {
        console.error("Error fetching sitemap:", error);
        return [];
    }
}


fetchSitemap("https://arsenelectric.com/sitemap.xml");
