const fs = require('fs');
let code = fs.readFileSync('server/routes/authRoutes.ts', 'utf8');
code = code.replace(/\|\| 'Valued Patron'/g, "|| ''");
fs.writeFileSync('server/routes/authRoutes.ts', code);
console.log('Fixed authRoutes');
