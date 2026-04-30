const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, "antigravity/resources/mapa-interactivo-cr (1).html"),
  'utf8'
);

// Extract the _paths() return object block
const match = src.match(/_paths\(\)\s*\{return\{([\s\S]*?)\}\s*\}/);
if (!match) { console.error('Could not find _paths()'); process.exit(1); }

const block = match[1];

// Parse each key:'value' pair (values may contain commas so we match key-by-key)
const keys = ['CRA','CRG','CRL','CRH','CRSJ','CRC','CRP'];
const paths = {};

for (const key of keys) {
  const re = new RegExp(`${key}:'([^']*)'`);
  const m = block.match(re);
  paths[key] = m ? m[1] : '';
}

fs.writeFileSync(
  path.join(__dirname, 'data/map-paths.json'),
  JSON.stringify(paths, null, 2),
  'utf8'
);

console.log('map-paths.json written:', Object.keys(paths).map(k => `${k}(${paths[k].length} chars)`).join(', '));
