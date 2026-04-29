import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    db.run(`
      CREATE TABLE IF NOT EXISTS capabilities (
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
    `, (err) => {
      if (err) {
        console.error('Error creating table', err);
      } else {
        console.log('Capabilities table ready');
      }
    });
  }
});

export default db;
