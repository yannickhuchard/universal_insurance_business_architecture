const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./server/database.sqlite');

db.serialize(() => {
  db.run("UPDATE capabilities SET l1 = 'Claims Management' WHERE l1 = 'Claims Mgmt'");
  db.run("UPDATE capabilities SET l1 = 'Policy Administration' WHERE l1 = 'Policy Admin'");
  db.run("UPDATE capabilities SET l1 = 'Reinsurance' WHERE l1 = 'Reinsurance Mgmt'");
  db.run("UPDATE capabilities SET l1 = 'Core Insurance Operations' WHERE l1 = 'Core Insurance'");
});
db.close();
