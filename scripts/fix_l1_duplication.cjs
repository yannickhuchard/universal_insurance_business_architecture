const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./server/database.sqlite');
const data = JSON.parse(fs.readFileSync('./src/data/capabilities.json', 'utf8'));

const mapCapability = (cap) => {
  let newL1 = cap.l1;

  // 1. Remove Table Headers masquerading as capabilities
  if (newL1 === 'Sector' || newL1 === 'Level 1 Domain') return null;

  // 2. Fix Duplications in Corporate / Enterprise Shared Services
  if (newL1 === 'Corporate' || newL1 === 'Corporate Svcs') newL1 = 'Corporate Services';
  if (newL1 === 'Financial Mgmt' || newL1 === 'Finance & Accounting') newL1 = 'Financial Management & Accounting';
  if (newL1 === 'Enterprise Risk' || newL1 === 'Risk Management' || newL1 === 'Emerging Risk') newL1 = 'Enterprise Risk Management';
  if (newL1 === 'Customer Mgmt' || newL1 === 'Customer Experience') newL1 = 'Customer Management & Experience';

  // 3. Fix Duplications in Wealth Management
  if (newL1 === 'Wealth Mgmt' || newL1 === 'Asset Mgmt' || newL1 === 'Wealth & Asset Management') newL1 = 'Wealth & Asset Management';

  // 4. Fix Duplications in Product Lines
  if (newL1 === 'P&C' || newL1 === 'P&C / Life') newL1 = 'Property & Casualty';
  if (newL1 === 'Commercial & Specialty' || newL1 === 'Specialty') newL1 = 'Commercial & Specialty Lines';
  if (newL1 === 'Life' || newL1 === 'Annuity' || newL1 === 'Life, Health & Annuities') newL1 = 'Life & Annuities';
  if (newL1 === 'Health') newL1 = 'Health & Accident';

  // 5. General Cleanup
  if (newL1 === 'Distribution Mgmt') newL1 = 'Distribution & Channel Management';
  if (newL1 === 'Marketing') newL1 = 'Marketing & Sales';
  if (newL1 === 'Policy Admin') newL1 = 'Policy Administration';
  if (newL1 === 'Claims Mgmt') newL1 = 'Claims Management';
  if (newL1 === 'Reinsurance Mgmt') newL1 = 'Reinsurance Management';
  if (newL1 === 'IT Mgmt') newL1 = 'Information Technology';
  if (newL1 === 'Product Engine') newL1 = 'Product Development & Management';
  if (newL1 === 'Agentic AI') newL1 = 'Agentic AI & Automation';
  if (newL1 === 'Ancillary') newL1 = 'Value-Added & Ancillary Services';

  return { ...cap, l1: newL1 };
};

const cleanedData = data
  .map(mapCapability)
  .filter(Boolean); // Remove nulls (table headers)

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
  cleanedData.forEach((cap) => {
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
  console.log(`Seeded ${count} capabilities with cleaned L1s.`);
  
  // Let's also rewrite the capabilities.json so it's consistent
  fs.writeFileSync('./src/data/capabilities.json', JSON.stringify(cleanedData, null, 2));
});

db.close(() => {
  console.log('Database updated successfully.');
});
