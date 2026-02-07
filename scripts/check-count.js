
const fs = require('fs');
const path = require('path');
const target = path.join(process.cwd(), 'src/data/actresses.json');
try {
    const data = JSON.parse(fs.readFileSync(target, 'utf-8'));
    console.log(`COUNT: ${data.length}`);
} catch (e) {
    console.error(e);
}
