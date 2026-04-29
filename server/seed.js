import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../src/data/capabilities.json');

const capabilitiesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

db.serialize(() => {
  db.run('DELETE FROM capabilities', (err) => {
    if (err) console.error('Error clearing table', err);
    else console.log('Cleared existing table data');
  });

  const stmt = db.prepare(`
    INSERT INTO capabilities (l1, l2, l3, "desc", isStrategic, state, coverage, security, privacy, debt, risk, techStack, applications, translations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, (err) => {
    if (err) console.error('Prepare error:', err);
  });

  let count = 0;
  
  db.run('BEGIN TRANSACTION');
  try {
    capabilitiesData.forEach((cap) => {
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
        JSON.stringify(cap.applications || []),
        JSON.stringify(cap.translations || {}),
        (err) => {
          if (err) console.error('Error inserting:', cap.l3, err);
        }
      );
      count++;
    });
  } catch (err) {
    console.error('Error during stmt.run:', err);
  }
  db.run('COMMIT');

  stmt.finalize((err) => {
    if (err) console.error('Finalize error:', err);
    else console.log(`Queued ${count} capabilities. Writing to database...`);
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database', err);
  } else {
    console.log('Database seeded and closed successfully.');
  }
});
