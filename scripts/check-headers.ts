
import fs from 'fs';
const content = fs.readFileSync('src/data/actress_enrichment.csv', 'utf-8');
console.log(JSON.stringify(content.split('\n')[0].split(',')));
