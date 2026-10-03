const fs = require('fs');
const lines = fs.readFileSync('server/db.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("supabaseServer.from('orders')"));
console.log(lines.slice(start - 2, start + 20).join('\n'));
