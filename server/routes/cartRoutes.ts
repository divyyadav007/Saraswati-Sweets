import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../authMiddleware';
import {
  MASTER_VARIANTS,
  STORE_SETTINGS,
  inMemoryStore,
  supabaseServer,
  isLiveSupabase,
} from '../db';

const router = Router();

interface CartInputItem {
  variantId: string;
  quantity: number;
  item_type?: 'PRODUCT' | 'HAMPER';
}

export function computeServerCart(rawItems: CartInputItem[]) {
  const verifiedItems: any[] = [];
  let subtotal = 0;
  let savings = 0;
  let totalItemsCount = 0;

  for (const raw of rawItems) {
    if (!raw.variantId) continue;

    // Check if item is a Gift Hamper
    const isHamperVariant =
      raw.item_type === 'HAMPER' ||
      raw.variantId.startsWith('hamper-var-') ||
      inMemoryStore.giftHampers.has(raw.variantId);

    if (isHamperVariant) {
      const hamperId = raw.variantId.startsWith('hamper-var-')
        ? raw.variantId.replace('hamper-var-', '')
        : raw.variantId;

      const hamper =
        inMemoryStore.giftHampers.get(hamperId) ||
        Array.from(inMemoryStore.giftHampers.values()).find(
          (h) => h.id === hamperId || h.slug === hamperId
        );

      if (hamper && hamper.is_active) {
        const clampedQuantity = Math.max(1, Math.min(20, Math.floor(raw.quantity || 1)));
        const itemTotal = hamper.price * clampedQuantity;
        const itemSavings = Math.max(0, hamper.mrp - hamper.price) * clampedQuantity;

        subtotal += itemTotal;
        savings += itemSavings;
        totalItemsCount += clampedQuantity;

        verifiedItems.push({
          productId: hamper.id,
          productName: hamper.name,
          variantId: `hamper-var-${hamper.id}`,
          variantLabel: hamper.box_type || 'Festive Hamper Box',
          weightGrams: 1000,
          price: hamper.price,
          mrp: hamper.mrp,
          imageUrl: hamper.image_url,
          quantity: clampedQuantity,
          itemTotal,
          stockStatus: 'IN_STOCK',
          item_type: 'HAMPER',
          items_included: hamper.items_included,
        });
      }
      continue;
    }

    // Standard Product Variant
    const variant = MASTER_VARIANTS.find((v) => v.id === raw.variantId);
    if (!variant) continue;

    // Cap at 20 per item as required by specification
    const clampedQuantity = Math.max(1, Math.min(20, Math.floor(raw.quantity || 1)));
    const itemTotal = variant.price * clampedQuantity;
    const itemSavings = Math.max(0, variant.mrp - variant.price) * clampedQuantity;

    subtotal += itemTotal;
    savings += itemSavings;
    totalItemsCount += clampedQuantity;

    verifiedItems.push({
      productId: variant.productId,
      productName: variant.productName,
      variantId: variant.id,
      variantLabel: variant.label,
      weightGrams: variant.weightGrams,
      price: variant.price,
      mrp: variant.mrp,
      imageUrl: variant.imageUrl,
      quantity: clampedQuantity,
      itemTotal,
      stockStatus: variant.stockStatus,
      item_type: 'PRODUCT',
    });
  }

  const isFreeDelivery = subtotal >= STORE_SETTINGS.free_delivery_above || subtotal === 0;
  const deliveryCharge = isFreeDelivery ? 0 : STORE_SETTINGS.delivery_charge;
  const total = subtotal + deliveryCharge;
  const freeDeliveryShortfall = Math.max(0, STORE_SETTINGS.free_delivery_above - subtotal);

  return {
    items: verifiedItems,
    subtotal,
    savings,
    deliveryCharge,
    freeDeliveryThreshold: STORE_SETTINGS.free_delivery_above,
    freeDeliveryShortfall,
    isFreeDelivery,
    total,
    totalItems: totalItemsCount,
  };
}

// POST /api/cart/calculate - Authoritative calculation for guest cart or validation
router.post('/calculate', (req, res) => {
  const items: CartInputItem[] = Array.isArray(req.body.items) ? req.body.items : [];
  const serverCart = computeServerCart(items);
  res.json(serverCart);
});

// GET /api/cart - Get logged-in user's server cart
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  let userCart = inMemoryStore.userCarts.get(userId);

  if (!userCart) {
    userCart = new Map<string, number>();
    inMemoryStore.userCarts.set(userId, userCart);
  }

  const rawItems: CartInputItem[] = Array.from(userCart.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  const serverCart = computeServerCart(rawItems);
  res.json(serverCart);
});

// POST /api/cart/items - Add or update quantity in logged-in user's server cart
router.post('/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { variantId, quantity = 1 } = req.body;

  if (!variantId) {
    res.status(400).json({ error: 'MISSING_VARIANT', message: 'Variant ID is required' });
    return;
  }

  let userCart = inMemoryStore.userCarts.get(userId);
  if (!userCart) {
    userCart = new Map<string, number>();
    inMemoryStore.userCarts.set(userId, userCart);
  }

  const currentQty = userCart.get(variantId) || 0;
  // Cap at 20
  const newQty = Math.min(20, currentQty + Math.max(1, quantity));
  userCart.set(variantId, newQty);

  const rawItems: CartInputItem[] = Array.from(userCart.entries()).map(([vId, q]) => ({
    variantId: vId,
    quantity: q,
  }));

  res.json(computeServerCart(rawItems));
});

// PUT /api/cart/items/:variantId - Update quantity directly (cap 20, remove if <= 0)
router.put('/items/:variantId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { variantId } = req.params;
  const { quantity } = req.body;

  let userCart = inMemoryStore.userCarts.get(userId);
  if (!userCart) {
    userCart = new Map<string, number>();
    inMemoryStore.userCarts.set(userId, userCart);
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    userCart.delete(variantId);
  } else {
    // Cap at 20
    userCart.set(variantId, Math.min(20, Math.floor(quantity)));
  }

  const rawItems: CartInputItem[] = Array.from(userCart.entries()).map(([vId, q]) => ({
    variantId: vId,
    quantity: q,
  }));

  res.json(computeServerCart(rawItems));
});

// DELETE /api/cart/items/:variantId - Remove variant from user's server cart
router.delete('/items/:variantId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { variantId } = req.params;

  const userCart = inMemoryStore.userCarts.get(userId);
  if (userCart) {
    userCart.delete(variantId);
  }

  const rawItems: CartInputItem[] = userCart
    ? Array.from(userCart.entries()).map(([vId, q]) => ({ variantId: vId, quantity: q }))
    : [];

  res.json(computeServerCart(rawItems));
});

// DELETE /api/cart - Clear user's server cart
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  inMemoryStore.userCarts.set(userId, new Map<string, number>());
  res.json(computeServerCart([]));
});

// POST /api/cart/merge - Merge guest cart on login (sum quantities, cap 20/item)
router.post('/merge', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const guestItems: CartInputItem[] = Array.isArray(req.body.guestItems) ? req.body.guestItems : [];

  let userCart = inMemoryStore.userCarts.get(userId);
  if (!userCart) {
    userCart = new Map<string, number>();
    inMemoryStore.userCarts.set(userId, userCart);
  }

  // Merge logic: sum quantities, cap at 20 per item
  for (const guestItem of guestItems) {
    if (!guestItem.variantId) continue;
    const existingQty = userCart.get(guestItem.variantId) || 0;
    const guestQty = Math.max(1, Math.floor(guestItem.quantity || 1));
    const mergedQty = Math.min(20, existingQty + guestQty);
    userCart.set(guestItem.variantId, mergedQty);
  }

  const rawItems: CartInputItem[] = Array.from(userCart.entries()).map(([vId, q]) => ({
    variantId: vId,
    quantity: q,
  }));

  const serverCart = computeServerCart(rawItems);
  res.json({
    success: true,
    message: `Merged ${guestItems.length} guest cart items into account cart`,
    cart: serverCart,
  });
});

// POST /api/cart/apply-coupon - Server-side validation of coupons at apply time
router.post('/apply-coupon', async (req: AuthenticatedRequest, res: Response) => {
  const { code, subtotal = 0, guestPhone } = req.body;
  const userId = req.user?.id;
  const phone = req.user?.phone || guestPhone;

  if (!code) {
    res.status(400).json({
      error: 'COUPON_CODE_REQUIRED',
      message: 'Please provide a coupon code to apply.',
    });
    return;
  }

  // Import validateCouponServer from db
  const { validateCouponServer } = await import('../db');
  const result = validateCouponServer(code, Number(subtotal), userId, phone);

  if (!result.valid) {
    res.status(400).json({
      error: result.errorCode || 'COUPON_INVALID',
      message: result.error || 'Invalid coupon code.',
    });
    return;
  }

  res.json({
    success: true,
    message: `Coupon '${result.coupon!.code}' applied successfully! Saved ₹${result.discount_amount}.`,
    coupon: {
      code: result.coupon!.code,
      discount_type: result.coupon!.type,
      discount_value: result.coupon!.value,
      description: result.coupon!.description,
    },
    discount: result.discount_amount,
  });
});

export default router;
