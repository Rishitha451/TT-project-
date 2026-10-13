const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'src/pages/investments/Portfolio.tsx');
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync(p, content);
console.log('Fixed syntax in Portfolio.tsx');
