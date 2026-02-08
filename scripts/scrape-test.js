
const axios = require('axios');
const cheerio = require('cheerio'); // If available, otherwise I'll use regex

async function scrape() {
    const cid = 'savr00976';
    const url = `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/`;

    try {
        const res = await axios.get(url, {
            headers: {
                'Cookie': 'ckcy=1; age_check_done=1;',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = res.data;

        // Try to find description
        let description = '';
        const descMatch = html.match(/<div class="mg-b20 lh4">([\s\S]*?)<\/div>/);
        if (descMatch) {
            description = descMatch[1].replace(/<br.*?>/g, '\n').replace(/<.*?>/g, '').trim();
        }

        // Try to find reviews
        const reviews = [];
        const reviewMatches = html.match(/<p class="mg-b10">([\s\S]*?)<\/p>/g);
        if (reviewMatches) {
            reviewMatches.forEach(m => {
                const text = m.replace(/<.*?>/g, '').trim();
                if (text.length > 20 && !text.includes('作品紹介')) {
                    reviews.push(text);
                }
            });
        }

        console.log('--- Scraped Data ---');
        console.log('CID:', cid);
        console.log('Description Header:', description.substring(0, 100));
        console.log('Review Count Found:', reviews.length);
        if (reviews.length > 0) {
            console.log('First Review Sample:', reviews[0].substring(0, 100));
        }

    } catch (e) {
        console.error('Scrape Error:', e.message);
    }
}

scrape();
