const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./server/database.sqlite');

const mapCapability = (cap) => {
  let newL1 = cap.l1;
  let newL2 = cap.l2;

  // 1. Direct L1 Merges
  if (cap.l1 === 'Financial Mgmt') newL1 = 'Finance & Accounting';
  if (cap.l1 === 'Enterprise Risk' || cap.l1 === 'Risk Management' || cap.l1 === 'Emerging Risk' || cap.l1 === 'Compliance & Legal') newL1 = 'Enterprise Risk & Compliance';
  if (cap.l1 === 'Customer Mgmt' || cap.l1 === 'Customer Experience') newL1 = 'Customer Management & Experience';
  if (cap.l1 === 'Product Engine') newL1 = 'Product Management';
  if (cap.l1 === 'Corporate' || cap.l1 === 'Corporate Svcs') newL1 = 'Operations & Corporate Services';
  if (cap.l1 === 'Agentic AI') { newL1 = 'Data & Analytics'; newL2 = 'Advanced AI & Automation'; }
  if (cap.l1 === 'IT Mgmt') newL1 = 'Information Technology Management';
  if (cap.l1 === 'Actuarial & Capital Markets') newL1 = 'Actuarial & Capital Management';

  // 2. L2-based Mappings for mixed segments
  const claimsL2s = ['Complex Claims', 'Health Claims'];
  const underL2s = ['Commercial Underwriting', 'Medical Underwriting', 'Risk Control & Engineering'];
  const distL2s = ['Broker & Agency Mgmt'];
  const adminL2s = ['Annuity Administration', 'Group Benefits'];

  if (claimsL2s.includes(cap.l2)) newL1 = 'Claims Management';
  else if (underL2s.includes(cap.l2)) newL1 = 'New Business & Underwriting';
  else if (distL2s.includes(cap.l2)) newL1 = 'Distribution & Channel Management';
  else if (adminL2s.includes(cap.l2)) newL1 = 'Policy Administration';
  else if (cap.l2 === 'Portfolio Management' || cap.l2 === 'Trade Execution' || cap.l2 === 'Performance & Reporting' || cap.l2 === 'Capital Management') newL1 = 'Finance & Accounting';
  else if (cap.l2 === 'Wealth Advisory') newL1 = 'Customer Management & Experience';

  // 3. For all remaining ones in segments
  const productSegments = ['P&C', 'Life', 'Health', 'Annuity', 'Specialty', 'Commercial & Specialty', 'Life, Health & Annuities', 'Wealth & Asset Management', 'Sector', 'Ancillary', 'P&C / Life', 'Wealth Mgmt', 'Asset Mgmt'];
  
  if (productSegments.includes(newL1)) {
    newL1 = 'Product Management';
  }

  // 4. Renames
  if (newL1 === 'Marketing') newL1 = 'Marketing & Sales';
  if (newL1 === 'Distribution Mgmt') newL1 = 'Distribution & Channel Management';
  if (newL1 === 'Underwriting & Pricing') newL1 = 'New Business & Underwriting';

  return { newL1, newL2 };
};

db.serialize(() => {
  db.all('SELECT * FROM capabilities', [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    db.run('BEGIN TRANSACTION');
    
    let stmt = db.prepare('UPDATE capabilities SET l1 = ?, l2 = ? WHERE id = ?');
    
    rows.forEach(cap => {
      const { newL1, newL2 } = mapCapability(cap);
      stmt.run(newL1, newL2, cap.id);
    });

    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) console.error("Commit error:", err);
      else console.log("Successfully normalized L1s and L2s in the database.");
      db.close();
    });
  });
});
