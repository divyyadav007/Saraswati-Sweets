const http = require('http');
const crypto = require('crypto');

async function testCheckout() {
  const phone = '9999988888';
  
  // 1. Login
  const loginRes = await fetch('http://127.0.0.1:3000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Profile full_name:', loginData.profile.full_name);

  // 2. Fetch Slots to get a valid slot ID
  const slotsRes = await fetch('http://127.0.0.1:3000/api/delivery-slots');
  const slotsData = await slotsRes.json();
  const slotId = slotsData.slots[slotsData.slots.length - 1].id;
  console.log('Using Slot ID:', slotId);

  // 3. Fetch products to get a valid variant ID
  const prodsRes = await fetch('http://127.0.0.1:3000/api/products');
  const prodsData = await prodsRes.json();
  const product = prodsData.products[0];
  const variant = product.variants[0];

  console.log(`Using product: ${product.id}, variant: ${variant.id}`);

  // 4. Place Order
  const orderRes = await fetch('http://127.0.0.1:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      items: [{
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
        unit_price: variant.price
      }],
      address: {
        recipient_name: 'Test TestName',
        recipient_phone: '9999988888',
        street_address: '123 Test St',
        pincode: '225001'
      },
      slot_id: slotId,
      payment_method: 'COD'
    })
  });
  const orderData = await orderRes.json();
  console.log('Checkout Response:', orderData);
}

testCheckout().catch(console.error);
