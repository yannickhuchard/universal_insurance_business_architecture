import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to parse JSON arrays from DB
const parseArrays = (row) => ({
  ...row,
  isStrategic: Boolean(row.isStrategic),
  scores: {
    coverage: row.coverage,
    security: row.security,
    privacy: row.privacy,
    debt: row.debt,
    risk: row.risk
  },
  techStack: row.techStack ? JSON.parse(row.techStack) : [],
  applications: row.applications ? JSON.parse(row.applications) : [],
  translations: row.translations ? JSON.parse(row.translations) : {}
});

// GET all capabilities
app.get('/api/capabilities', (req, res) => {
  db.all('SELECT * FROM capabilities', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(parseArrays));
  });
});

// POST new capability
app.post('/api/capabilities', (req, res) => {
  const { l1, l2, l3, desc, isStrategic, state, scores, techStack, applications, translations } = req.body;
  const sql = `
    INSERT INTO capabilities (l1, l2, l3, desc, isStrategic, state, coverage, security, privacy, debt, risk, techStack, applications, translations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    l1, l2, l3, desc, 
    isStrategic ? 1 : 0, 
    state || 'as-is',
    scores?.coverage || 0,
    scores?.security || 0,
    scores?.privacy || 0,
    scores?.debt || 0,
    scores?.risk || 0,
    JSON.stringify(techStack || []),
    JSON.stringify(applications || []),
    JSON.stringify(translations || {})
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      ...req.body
    });
  });
});

// PUT update capability
app.put('/api/capabilities/:id', (req, res) => {
  const { l1, l2, l3, desc, isStrategic, state, scores, techStack, applications, translations } = req.body;
  const sql = `
    UPDATE capabilities 
    SET l1 = ?, l2 = ?, l3 = ?, desc = ?, isStrategic = ?, state = ?, 
        coverage = ?, security = ?, privacy = ?, debt = ?, risk = ?, 
        techStack = ?, applications = ?, translations = ?
    WHERE id = ?
  `;
  const params = [
    l1, l2, l3, desc, 
    isStrategic ? 1 : 0, 
    state || 'as-is',
    scores?.coverage || 0,
    scores?.security || 0,
    scores?.privacy || 0,
    scores?.debt || 0,
    scores?.risk || 0,
    JSON.stringify(techStack || []),
    JSON.stringify(applications || []),
    JSON.stringify(translations || {}),
    req.params.id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'updated', changes: this.changes });
  });
});

// DELETE capability
app.delete('/api/capabilities/:id', (req, res) => {
  db.run('DELETE FROM capabilities WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'deleted', changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Local EA API Server running on port ${PORT}`);
});
