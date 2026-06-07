const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const app = express();

app.get('/scrape', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('الرجاء إدخال رابط');

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });
        
        const videoData = await page.evaluate(() => {
            const video = document.querySelector('video source') || document.querySelector('video');
            const iframe = document.querySelector('iframe');
            
            return {
                mp4_url: video ? video.src : null,
                iframe_url: iframe ? iframe.src : null
            };
        });
        
        await browser.close();
        res.json({ success: true, media: videoData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
