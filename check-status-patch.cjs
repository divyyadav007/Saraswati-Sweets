const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("router.patch('/orders/:id/status'"));
console.log(lines.slice(start, start + 50).join('\n'));
