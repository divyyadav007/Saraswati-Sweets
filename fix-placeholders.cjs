const fs = require('fs');
let code = fs.readFileSync('server/authMiddleware.ts', 'utf8');

code = code.replace(
  /(cleanPhone \? `Customer \${cleanPhone\.slice\(-4\)}` : 'Valued Customer')/g,
  "''"
);
code = code.replace(
  /(user\.phone \? `Customer \${user\.phone\.slice\(-4\)}` : 'Valued Customer')/g,
  "''"
);
code = code.replace(
  /decoded\.user_metadata\?\.full_name \|\| decoded\.full_name \|\| 'Valued Customer'/g,
  "decoded.user_metadata?.full_name || decoded.full_name || ''"
);

fs.writeFileSync('server/authMiddleware.ts', code);
console.log('Fixed placeholders in authMiddleware');
