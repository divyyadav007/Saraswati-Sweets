const fs = require('fs');
const lines = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("router.get('/orders'"));
console.log(lines.slice(startIndex, startIndex + 50).join('\n'));
