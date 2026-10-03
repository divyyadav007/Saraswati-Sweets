import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../authMiddleware';
import {
  inMemoryStore,
  ServerOffer,
  ServerBanner,
  ServerGiftHamper,
  ServerReview,
  ServerBulkEnquiry,
  ServerNotification,
} from '../db';
import { notifyNewBulkEnquiry } from '../services/notificationService';

const router = Router();

// ==========================================================
// 0. CATALOG (PUBLIC)
// ==========================================================
router.get('/categories', (_req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const categories = Array.from(inMemoryStore.categories.values())
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  res.json({ categories });
});


router.get('/products/:slug', (req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const { slug } = req.params;
  const p = Array.from(inMemoryStore.products.values()).find(p => p.slug === slug && p.is_active);
  if (!p) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  const variants = Array.from(inMemoryStore.variants.values())
    .filter(v => v.productId === p.id)
    .sort((a, b) => a.weightGrams - b.weightGrams)
    .map(v => ({
      id: v.id,
      product_id: v.productId,
      label: v.label,
      weight_grams: v.weightGrams,
      price: v.price,
      mrp: v.mrp,
      sku: v.id,
      stock_status: v.stockStatus,
      stock_quantity: v.stockQuantity,
      display_order: v.weightGrams
    }));
    
  const cat = inMemoryStore.categories.get(p.category_id);
  res.json({
    product: {
      ...p,
      is_eggless: true,
      is_pure_ghee: Boolean(p.pure_ghee),
      is_bestseller: Boolean(p.is_bestseller),
      is_featured: Boolean(p.is_featured),
      badge_label: p.badge_label || null,
      variants,
      images: [
        {
          id: `img-${p.id}`,
          product_id: p.id,
          image_url: p.image_url,
          alt_text: p.name,
          is_primary: true,
          display_order: 1,
        },
      ],
      category: cat || null,
    }
  });
});

router.get('/products', (_req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const products = Array.from(inMemoryStore.products.values())
    .filter((p) => p.is_active);
    
  // Populate variants and categories
  const populatedProducts = products.map(p => {
    const variants = Array.from(inMemoryStore.variants.values())
      .filter(v => v.productId === p.id)
      .sort((a, b) => a.weightGrams - b.weightGrams);
      
    // Map MasterVariant to the shape expected by the client ProductVariant
    const mappedVariants = variants.map(v => ({
      id: v.id,
      product_id: v.productId,
      label: v.label,
      weight_grams: v.weightGrams,
      price: v.price,
      mrp: v.mrp,
      sku: v.id, // Or use actual sku if stored
      stock_status: v.stockStatus,
      stock_quantity: v.stockQuantity,
      display_order: v.weightGrams
    }));
      
    const cat = inMemoryStore.categories.get(p.category_id);
    return {
      ...p,
      is_eggless: true,
      is_pure_ghee: Boolean(p.pure_ghee),
      is_bestseller: Boolean(p.is_bestseller),
      is_featured: Boolean(p.is_featured),
      badge_label: p.badge_label || null,
      variants: mappedVariants,
      images: [
        {
          id: `img-${p.id}`,
          product_id: p.id,
          image_url: p.image_url,
          alt_text: p.name,
          is_primary: true,
          display_order: 1,
        },
      ],
      category: cat || null,
    };
  });
  
  res.json({ products: populatedProducts });
});


// ==========================================================
// 1. OFFERS & PROMOTIONS (PUBLIC)
// ==========================================================
router.get('/offers', (_req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const offers = Array.from(inMemoryStore.offers.values())
    .filter((o) => o.is_active)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  res.json({ offers });
});

// ==========================================================
// 2. HERO & PROMOTIONAL BANNERS (PUBLIC)
// ==========================================================
router.get('/banners', (_req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const banners = Array.from(inMemoryStore.banners.values())
    .filter((b) => b.is_active)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  res.json({ banners });
});

// ==========================================================
// 3. GIFT HAMPERS (PUBLIC)
// ==========================================================
router.get('/hampers', (_req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const hampers = Array.from(inMemoryStore.giftHampers.values())
    .filter((h) => h.is_active)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  res.json({ hampers });
});

router.get('/hampers/:idOrSlug', (req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const { idOrSlug } = req.params;
  const hamper =
    inMemoryStore.giftHampers.get(idOrSlug) ||
    Array.from(inMemoryStore.giftHampers.values()).find(
      (h) => h.id === idOrSlug || h.slug === idOrSlug
    );

  if (!hamper || !hamper.is_active) {
    res.status(404).json({ error: 'HAMPER_NOT_FOUND', message: 'Gift hamper not found or inactive.' });
    return;
  }

  res.json({ hamper });
});

// ==========================================================
// 4. REVIEWS (STRICT: ONLY VERIFIED DELIVERED PURCHASERS)
// ==========================================================

/**
 * GET /api/products/:productId/reviews
 * Returns only APPROVED reviews for public display + aggregate ratings
 */

/**
 * GET /api/reviews
 * Returns the latest globally approved reviews for the homepage
 */
router.get('/reviews', (req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const globalReviews = Array.from(inMemoryStore.reviews.values())
    .filter((r) => r.is_approved)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10); // get top 10 latest reviews

  res.json({ reviews: globalReviews });
});

router.get('/products/:productId/reviews', (req, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const { productId } = req.params;

  const productReviews = Array.from(inMemoryStore.reviews.values())
    .filter((r) => r.product_id === productId && r.is_approved)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalReviews = productReviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

  res.json({
    reviews: productReviews,
    totalReviews,
    averageRating,
  });
});

/**
 * GET /api/products/:productId/review-eligibility
 * Checks if the logged-in user has a DELIVERED order containing this product
 */
router.get(
  '/products/:productId/review-eligibility',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.params;
    const user = req.user!;

    // Search user's orders for status === 'DELIVERED' and item matching productId
    const deliveredOrders = Array.from(inMemoryStore.orders.values()).filter((order) => {
      const isUserOrder =
        order.user_id === user.id ||
        (user.phone && order.guest_phone === user.phone) ||
        (user.email && order.guest_email === user.email);

      if (!isUserOrder) return false;
      if (order.status !== 'DELIVERED') return false;

      return order.items.some((item) => item.product_id === productId);
    });

    // Check if user already submitted a review
    const existingReview = Array.from(inMemoryStore.reviews.values()).find(
      (r) => r.product_id === productId && r.user_id === user.id
    );

    if (deliveredOrders.length === 0) {
      res.json({
        canReview: false,
        reason: 'Reviews are available exclusively to verified customers who have a delivered order containing this sweet.',
      });
      return;
    }

    if (existingReview) {
      res.json({
        canReview: false,
        alreadyReviewed: true,
        isApproved: existingReview.is_approved,
        reason: existingReview.is_approved
          ? 'You have already reviewed this product.'
          : 'Your review has been submitted and is awaiting admin approval.',
      });
      return;
    }

    res.json({
      canReview: true,
      deliveredOrderId: deliveredOrders[0].id,
      deliveredOrderNumber: deliveredOrders[0].order_number,
    });
  }
);

/**
 * POST /api/products/:productId/reviews
 * Submits review. Strictly rejects users without a DELIVERED order containing the product!
 * Review is unpublished (is_approved: false) until admin approves.
 */
router.post(
  '/products/:productId/reviews',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ error: 'INVALID_RATING', message: 'Rating must be between 1 and 5 stars.' });
      return;
    }

    if (!comment || comment.trim().length < 5) {
      res.status(400).json({ error: 'INVALID_COMMENT', message: 'Please share at least a few words about your experience.' });
      return;
    }

    // STRICT CHECK: DELIVERED order check
    const deliveredOrder = Array.from(inMemoryStore.orders.values()).find((order) => {
      const isUserOrder =
        order.user_id === user.id ||
        (user.phone && order.guest_phone === user.phone) ||
        (user.email && order.guest_email === user.email);

      if (!isUserOrder) return false;
      if (order.status !== 'DELIVERED') return false;

      return order.items.some((item) => item.product_id === productId);
    });

    if (!deliveredOrder) {
      res.status(403).json({
        error: 'REVIEW_NOT_PERMITTED',
        message: 'Only customers who have received a DELIVERED order containing this sweet may leave a review.',
      });
      return;
    }

    // Find product name
    const product = inMemoryStore.products.get(productId);
    const productName = product?.name || deliveredOrder.items.find((i) => i.product_id === productId)?.product_name || 'Mithai';

    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newReview: ServerReview = {
      id: reviewId,
      product_id: productId,
      product_name: productName,
      order_id: deliveredOrder.id,
      user_id: user.id,
      user_name: user.full_name || 'Verified Customer',
      rating: Number(rating),
      comment: comment.trim(),
      is_approved: false, // Unpublished until admin approves
      created_at: new Date().toISOString(),
    };

    inMemoryStore.reviews.set(reviewId, newReview);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your authentic review has been recorded and will appear on the store once approved by our team.',
      review: newReview,
    });
  }
);

// ==========================================================
// 5. BULK / CORPORATE / WEDDING ENQUIRIES (PUBLIC)
// ==========================================================
router.post('/enquiries', async (req, res: Response) => {
  const {
    contact_name,
    organization_name,
    phone,
    email,
    event_type = 'WEDDING',
    event_date,
    estimated_guests,
    estimated_quantity_kg,
    budget_range,
    delivery_address,
    requested_sweets,
    notes,
  } = req.body;

  if (!contact_name || !phone || !event_date) {
    res.status(400).json({
      error: 'MISSING_FIELDS',
      message: 'Contact name, phone number, and event date are required.',
    });
    return;
  }

  const cleanPhone = String(phone).trim();
  const id = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const enquiryNumber = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();

  const newEnquiry: ServerBulkEnquiry = {
    id,
    enquiry_number: enquiryNumber,
    contact_name: String(contact_name).trim(),
    organization_name: organization_name ? String(organization_name).trim() : undefined,
    phone: cleanPhone,
    email: email ? String(email).trim() : undefined,
    event_type: event_type || 'WEDDING',
    event_date: String(event_date),
    estimated_guests: estimated_guests ? Number(estimated_guests) : undefined,
    estimated_quantity_kg: estimated_quantity_kg ? Number(estimated_quantity_kg) : undefined,
    budget_range: budget_range ? String(budget_range) : undefined,
    delivery_address: delivery_address ? String(delivery_address) : undefined,
    requested_sweets: requested_sweets ? String(requested_sweets) : undefined,
    notes: notes ? String(notes) : undefined,
    status: 'NEW',
    created_at: nowIso,
    updated_at: nowIso,
  };

  inMemoryStore.bulkEnquiries.set(id, newEnquiry);

  // Dispatch transactional notification to Store Owner + Confirmation email to customer
  notifyNewBulkEnquiry(newEnquiry).catch((err) =>
    console.error('[Bulk Enquiry Notification Error]:', err)
  );

  res.status(201).json({
    success: true,
    message: `Thank you! Your bulk enquiry (${enquiryNumber}) has been received. Our team will contact you shortly on ${cleanPhone}.`,
    enquiry: newEnquiry,
  });
});

// ==========================================================
// 6. IN-APP NOTIFICATIONS
// ==========================================================
router.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

  // Customer sees notifications targeted to their user ID or phone. Admin also sees 'ADMIN' and 'ALL'
  const notifs = inMemoryStore.notifications.filter((n) => {
    if (isAdmin && (n.user_id === 'ADMIN' || n.user_id === 'STORE_OWNER' || n.user_id === 'ALL')) {
      return true;
    }
    return n.user_id === user.id || (user.phone && n.user_id === user.phone);
  });

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  res.json({
    notifications: notifs.slice(0, 50),
    unreadCount,
  });
});

router.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const notif = inMemoryStore.notifications.find((n) => n.id === id);

  if (notif) {
    notif.is_read = true;
  }

  res.json({ success: true, message: 'Notification marked as read.' });
});

router.patch('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

  inMemoryStore.notifications.forEach((n) => {
    const isTarget =
      n.user_id === user.id ||
      (user.phone && n.user_id === user.phone) ||
      (isAdmin && (n.user_id === 'ADMIN' || n.user_id === 'STORE_OWNER'));
    if (isTarget) {
      n.is_read = true;
    }
  });

  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
