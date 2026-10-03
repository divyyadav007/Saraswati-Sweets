const fs = require('fs');

const files = [
  'server/routes/adminRoutes.ts',
  'server/routes/orderRoutes.ts',
  'server/routes/paymentRoutes.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/'COMPLETED'/g, "'CAPTURED'");
  fs.writeFileSync(file, code);
  console.log(`Fixed ${file}`);
}
