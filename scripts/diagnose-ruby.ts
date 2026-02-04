import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const actresses = JSON.parse(rawData);

console.log(`Total Actresses: ${actresses.length}`);

let noRuby = 0;
let validRuby = 0;
let saRow = 0;

for (const a of actresses) {
    if (!a.ruby) {
        noRuby++;
        if (noRuby <= 5) console.log(`[No Ruby] ID: ${a.id}, Name: ${a.name}`);
    } else {
        validRuby++;
        if (['さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ'].some(c => a.ruby.startsWith(c))) {
            saRow++;
        }
    }
}

console.log(`No Ruby: ${noRuby}`);
console.log(`Valid Ruby: ${validRuby}`);
console.log(`Sa Row Count: ${saRow}`);
