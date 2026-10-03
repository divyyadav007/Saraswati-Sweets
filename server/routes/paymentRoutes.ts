import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import {
  inMemoryStore,
  ServerPayment,
  ServerOrder,
  expireUnpaidOrders,
} from '../db';
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../services/razorpayService';
import {
  notifyOrderPlaced,
  notifyPaymentFailed,
} from '../services/notificationService';

const router = Router();

/**
 * POST /api/payments/verify
 * Recomputes HMAC_SHA256(order_id|payment_id, key_secret), constant-time compare, idempotent.
 */
router.post('/verify', async (req: Request, res: Response) => {
  const {
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({
      error: 'MISSING_PAYMENT_FIELDS',
      message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
    });
    return;
  }

  // 1. Recompute and verify HMAC signature with constant-time comparison
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    res.status(400).json({
      error: 'INVALID_PAYMENT_SIGNATURE',
      message: 'Payment verification failed: signature mismatch or tampering detected.',
    });
    return;
  }

  // 2. Find local order
  let order: ServerOrder | undefined = undefined;
  if (order_id) {
    order = inMemoryStore.orders.get(order_id);
  }
  if (!order) {
    order = Array.from(inMemoryStore.orders.values()).find(
      (o) => o.razorpay_order_id === razorpay_order_id
    );
  }

  if (!order) {
    res.status(404).json({
      error: 'ORDER_NOT_FOUND',
      message: `No local order found for Razorpay order ${razorpay_order_id}`,
    });
    return;
  }

  // 3. Idempotent check: if already verified and marked completed
  if (order.payment_status === 'COMPLETED' && order.status !== 'PENDING_PAYMENT') {
    res.status(200).json({
      success: true,
      idempotent: true,
      message: 'Payment already verified for this order.',
      order,
    });
    return;
  }

  // 4. Update order status to PLACED and mark payment COMPLETED
  const nowIso = new Date().toISOString();
  order.status = 'PLACED';
  order.payment_status = 'COMPLETED';
  order.razorpay_payment_id = razorpay_payment_id;
  order.paid_at = nowIso;
  order.updated_at = nowIso;
  inMemoryStore.orders.set(order.id, order);

  // Trigger Transactional Notifications (Customer email + In-app + Store Owner alert)
  notifyOrderPlaced(order).catch((err) =>
    console.error('[Notify Order Placed Error on Verify]:', err)
  );

  // 5. Record Payment Snapshot in payments store
  const paymentRecord: ServerPayment = {
    id: randomUUID(),
    order_id: order.id,
    order_number: order.order_number,
    razorpay_order_id,
    razorpay_payment_id,
    amount: Math.round(order.total_amount * 100),
    currency: 'INR',
    status: 'CAPTURED',
    method: 'ONLINE',
    created_at: nowIso,
    updated_at: nowIso,
  };
  inMemoryStore.payments.set(paymentRecord.id, paymentRecord);

  res.status(200).json({
    success: true,
    message: 'Online payment verified successfully! Sweets preparation has begun.',
    order,
  });
});

/**
 * POST /api/payments/webhook/razorpay
 * Verifies X-Razorpay-Signature over RAW body with webhook secret.
 * Handles payment.captured, payment.failed, refund.processed idempotently. Webhook is source of truth.
 */
router.post('/webhook/razorpay', async (req: Request, res: Response) => {
  const signatureHeader = (req.headers['x-razorpay-signature'] ||
    req.headers['X-Razorpay-Signature']) as string;

  if (!signatureHeader) {
    res.status(400).json({
      error: 'MISSING_SIGNATURE_HEADER',
      message: 'Header X-Razorpay-Signature is required.',
    });
    return;
  }

  // Retrieve raw request body for exact cryptographic comparison
  const rawBody: Buffer | string = (req as any).rawBody || JSON.stringify(req.body);

  // 1. Verify HMAC-SHA256 signature with constant-time equality
  const isValid = verifyWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    res.status(400).json({
      error: 'INVALID_WEBHOOK_SIGNATURE',
      message: 'Webhook signature validation failed. Event rejected.',
    });
    return;
  }

  const payload = req.body;
  const event = payload?.event;
  const eventId =
    payload?.id ||
    `${event}_${payload?.payload?.payment?.entity?.id || payload?.payload?.refund?.entity?.id || Date.now()}`;

  // 2. Idempotency Guard: prevent duplicate effects on retries
  if (inMemoryStore.processedWebhookEvents.has(eventId)) {
    res.status(200).json({
      status: 'already_processed',
      message: `Webhook event ${eventId} was already processed.`,
    });
    return;
  }

  inMemoryStore.processedWebhookEvents.add(eventId);

  // 3. Process event types (Webhook is the ultimate source of truth)
  const nowIso = new Date().toISOString();

  if (event === 'payment.captured') {
    const paymentEntity = payload.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const razorpayOrderId = paymentEntity?.order_id;
    const orderId = paymentEntity?.notes?.order_id;

    // Find order
    let order = orderId ? inMemoryStore.orders.get(orderId) : undefined;
    if (!order && razorpayOrderId) {
      order = Array.from(inMemoryStore.orders.values()).find(
        (o) => o.razorpay_order_id === razorpayOrderId
      );
    }

    if (order) {
      if (order.status === 'PENDING_PAYMENT' || order.payment_status !== 'COMPLETED') {
        order.status = 'PLACED';
        order.payment_status = 'COMPLETED';
        order.razorpay_payment_id = paymentId;
        order.paid_at = nowIso;
        order.updated_at = nowIso;
        inMemoryStore.orders.set(order.id, order);

        notifyOrderPlaced(order).catch((err) =>
          console.error('[Notify Order Placed Error on Webhook]:', err)
        );
      }

      // Record / Update payment
      if (paymentId) {
        const paymentRecord: ServerPayment = {
          id: randomUUID(),
          order_id: order.id,
          order_number: order.order_number,
          razorpay_order_id: razorpayOrderId || order.razorpay_order_id || '',
          razorpay_payment_id: randomUUID(),
          amount: paymentEntity?.amount || Math.round(order.total_amount * 100),
          currency: paymentEntity?.currency || 'INR',
          status: 'CAPTURED',
          method: paymentEntity?.method || 'ONLINE',
          created_at: nowIso,
          updated_at: nowIso,
        };
        inMemoryStore.payments.set(paymentRecord.id, paymentRecord);
      }
    }
  } else if (event === 'payment.failed') {
    const paymentEntity = payload.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const razorpayOrderId = paymentEntity?.order_id;
    const orderId = paymentEntity?.notes?.order_id;

    let order = orderId ? inMemoryStore.orders.get(orderId) : undefined;
    if (!order && razorpayOrderId) {
      order = Array.from(inMemoryStore.orders.values()).find(
        (o) => o.razorpay_order_id === razorpayOrderId
      );
    }

    if (order) {
      if (order.status === 'PENDING_PAYMENT') {
        order.status = 'PAYMENT_FAILED';
        order.payment_status = 'FAILED';
        order.updated_at = nowIso;

        // Release slot capacity on failure
        const slot = inMemoryStore.deliverySlots.get(order.slot_id);
        if (slot && slot.booked_count > 0) {
          slot.booked_count -= 1;
          inMemoryStore.deliverySlots.set(slot.id, slot);
        }

        inMemoryStore.orders.set(order.id, order);

        notifyPaymentFailed(
          order,
          paymentEntity?.error_description || 'Bank transaction declined'
        ).catch((err) => console.error('[Notify Payment Failed Error]:', err));
      }

      if (paymentId) {
        const paymentRecord: ServerPayment = {
          id: randomUUID(),
          order_id: order.id,
          order_number: order.order_number,
          razorpay_order_id: razorpayOrderId || '',
          razorpay_payment_id: randomUUID(),
          amount: paymentEntity?.amount || Math.round(order.total_amount * 100),
          currency: paymentEntity?.currency || 'INR',
          status: 'FAILED',
          error_code: paymentEntity?.error_code,
          error_description: paymentEntity?.error_description,
          created_at: nowIso,
          updated_at: nowIso,
        };
        inMemoryStore.payments.set(paymentRecord.id, paymentRecord);
      }
    }
  } else if (event === 'refund.processed') {
    const refundEntity = payload.payload?.refund?.entity;
    const refundId = refundEntity?.id;
    const paymentId = refundEntity?.payment_id;

    // Find order by razorpay_payment_id
    const order = Array.from(inMemoryStore.orders.values()).find(
      (o) => o.razorpay_payment_id === paymentId
    );

    if (order) {
      order.status = 'REFUNDED';
      order.payment_status = 'REFUNDED';
      order.razorpay_refund_id = refundId;
      order.refunded_at = nowIso;
      order.updated_at = nowIso;
      inMemoryStore.orders.set(order.id, order);

      // Update payment record
      if (paymentId && inMemoryStore.payments.has(paymentId)) {
        const payment = inMemoryStore.payments.get(paymentId)!;
        payment.status = 'REFUNDED';
        payment.refund_id = refundId;
        payment.refund_amount = refundEntity?.amount;
        payment.updated_at = nowIso;
        inMemoryStore.payments.set(paymentId, payment);
      }
    }
  }

  res.status(200).json({
    status: 'ok',
    event,
    eventId,
    processed: true,
  });
});

/**
 * POST /api/payments/expire-check
 * Triggered check to clean up unpaid orders older than 15 minutes
 */
router.post('/expire-check', (_req: Request, res: Response) => {
  const expiredCount = expireUnpaidOrders();
  res.json({
    success: true,
    expiredCount,
    message: `Expired ${expiredCount} unpaid orders past the 15-minute window.`,
  });
});

export default router;
