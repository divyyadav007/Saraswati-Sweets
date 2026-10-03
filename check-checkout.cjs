const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("router.post('/checkout'"));
console.log(lines.slice(start + 30, start + 60).join('\n'));
