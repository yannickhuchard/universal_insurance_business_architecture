import fs from 'fs';
import path from 'path';

const mdPath = path.join(process.cwd(), 'Universal Insurance Capability Map.md');
const outPath = path.join(process.cwd(), 'src', 'data', 'capabilities.json');

const content = fs.readFileSync(mdPath, 'utf8');
const capabilities = [];
const lines = content.split('\n');

for (const line of lines) {
  if (line.startsWith('|') && !line.includes('Level 1 Domain') && !line.includes('| :----')) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 4) {
      const l1 = parts[1];
      const l2 = parts[2];
      const l3 = parts[3];
      const desc = parts[4];
      if (l1 && l2 && l3) {
        capabilities.push({ l1, l2, l3, desc });
      }
    }
  }
}

// Additional Capabilities Data (to push the total to 400+)
const additionalDomains = [
  // Commercial & Specialty Lines
  { l1: 'Commercial & Specialty', l2: 'Commercial Underwriting', items: ['Fleet Risk Assessment', 'Cyber Liability Pricing', 'D&O Coverage Analysis', 'Cargo Risk Triage', 'Marine Hull Assessment', 'Aviation Risk Management', 'Environmental Liability', 'Construction Builders Risk'] },
  { l1: 'Commercial & Specialty', l2: 'Complex Claims', items: ['Catastrophe Modeling', 'Reinsurance Subrogation', 'Business Interruption Adjustment', 'Large Loss Reserving', 'Multi-Party Litigation Management', 'Parametric Claim Triggers'] },
  { l1: 'Commercial & Specialty', l2: 'Broker & Agency Mgmt', items: ['MGA Delegation Management', 'Surplus Lines Compliance', 'Syndicate Capital Management', 'Broker Commission Tiering', 'Wholesale Market Syndication'] },
  { l1: 'Commercial & Specialty', l2: 'Risk Control & Engineering', items: ['On-Site Property Inspection', 'Ergonomic Worksite Assessment', 'IoT Sensor Data Analytics', 'Loss Control Recommendations', 'Supply Chain Vulnerability Analysis'] },
  // Life, Health & Annuities
  { l1: 'Life, Health & Annuities', l2: 'Medical Underwriting', items: ['Paramedical Exam Triage', 'Attending Physician Statement (APS) NLP', 'Genetic Test Rule Routing', 'Cognitive Impairment Assessment', 'Mortality Table Calibration', 'Morbidity Risk Scoring', 'Prescription History Analysis'] },
  { l1: 'Life, Health & Annuities', l2: 'Health Claims', items: ['Diagnostic Code Adjudication', 'Dental & Vision Pre-Authorization', 'Pharmacy Benefit Management', 'Out-of-Network Coordination', 'Coordination of Benefits (COB)', 'Telehealth Consultation Settlement'] },
  { l1: 'Life, Health & Annuities', l2: 'Annuity Administration', items: ['Variable Annuity Sub-Account Mgmt', 'Fixed Indexed Crediting', 'Guaranteed Minimum Withdrawal', 'RMD (Required Minimum Distribution)', 'Beneficiary Transfer Management', 'Surrender Charge Calculation'] },
  { l1: 'Life, Health & Annuities', l2: 'Group Benefits', items: ['Employer Group Enrollment', 'Census Data Management', 'Voluntary Benefits Administration', 'Group Premium Reconciliation', 'COBRA Administration', 'Leave of Absence Management'] },
  // Wealth & Asset Management
  { l1: 'Wealth & Asset Management', l2: 'Portfolio Management', items: ['Strategic Asset Allocation', 'Tactical Asset Allocation', 'ESG Strategy Integration', 'Liability Driven Investing (LDI)', 'Derivatives Overlay Management', 'Private Equity Commitments', 'Real Estate Portfolio Modeling'] },
  { l1: 'Wealth & Asset Management', l2: 'Trade Execution', items: ['Algorithmic Trade Routing', 'Dark Pool Access', 'FX Hedging Execution', 'Fixed Income Liquidity Sourcing', 'Post-Trade Settlement', 'Collateral Management'] },
  { l1: 'Wealth & Asset Management', l2: 'Wealth Advisory', items: ['Client Goal Profiling', 'Robo-Advisory Orchestration', 'Trust & Estate Planning', 'Tax-Loss Harvesting', 'Philanthropic Structuring', 'High Net Worth Concierge'] },
  { l1: 'Wealth & Asset Management', l2: 'Performance & Reporting', items: ['GIPS Compliant Reporting', 'Attribution Analysis', 'Risk-Adjusted Return Calculation', 'Client Statement Generation', 'Tax Document Preparation', 'Regulatory Form ADV Filing'] },
  // Advanced Actuarial & Reinsurance
  { l1: 'Actuarial & Capital Markets', l2: 'Capital Management', items: ['Solvency II Calculation', 'Economic Capital Modeling', 'Dividend Strategy Execution', 'Share Repurchase Program', 'Rating Agency Liaison', 'ALM (Asset-Liability Management)'] },
  { l1: 'Actuarial & Capital Markets', l2: 'Advanced Reinsurance', items: ['Catastrophe Bond Issuance', 'Sidecar Vehicle Management', 'Industry Loss Warranty (ILW)', 'Retrocession Treaty Placement', 'Reinsurance Commutation', 'Quota Share Administration'] },
  { l1: 'Actuarial & Capital Markets', l2: 'Actuarial Modernization', items: ['Stochastic Modeling', 'IFRS 17 Reporting Engine', 'Experience Study Analytics', 'Mortality/Morbidity Trend Analysis', 'Rate Filing Orchestration', 'Competitor Price Scraping'] },
  // Product Engine Expansion
  { l1: 'Product Engine', l2: 'Product Launch & Simulation', items: ['A/B Price Testing', 'Synthetic Risk Cohort Generation', 'Competitor Scenario Modeling', 'Regulatory Approval Workflow', 'Commission Modeling', 'Channel Launch Orchestration'] },
  { l1: 'Product Engine', l2: 'API & Syndication', items: ['Aggregator Real-Time Pricing', 'Embedded Insurance Gateway', 'Affinity Partner Portals', 'Open Insurance API Mgmt', 'IoT Sensor Data API', 'Telematics Rate Syndication'] },
  // Customer Experience & Omni-Channel
  { l1: 'Customer Experience', l2: 'Self-Service Portals', items: ['Policyholder Mobile App', 'Digital First Notice of Loss', 'Document Vault & ID Cards', 'Self-Service Endorsements', 'AI Chatbot Integration', 'Premium Payment Portal'] },
  { l1: 'Customer Experience', l2: 'Contact Center Operations', items: ['CTI Integration', 'Voice Sentiment Analysis', 'Next-Best-Action Routing', 'Omni-channel Interaction History', 'Agent Scripting & Knowledge', 'Workforce Optimization'] },
  // Emerging Risk & Parametrics
  { l1: 'Emerging Risk', l2: 'Parametric Insurance', items: ['Smart Contract Oracle Mgmt', 'Weather Trigger Monitoring', 'Seismic Activity Automation', 'Flight Delay Auto-Payout', 'Blockchain Ledger Settlement', 'Supply Chain Indexing'] },
  { l1: 'Emerging Risk', l2: 'Cyber Risk Solutions', items: ['Continuous Vulnerability Scanning', 'Ransomware Negotiation Triage', 'Dark Web Credential Monitoring', 'Cyber Incident Response Team (CIRT)', 'Digital Forensics Dispatch'] },
  // Data Privacy & Compliance Advanced
  { l1: 'Compliance & Legal', l2: 'Data Privacy Operations', items: ['GDPR Right to be Forgotten', 'CCPA Data Deletion', 'Cross-Border Data Residency', 'PII Masking Orchestration', 'Consent Preference Management'] },
  { l1: 'Compliance & Legal', l2: 'Litigation & Subpoena', items: ['E-Discovery Hold Automation', 'External Counsel Billing', 'Regulatory Inquiry Triage', 'Class Action Settlement Adjudication'] },
  // Financial & Treasury
  { l1: 'Finance & Accounting', l2: 'Treasury Operations', items: ['Daily Cash Positioning', 'Liquidity Forecasting', 'FX Risk Management', 'Bank Account Reconciliation', 'Short-Term Debt Issuance'] },
  { l1: 'Finance & Accounting', l2: 'Tax Administration', items: ['Premium Tax Calculation', 'Withholding Tax Processing', 'Transfer Pricing Analytics', 'Statutory Tax Reporting', 'Corporate Income Tax Provision'] },
  // Agentic AI Deep Dives
  { l1: 'Agentic AI', l2: 'Autonomous Ops', items: ['Zero-Touch Underwriting', 'Robotic Process Orchestration', 'Self-Healing IT Infrastructure', 'Automated Fraud Network Analysis', 'Predictive Attrition Mitigation'] },
  // Product Strategy
  { l1: 'Product Engine', l2: 'Market Intelligence', items: ['Competitor Benchmarking', 'Market Trend Analysis', 'Consumer Behavior Modeling', 'Macro-Economic Impact Analysis', 'Regulatory Change Scanning'] },
  { l1: 'Product Engine', l2: 'Innovation Lab', items: ['InsurTech Partnership Mgmt', 'Proof of Concept Orchestration', 'Venture Capital Investments', 'University Research Grants', 'Hackathon Management'] },
  // Risk & Compliance Deep Dives
  { l1: 'Risk Management', l2: 'Enterprise Risk', items: ['Operational Risk Modeling', 'Strategic Risk Assessment', 'Reputational Risk Tracking', 'Model Governance & Validation', 'Business Continuity Planning'] },
  { l1: 'Risk Management', l2: 'Climate Risk', items: ['Physical Climate Modeling', 'Transition Risk Assessment', 'Carbon Footprint Tracking', 'TCFD Reporting', 'Net Zero Strategy Execution'] },
  // Core Underwriting Extensions
  { l1: 'Core Insurance', l2: 'Reinsurance Ceding', items: ['Treaty Reinsurance Mgmt', 'Facultative Reinsurance Placements', 'Reinsurance Premium Accounting', 'Loss Recoveries Tracking'] },
  { l1: 'Core Insurance', l2: 'Catastrophe Management', items: ['Real-Time Event Tracking', 'Exposure Aggregation', 'Post-Event Claims Surge Planning', 'Catastrophe Modeling Calibration'] }
];

additionalDomains.forEach(domain => {
  domain.items.forEach(item => {
    capabilities.push({
      l1: domain.l1,
      l2: domain.l2,
      l3: item,
      desc: `Advanced enterprise capability managing the ${item.toLowerCase()} operations for the broader Universal Insurance ecosystem.`
    });
  });
});

const techPool = [
  'AWS EKS', 'Azure Kubernetes Service', 'GCP Anthos', 'Snowflake', 'Databricks', 
  'Apache Kafka', 'Confluent', 'Redis', 'PostgreSQL', 'MongoDB Atlas', 'Elasticsearch',
  'MuleSoft', 'Apigee', 'Kong', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'Datadog', 'Splunk', 'CrowdStrike', 'Palo Alto', 'HashiCorp Vault', 'React', 'Angular', 
  'Spring Boot', 'Node.js', 'Python/FastAPI', 'Go', 'Apache Spark'
];

const coreApps = ['Guidewire PolicyCenter', 'Guidewire ClaimCenter', 'Guidewire BillingCenter', 'Duck Creek', 'Majesco', 'Insurity', 'Sapiens'];
const crmApps = ['Salesforce Financial Services Cloud', 'Microsoft Dynamics 365', 'Pegasystems', 'ServiceNow'];
const erpApps = ['SAP S/4HANA', 'Oracle Fusion Cloud', 'Workday', 'Coupa', 'Kyriba'];
const dataApps = ['Palantir Foundry', 'Informatica MDM', 'Collibra', 'Tableau', 'PowerBI', 'QlikView'];
const specialApps = ['Shift Technology', 'FRISS', 'Verisk', 'LexisNexis', 'Moody’s RMS', 'AIR Worldwide', 'Alteryx', 'UiPath', 'Blue Prism'];

const allApps = [...coreApps, ...crmApps, ...erpApps, ...dataApps, ...specialApps];

const getRandomSubset = (arr, maxItems) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  const numItems = Math.floor(Math.random() * maxItems) + 1;
  return shuffled.slice(0, numItems);
};

const overlays = ['coverage', 'security', 'privacy', 'debt', 'risk'];

capabilities.forEach(cap => {
  cap.scores = {};
  overlays.forEach(overlay => {
    cap.scores[overlay] = Math.floor(Math.random() * 100); 
  });
  
  cap.techStack = getRandomSubset(techPool, 4);
  
  // Assign realistic apps based on L1
  let appPool = allApps;
  if (cap.l1.includes('Core') || cap.l1.includes('Commercial') || cap.l1.includes('Product')) appPool = [...coreApps, ...specialApps, 'Verisk'];
  else if (cap.l1.includes('Distribution') || cap.l1.includes('Sales') || cap.l1.includes('Customer')) appPool = [...crmApps, 'HubSpot', 'Zendesk'];
  else if (cap.l1.includes('Actuarial') || cap.l1.includes('Data') || cap.l1.includes('Wealth') || cap.l1.includes('AI')) appPool = [...dataApps, 'Moody’s RMS', 'Alteryx', 'Snowflake'];
  else if (cap.l1.includes('Corporate') || cap.l1.includes('Finance') || cap.l1.includes('Compliance')) appPool = [...erpApps, ...dataApps];
  
  cap.applications = getRandomSubset(appPool, 3);
  cap.isStrategic = Math.random() < 0.15; // 15% chance to be strategic
});

fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(capabilities, null, 2));
console.log('Parsed and enriched', capabilities.length, 'capabilities.');
