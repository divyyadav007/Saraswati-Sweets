const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("supabaseServer.from('order_items')"));
console.log(lines.slice(start - 20, start + 20).join('\n'));
