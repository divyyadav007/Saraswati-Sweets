const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("else if (nextStatus === 'READY_FOR_PICKUP') updates.ready_at = nowIso;"));
console.log(lines.slice(start, start + 30).join('\n'));
