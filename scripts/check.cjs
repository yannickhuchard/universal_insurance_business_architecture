const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./server/database.sqlite');
db.all('SELECT l1, COUNT(*) as count FROM capabilities GROUP BY l1', [], (err, rows) => {
    console.log(rows);
    db.close();
});
