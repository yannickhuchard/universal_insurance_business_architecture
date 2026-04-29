const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(__dirname, '../src/data/capabilities.json');

const capabilities = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Currently we have fr_1 to fr_4. This script will merge whatever it finds.
const langs = ['fr', 'de', 'lb', 'pt', 'es', 'it'];
const maxChunks = 6; 

let count = 0;

for (const lang of langs) {
  for (let i = 1; i <= maxChunks; i++) {
    const chunkFile = path.join(DATA_DIR, `${lang}_${i}.json`);
    if (fs.existsSync(chunkFile)) {
      const translatedData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
      
      const englishChunkFile = path.join(DATA_DIR, `chunk_${i}.json`);
      let englishData = [];
      if (fs.existsSync(englishChunkFile)) {
        englishData = JSON.parse(fs.readFileSync(englishChunkFile, 'utf8'));
      }
      
      translatedData.forEach(transCap => {
        const engCap = englishData.find(e => e.id === transCap.id);
        if (engCap) {
          const targetCap = capabilities.find(c => c.l3 === engCap.l3);
          if (targetCap) {
            if (!targetCap.translations) targetCap.translations = {};
            if (!targetCap.translations[lang]) targetCap.translations[lang] = {};
            
            targetCap.translations[lang].l1 = transCap.l1;
            targetCap.translations[lang].l2 = transCap.l2;
            targetCap.translations[lang].l3 = transCap.l3;
            targetCap.translations[lang].desc = transCap.desc;
            count++;
          }
        }
      });
      console.log(`Merged ${chunkFile}`);
    }
  }
}

fs.writeFileSync(DB_FILE, JSON.stringify(capabilities, null, 2));
console.log(`Updated ${count} translation entries in capabilities.json`);
