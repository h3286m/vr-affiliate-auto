
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
    const url = 'https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=savr00976/';
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Cookie': 'age_check_done=1'
            }
        });
        const $ = cheerio.load(response.data);
        const desc = $('.mg-p15.clear').text().trim();
        console.log('Description found:', desc);
    } catch (error) {
        console.error('Error scraping:', error.message);
    }
}

testScrape();
