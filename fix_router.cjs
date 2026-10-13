const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/app/router.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("{\n        {\n        path: 'investments',", "{\n        path: 'investments',");
fs.writeFileSync(file, content);
console.log('Fixed router syntax');
