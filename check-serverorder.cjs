const fs = require('fs');
const lines = fs.readFileSync('server/db.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('export interface ServerOrder {'));
console.log(lines.slice(start, start + 30).join('\n'));
