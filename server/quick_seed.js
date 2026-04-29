import sqlite3 from 'sqlite3';
import fs from 'fs';

const db = new sqlite3.Database('server/database.sqlite');
const data = JSON.parse(fs.readFileSync('src/data/capabilities.json', 'utf8'));

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS capabilities');
  db.run(`
    CREATE TABLE IF NOT EXISTS capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      l1 TEXT NOT NULL,
      l2 TEXT NOT NULL,
      l3 TEXT NOT NULL,
      "desc" TEXT,
      isStrategic BOOLEAN,
      state TEXT DEFAULT 'as-is',
      coverage INTEGER DEFAULT 0,
      security INTEGER DEFAULT 0,
      privacy INTEGER DEFAULT 0,
      debt INTEGER DEFAULT 0,
      risk INTEGER DEFAULT 0,
      techStack TEXT,
      applications TEXT,
      translations TEXT DEFAULT '{}'
    )
  `);
  
  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare('INSERT INTO capabilities (l1, l2, l3, "desc", isStrategic, state, coverage, security, privacy, debt, risk, techStack, applications, translations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  data.forEach(c => {
    stmt.run(
      c.l1, c.l2, c.l3, c.desc || '', c.isStrategic ? 1 : 0, 'as-is', 
      c.scores?.coverage || 0, c.scores?.security || 0, c.scores?.privacy || 0, 
      c.scores?.debt || 0, c.scores?.risk || 0, 
      JSON.stringify(c.techStack || []), JSON.stringify(c.applications || []), JSON.stringify(c.translations || {})
    );
  });
  
  stmt.finalize();
  db.run('COMMIT', (err) => {
    if (err) console.error(err);
    else console.log('Successfully seeded database!');
  });
});
db.close();
