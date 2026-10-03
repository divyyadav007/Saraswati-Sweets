import dotenv from 'dotenv';
import {
  ServerOrder,
  ServerBulkEnquiry,
  ServerNotification,
  ServerProfile,
  STORE_SETTINGS,
  inMemoryStore,
} from '../db';

dotenv.config();

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  isPromotional?: boolean;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

/**
 * Service Interface for Transactional & Promotional Email Delivery
 */
export interface IEmailProvider {
  sendEmail(message: EmailMessage, recipientProfile?: ServerProfile): Promise<EmailSendResult>;
}

/**
 * Documented Interface Stub: Firebase Cloud Messaging (FCM) Mobile Push Service
 * Note: FCM mobile push is out of scope for the web build; documented interface stub provided.
 */
export interface IFcmPushService {
  /**
   * Dispatches push message to an individual Android/iOS device token.
   */
  sendPushNotification(
    deviceToken: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /**
   * Broadcasts push message to an FCM topic (e.g. 'store-announcements').
   */
  sendTopicNotification(
    topic: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class FcmPushNotificationStub implements IFcmPushService {
  async sendPushNotification(
    deviceToken: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ) {
    console.log(
      `[FCM Mobile Push Stub] Dispatched to device ${deviceToken.slice(0, 10)}...: ${payload.title} - ${payload.body}`
    );
    return { success: true, messageId: `fcm_stub_${Date.now()}` };
  }

  async sendTopicNotification(
    topic: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ) {
    console.log(
      `[FCM Mobile Push Stub] Dispatched to topic '${topic}': ${payload.title} - ${payload.body}`
    );
    return { success: true, messageId: `fcm_topic_${Date.now()}` };
  }
}

/**
 * Resend Email Provider with Respect for Promotional Opt-Out & Never Blocking Transactional
 */
export class ResendEmailProvider implements IEmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'Saraswati Sweets <order@saraswatisweets.in>';
  }

  async sendEmail(message: EmailMessage, recipientProfile?: ServerProfile): Promise<EmailSendResult> {
    // 1. Check Promotional Opt-out (transactional never blocked!)
    if (message.isPromotional) {
      if (recipientProfile && recipientProfile.promotional_emails_opt_in === false) {
        console.log(`[Email Service] Promotional email skipped for ${message.to}: User opted out.`);
        return {
          success: false,
          skipped: true,
          reason: 'Promotional communications opted out by user profile.',
        };
      }
    }

    // 2. If live Resend API key is present and not placeholder, call Resend API
    if (this.apiKey && !this.apiKey.includes('placeholder') && this.apiKey.startsWith('re_')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text || undefined,
          }),
        });

        const data: any = await response.json();
        if (!response.ok) {
          console.warn('[Resend API Error]:', data);
          return { success: false, error: data.message || 'Resend API call failed' };
        }

        return { success: true, id: data.id };
      } catch (err: any) {
        console.error('[Resend Network Error]:', err.message);
        return { success: false, error: err.message };
      }
    }

    // 3. Fallback simulated transactional dispatch in test / dev mode
    const simulatedId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    console.log(`\n======================================================`);
    console.log(`[TRANSACTIONAL EMAIL DISPATCHED via Resend Provider]`);
    console.log(`ID:      ${simulatedId}`);
    console.log(`To:      ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Type:    ${message.isPromotional ? 'PROMOTIONAL' : 'TRANSACTIONAL (MANDATORY)'}`);
    console.log(`Preview: ${message.text || message.subject}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      id: simulatedId,
    };
  }
}

export const emailProvider: IEmailProvider = new ResendEmailProvider();
export const fcmPushStub: IFcmPushService = new FcmPushNotificationStub();

/**
 * Creates in-memory / in-app notification
 */
export function addInAppNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_PLACED' | 'ORDER_STATUS' | 'PAYMENT_FAILED' | 'ENQUIRY_RECEIVED' | 'PROMOTIONAL';
  metadata?: Record<string, any>;
}): ServerNotification {
  const notif: ServerNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    is_read: false,
    metadata: params.metadata,
    created_at: new Date().toISOString(),
  };

  inMemoryStore.notifications.unshift(notif);
  if (inMemoryStore.notifications.length > 500) {
    inMemoryStore.notifications.length = 500;
  }
  return notif;
}

/**
 * 1. Notify Order Placed (to Customer and Store Owner)
 */
export async function notifyOrderPlaced(order: ServerOrder): Promise<void> {
  const customerEmail =
    order.address_snapshot.recipient_phone ? `${order.address_snapshot.recipient_phone}@sms.saraswatisweets.in` : undefined;
  const targetEmail = order.guest_email || customerEmail || 'customer@saraswatisweets.in';
  const targetUserId = order.user_id || order.guest_phone || order.address_snapshot.recipient_phone;

  // In-app notification for Customer
  if (targetUserId) {
    addInAppNotification({
      userId: targetUserId,
      title: `Order #${order.order_number} Placed!`,
      message: `Your fresh mithai order of ₹${order.total_amount} has been confirmed for delivery on ${order.slot_snapshot.slot_date} (${order.slot_snapshot.start_time} - ${order.slot_snapshot.end_time}).`,
      type: 'ORDER_PLACED',
      metadata: { orderId: order.id, orderNumber: order.order_number, total: order.total_amount },
    });
  }

  // In-app notification for Store Owner / Admin
  addInAppNotification({
    userId: 'ADMIN',
    title: `New Order Received: #${order.order_number}`,
    message: `₹${order.total_amount} (${order.payment_method}) from ${order.address_snapshot.recipient_name} (${order.address_snapshot.recipient_phone}). Window: ${order.slot_snapshot.slot_date} ${order.slot_snapshot.start_time}`,
    type: 'ORDER_PLACED',
    metadata: { orderId: order.id, orderNumber: order.order_number, total: order.total_amount },
  });

  // Transactional Email to Customer
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e8dfd2;">
          <strong>${item.product_name}</strong> (${item.variant_label})
          ${item.item_type === 'HAMPER' ? '<span style="color:#8A1538; font-weight:bold;"> [GIFT HAMPER]</span>' : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e8dfd2; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e8dfd2; text-align: right;">₹${item.total_price}</td>
      </tr>
    `
    )
    .join('');

  await emailProvider.sendEmail({
    to: targetEmail,
    subject: `Order Confirmation #${order.order_number} - Saraswati Sweets (Barabanki)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F1B16;">
        <div style="background-color: #8A1538; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">Saraswati Sweets</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #F6E08B;">Pure Desi Ghee Mithai Since 1978 • Barabanki</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e8dfd2; border-top: none; border-radius: 0 0 8px 8px; background: #fff;">
          <h2 style="color: #8A1538; margin-top: 0;">Order #${order.order_number} Confirmed</h2>
          <p>Dear ${order.address_snapshot.recipient_name},</p>
          <p>Thank you for choosing Saraswati Sweets. Our master sweetmakers have begun preparing your fresh mithai with 100% cow desi ghee.</p>
          
          <div style="background-color: #fbf7f1; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Delivery Window:</strong> ${order.slot_snapshot.slot_date} (${order.slot_snapshot.start_time} - ${order.slot_snapshot.end_time})</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.address_snapshot.street_address}, Barabanki - ${order.address_snapshot.pincode}</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.payment_method} (${order.payment_status})</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <thead>
              <tr style="background: #f3ebe0;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              ${order.discount_amount > 0 ? `<tr><td colspan="2" style="padding: 8px; text-align: right; color: #2E7D4F;">Discount (${order.coupon_code || 'Promo'}):</td><td style="padding: 8px; text-align: right; color: #2E7D4F;">-₹${order.discount_amount}</td></tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; color: #8A1538;">₹${order.total_amount}</td>
              </tr>
            </tfoot>
          </table>
          <p style="font-size: 13px; color: #6b6258;">Need assistance? Call our Barabanki shop at ${STORE_SETTINGS.store_phone} or WhatsApp ${STORE_SETTINGS.whatsapp}.</p>
        </div>
      </div>
    `,
  });

  // Transactional Email to Store Owner
  await emailProvider.sendEmail({
    to: STORE_SETTINGS.store_email || 'order@saraswatisweets.in',
    subject: `[NEW ORDER ALERT] #${order.order_number} - ₹${order.total_amount} (${order.payment_method})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Order Received: #${order.order_number}</h2>
        <p><strong>Customer:</strong> ${order.address_snapshot.recipient_name} (${order.address_snapshot.recipient_phone})</p>
        <p><strong>Delivery Slot:</strong> ${order.slot_snapshot.slot_date} ${order.slot_snapshot.start_time} - ${order.slot_snapshot.end_time}</p>
        <p><strong>Address:</strong> ${order.address_snapshot.street_address}, Barabanki - ${order.address_snapshot.pincode}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${order.items.map((i) => `<li>${i.product_name} (${i.variant_label}) x ${i.quantity} = ₹${i.total_price}</li>`).join('')}
        </ul>
        <p><strong>Order Total:</strong> ₹${order.total_amount} [${order.payment_method} / ${order.payment_status}]</p>
      </div>
    `,
  });
}

/**
 * 2. Notify Order Status Changed (to Customer)
 */
export async function notifyOrderStatusChanged(
  order: ServerOrder,
  previousStatus: string,
  newStatus: string
): Promise<void> {
  const targetUserId = order.user_id || order.guest_phone || order.address_snapshot.recipient_phone;
  const targetEmail = order.guest_email || 'customer@saraswatisweets.in';

  const statusLabels: Record<string, string> = {
    CONFIRMED: 'Order Confirmed by Store',
    PREPARING: 'Freshly Cooking in Desi Ghee Kitchen',
    READY_FOR_PICKUP: 'Packaged & Ready for Dispatch',
    OUT_FOR_DELIVERY: `Out for Delivery ${order.delivery_partner_name ? `with ${order.delivery_partner_name}` : ''}`,
    DELIVERED: 'Delivered Fresh to Your Doorstep',
    CANCELLED: 'Order Cancelled',
    REFUNDED: 'Order Refund Processed',
  };

  const statusLabel = statusLabels[newStatus] || newStatus;

  // In-app notification
  if (targetUserId) {
    addInAppNotification({
      userId: targetUserId,
      title: `Order Update #${order.order_number}`,
      message: `Your order is now: ${statusLabel}.`,
      type: 'ORDER_STATUS',
      metadata: { orderId: order.id, orderNumber: order.order_number, from: previousStatus, to: newStatus },
    });
  }

  // Email notification
  await emailProvider.sendEmail({
    to: targetEmail,
    subject: `Order Update #${order.order_number}: ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8dfd2; border-radius: 8px;">
        <h2 style="color: #8A1538;">Order #${order.order_number} Update</h2>
        <p>Dear ${order.address_snapshot.recipient_name},</p>
        <p>Your order status has changed to: <strong>${statusLabel}</strong></p>
        ${
          order.delivery_partner_name
            ? `<div style="background: #fbf7f1; padding: 12px; border-radius: 6px; margin: 12px 0;">
                <p style="margin: 0;"><strong>Delivery Partner:</strong> ${order.delivery_partner_name} (${order.delivery_partner_phone || ''})</p>
               </div>`
            : ''
        }
        <p>Expected delivery window: ${order.slot_snapshot.slot_date} (${order.slot_snapshot.start_time} - ${order.slot_snapshot.end_time})</p>
        <p style="margin-top: 20px; font-size: 13px; color: #6B6258;">Thank you for trusting Saraswati Sweets (Barabanki).</p>
      </div>
    `,
  });
}

/**
 * 3. Notify Payment Failed (to Customer)
 */
export async function notifyPaymentFailed(order: ServerOrder, reason?: string): Promise<void> {
  const targetUserId = order.user_id || order.guest_phone || order.address_snapshot.recipient_phone;
  const targetEmail = order.guest_email || 'customer@saraswatisweets.in';

  if (targetUserId) {
    addInAppNotification({
      userId: targetUserId,
      title: `Payment Incomplete for #${order.order_number}`,
      message: `Online payment was not completed (${reason || 'Transaction timed out'}). Your sweets will be held for 15 minutes before the slot is released.`,
      type: 'PAYMENT_FAILED',
      metadata: { orderId: order.id, orderNumber: order.order_number },
    });
  }

  await emailProvider.sendEmail({
    to: targetEmail,
    subject: `Payment Incomplete for Order #${order.order_number} - Saraswati Sweets`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8dfd2; border-radius: 8px;">
        <h2 style="color: #B3261E;">Payment Could Not Be Completed</h2>
        <p>Dear ${order.address_snapshot.recipient_name},</p>
        <p>We noticed your online payment of ₹${order.total_amount} for order <strong>#${order.order_number}</strong> was not completed (${reason || 'Payment failed'}).</p>
        <p>Your selected delivery slot (${order.slot_snapshot.slot_date} ${order.slot_snapshot.start_time}) is reserved for 15 minutes. You can retry paying online or choose Cash on Delivery.</p>
        <p>If you need assistance, please call our Barabanki counter at ${STORE_SETTINGS.store_phone}.</p>
      </div>
    `,
  });
}

/**
 * 4. Notify New Bulk / Wedding Enquiry (to Customer & Store Owner)
 */
export async function notifyNewBulkEnquiry(enquiry: ServerBulkEnquiry): Promise<void> {
  // In-app notification for Store Owner
  addInAppNotification({
    userId: 'ADMIN',
    title: `New Bulk / Wedding Enquiry (${enquiry.enquiry_number})`,
    message: `${enquiry.contact_name} requested quote for ${enquiry.event_type} (${enquiry.estimated_quantity_kg || 50} kg sweets / ${enquiry.estimated_guests || 200} guests). Date: ${enquiry.event_date}`,
    type: 'ENQUIRY_RECEIVED',
    metadata: { enquiryId: enquiry.id, enquiryNumber: enquiry.enquiry_number },
  });

  // Email to Store Owner
  await emailProvider.sendEmail({
    to: STORE_SETTINGS.store_email || 'order@saraswatisweets.in',
    subject: `[NEW BULK ENQUIRY] ${enquiry.event_type} - ${enquiry.contact_name} (${enquiry.phone})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #8A1538;">New Bulk Mithai Enquiry: ${enquiry.enquiry_number}</h2>
        <p><strong>Name:</strong> ${enquiry.contact_name} ${enquiry.organization_name ? `(${enquiry.organization_name})` : ''}</p>
        <p><strong>Phone:</strong> <a href="tel:${enquiry.phone}">${enquiry.phone}</a></p>
        <p><strong>Email:</strong> ${enquiry.email || 'Not provided'}</p>
        <p><strong>Event Type:</strong> ${enquiry.event_type}</p>
        <p><strong>Target Date:</strong> ${enquiry.event_date}</p>
        <p><strong>Estimated Quantity:</strong> ${enquiry.estimated_quantity_kg ? `${enquiry.estimated_quantity_kg} kg` : 'Not specified'}</p>
        <p><strong>Estimated Guests:</strong> ${enquiry.estimated_guests || 'Not specified'}</p>
        <p><strong>Budget Range:</strong> ${enquiry.budget_range || 'Not specified'}</p>
        <p><strong>Delivery Address:</strong> ${enquiry.delivery_address || 'Barabanki'}</p>
        <p><strong>Requested Sweets:</strong> ${enquiry.requested_sweets || 'None'}</p>
        <p><strong>Client Notes:</strong> ${enquiry.notes || 'None'}</p>
      </div>
    `,
  });

  // Email to Customer (if email provided)
  if (enquiry.email) {
    await emailProvider.sendEmail({
      to: enquiry.email,
      subject: `Enquiry Received: Saraswati Sweets Bulk & Wedding Gifting (${enquiry.enquiry_number})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8dfd2; border-radius: 8px;">
          <h2 style="color: #8A1538;">Namaste ${enquiry.contact_name},</h2>
          <p>Thank you for reaching out to Saraswati Sweets (Barabanki) for your upcoming <strong>${enquiry.event_type}</strong> celebration on <strong>${enquiry.event_date}</strong>.</p>
          <p>Our senior order coordinator has received your enquiry (Ref: <strong>${enquiry.enquiry_number}</strong>) and will call you on <strong>${enquiry.phone}</strong> with wholesale bulk rates, custom box packaging choices, and complimentary sample tasting options.</p>
          <p>We look forward to sweetening your auspicious occasion with 100% pure cow desi ghee craftsmanship.</p>
          <p style="margin-top: 20px; font-size: 13px; color: #6B6258;">Saraswati Sweets • Saraswati Sweets, Indira Market, Begum Gunj, Barabanki, Uttar Pradesh 225001 • Tel: ${STORE_SETTINGS.store_phone}</p>
        </div>
      `,
    });
  }
}
