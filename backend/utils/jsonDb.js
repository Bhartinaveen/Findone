const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const WISHLIST_FILE = path.join(DATA_DIR, 'wishlist.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

async function ensureFile(filePath) {
    try {
        await fs.access(filePath);
    } catch {
        // Ensure the directory exists before writing the file
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, '[]', 'utf8');
    }
}

async function readJson(file) {
    const filePath = file === 'wishlist' ? WISHLIST_FILE : NOTIFICATIONS_FILE;
    await ensureFile(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

async function writeJson(file, data) {
    const filePath = file === 'wishlist' ? WISHLIST_FILE : NOTIFICATIONS_FILE;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJson, writeJson };
