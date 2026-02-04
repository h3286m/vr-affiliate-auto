
import fs from 'fs';
import path from 'path';

const INPUT_PATH = path.join(process.cwd(), 'src', 'data', 'priority.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'priority_sa.csv');

// Sa-row starts with these characters
const SA_ROW_CHARS = ['さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ'];

function filterSaRow() {
    try {
        const content = fs.readFileSync(INPUT_PATH, 'utf-8');
        const lines = content.split('\n');

        // Header is line 0
        const header = lines[0];
        const saLines = [header];
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(',');
            const ruby = columns[2]; // id,name,ruby,...

            if (ruby && SA_ROW_CHARS.includes(ruby.charAt(0))) {
                saLines.push(line);
                count++;
            }
        }

        fs.writeFileSync(OUTPUT_PATH, saLines.join('\n'));
        console.log(`Filtered ${count} Sa-row actresses to ${OUTPUT_PATH}`);
    } catch (e) {
        console.error("Error filtering CSV:", e);
    }
}

filterSaRow();
