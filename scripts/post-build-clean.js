const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

function cleanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            cleanDirectory(fullPath);
        } else {
            // Check if file is one of the debug artifacts
            if (file.startsWith('__next.') && file.endsWith('.txt')) {
                // Delete it
                try {
                    fs.unlinkSync(fullPath);
                    // console.log(`Deleted: ${fullPath}`); // Commented out to reduce log noise
                } catch (e) {
                    console.error(`Failed to delete ${fullPath}:`, e);
                }
            }
        }
    }
}

console.log('Starting post-build cleanup of debug artifacts...');
try {
    cleanDirectory(outDir);
    console.log('Cleanup complete.');
} catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
}
