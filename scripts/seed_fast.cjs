const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('./server/database.sqlite');
const data = JSON.parse(fs.readFileSync('./src/data/capabilities.json', 'utf8'));

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS capabilities');
  db.run(`
    CREATE TABLE capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      l1 TEXT NOT NULL,
      l2 TEXT NOT NULL,
      l3 TEXT NOT NULL,
      desc TEXT,
      isStrategic BOOLEAN,
      state TEXT DEFAULT 'as-is',
      coverage INTEGER DEFAULT 0,
      security INTEGER DEFAULT 0,
      privacy INTEGER DEFAULT 0,
      debt INTEGER DEFAULT 0,
      risk INTEGER DEFAULT 0,
      techStack TEXT,
      applications TEXT
    )
  `);
  
  const stmt = db.prepare(`
    INSERT INTO capabilities (l1, l2, l3, desc, isStrategic, state, coverage, security, privacy, debt, risk, techStack, applications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let count = 0;
  data.forEach((cap) => {
    stmt.run(
      cap.l1,
      cap.l2,
      cap.l3,
      cap.desc || '',
      cap.isStrategic ? 1 : 0,
      'as-is',
      cap.scores?.coverage || 0,
      cap.scores?.security || 0,
      cap.scores?.privacy || 0,
      cap.scores?.debt || 0,
      cap.scores?.risk || 0,
      JSON.stringify(cap.techStack || []),
      JSON.stringify(cap.applications || [])
    );
    count++;
  });
  stmt.finalize();
  console.log(`Seeded ${count} capabilities`);
});

db.close(() => console.log('Done'));
