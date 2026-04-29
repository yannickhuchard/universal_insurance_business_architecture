const fs = require('fs');

const mdPath = './Universal Insurance Capability Map.md';
let content = fs.readFileSync(mdPath, 'utf8');

const mapL1 = (newL1) => {
  if (newL1 === 'Corporate' || newL1 === 'Corporate Svcs') return 'Corporate Services';
  if (newL1 === 'Financial Mgmt' || newL1 === 'Finance & Accounting') return 'Financial Management & Accounting';
  if (newL1 === 'Enterprise Risk' || newL1 === 'Risk Management' || newL1 === 'Emerging Risk') return 'Enterprise Risk Management';
  if (newL1 === 'Customer Mgmt' || newL1 === 'Customer Experience') return 'Customer Management & Experience';
  if (newL1 === 'Wealth Mgmt' || newL1 === 'Asset Mgmt' || newL1 === 'Wealth & Asset Management') return 'Wealth & Asset Management';
  if (newL1 === 'P&C' || newL1 === 'P&C / Life') return 'Property & Casualty';
  if (newL1 === 'Commercial & Specialty' || newL1 === 'Specialty') return 'Commercial & Specialty Lines';
  if (newL1 === 'Life' || newL1 === 'Annuity' || newL1 === 'Life, Health & Annuities') return 'Life & Annuities';
  if (newL1 === 'Health') return 'Health & Accident';
  if (newL1 === 'Distribution Mgmt') return 'Distribution & Channel Management';
  if (newL1 === 'Marketing') return 'Marketing & Sales';
  if (newL1 === 'Policy Admin') return 'Policy Administration';
  if (newL1 === 'Claims Mgmt') return 'Claims Management';
  if (newL1 === 'Reinsurance Mgmt') return 'Reinsurance Management';
  if (newL1 === 'IT Mgmt') return 'Information Technology';
  if (newL1 === 'Product Engine') return 'Product Development & Management';
  if (newL1 === 'Agentic AI') return 'Agentic AI & Automation';
  if (newL1 === 'Ancillary') return 'Value-Added & Ancillary Services';
  return newL1;
};

const lines = content.split('\n');
const newLines = lines.map(line => {
  if (line.startsWith('|') && !line.includes('Level 1 Domain') && !line.includes('| :----') && !line.includes('| Sector |')) {
    const parts = line.split('|');
    if (parts.length >= 4) {
      const originalL1 = parts[1].trim();
      const updatedL1 = mapL1(originalL1);
      if (updatedL1 !== originalL1) {
        // preserve whitespace if we want, but it's simpler to just replace the cell
        parts[1] = ` ${updatedL1} `;
        return parts.join('|');
      }
    }
  }
  return line;
});

fs.writeFileSync(mdPath, newLines.join('\n'));
console.log('Markdown updated successfully.');
