const sqlite3 = require('sqlite3');
const fs = require('fs');
const db = new sqlite3.Database('./server/database.sqlite');
db.all('SELECT l1, COUNT(*) as count FROM capabilities GROUP BY l1', [], (err, rows) => {
    fs.writeFileSync('scripts/out2.json', JSON.stringify(rows, null, 2));
    db.close();
});
