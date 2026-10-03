const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace(
  /if \(typeof ordItems !== 'undefined' && ordItems\.data\) \{[\s\S]*?ords\.data\.forEach\(\(x: any\) => \{/,
  `if (typeof ordItems !== 'undefined' && ordItems.data) {
         ordItems.data.forEach((it: any) => {
             if (!ordMap.has(it.order_id)) ordMap.set(it.order_id, []);
             
             // MAP Supabase columns to ServerOrderItem interface
             const mappedItem = {
               id: it.id,
               order_id: it.order_id,
               product_id: it.item_type === 'HAMPER' ? it.gift_hamper_id : null,
               variant_id: it.product_variant_id,
               product_name: it.product_name_snapshot,
               variant_label: it.variant_label_snapshot,
               unit_price: it.unit_price,
               quantity: it.quantity,
               total_price: it.line_total,
               item_type: it.item_type
             };
             
             ordMap.get(it.order_id).push(mappedItem);
         });
       }
       ords.data.forEach((x: any) => {`
);

fs.writeFileSync('server/db.ts', code);
console.log('Fixed db.ts');
