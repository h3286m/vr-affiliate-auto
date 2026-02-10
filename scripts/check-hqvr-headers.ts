
import fs from 'fs';
const content = fs.readFileSync('src/data/HQVR_data.csv', 'utf-8');
const lines = content.split('\n');
console.log('Headers:', JSON.stringify(lines[0].split(',')));
console.log('Row 1:', JSON.stringify(lines[1].split(',')));
console.log('Row 2:', JSON.stringify(lines[2].split(',')));
