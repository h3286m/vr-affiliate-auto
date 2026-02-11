const fs = require('fs');
const acts = JSON.parse(fs.readFileSync('src/data/actresses.json', 'utf8'));
const act = acts.find(a => a.id === '1051008');
if (act) {
    console.log('Actress: ' + act.name);
    if (act.videos) {
        console.log('Video Count: ' + act.videos.length);
        console.log('Has savr00589: ' + act.videos.some(v => v.content_id === 'savr00589'));
    } else {
        console.log('No videos property found');
    }
} else {
    console.log('Actress not found');
}
