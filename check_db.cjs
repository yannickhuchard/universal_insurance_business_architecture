const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/database.sqlite');

db.serialize(() => {
  db.all("SELECT DISTINCT l1 FROM capabilities ORDER BY l1", [], (err, rows) => {
    if (err) throw err;
    console.log("DISTINCT L1 Domains:");
    rows.forEach(row => console.log(row.l1));
  });

  db.all("SELECT id, l1, l2, l3, COUNT(*) as count FROM capabilities GROUP BY l1, l2, l3 HAVING count > 1", [], (err, rows) => {
    if (err) throw err;
    console.log("\nDuplicate Capabilities (l1, l2, l3 combination):");
    console.log(rows);
  });
  
  db.all("SELECT l1, count(*) as count FROM capabilities GROUP BY l1", [], (err, rows) => {
      if (err) throw err;
      console.log("\nCount per L1:");
      console.log(rows);
  });
});

db.close();
