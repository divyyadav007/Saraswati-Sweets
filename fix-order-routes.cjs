const fs = require('fs');
let code = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8');

code = code.replace(
  /id: `oi-\$\{Math\.random\(\)\.toString\(36\)\.slice\(2, 9\)\}`/g,
  "id: randomUUID()"
);

code = code.replace(
  /const orderItemsRows = orderItemsSnapshots\.map\(it => \(\{[\s\S]*?\}\)\);/,
  `const orderItemsRows = orderItemsSnapshots.map(it => ({
    id: it.id,
    order_id: orderId,
    item_type: it.item_type || 'PRODUCT',
    product_variant_id: it.item_type === 'HAMPER' ? null : (it.variant_id || null),
    gift_hamper_id: it.item_type === 'HAMPER' ? (it.product_id || null) : null,
    product_name_snapshot: it.product_name,
    variant_label_snapshot: it.variant_label,
    unit_price: it.unit_price,
    quantity: it.quantity,
    line_total: it.total_price
  }));`
);

fs.writeFileSync('server/routes/orderRoutes.ts', code);
console.log('Fixed orderRoutes.ts');
