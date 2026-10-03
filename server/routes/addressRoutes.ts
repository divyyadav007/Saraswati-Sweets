import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../authMiddleware';
import {
  SERVICEABLE_PINCODES,
  inMemoryStore,
  ServerAddress,
  supabaseServer,
  isLiveSupabase,
} from '../db';

const router = Router();

// GET /api/addresses - List user's saved addresses
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  if (isLiveSupabase && supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('addresses')
        .select('*')
        .eq('profile_id', userId)
        .order('is_default', { ascending: false });

      if (!error && data) {
        res.json({ addresses: data });
        return;
      }
    } catch (err) {
      console.warn('Supabase fetch addresses warning:', err);
    }
  }

  // In-memory fallback
  const userAddresses = Array.from(inMemoryStore.addresses.values())
    .filter((a) => a.profile_id === userId)
    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));

  res.json({ addresses: userAddresses });
});

// POST /api/addresses - Add new address with strict pincode serviceability check
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    label = 'Home',
    recipient_name,
    recipient_phone,
    street_address,
    landmark,
    city = 'Barabanki',
    state = 'Uttar Pradesh',
    pincode,
    is_default = false,
  } = req.body;

  // Validation
  if (!recipient_name || !recipient_phone || !street_address || !pincode) {
    res.status(400).json({
      error: 'MISSING_FIELDS',
      message: 'Recipient name, phone, street address, and pincode are required.',
    });
    return;
  }

  const cleanPincode = String(pincode).trim();

  // Strict pincode check against Barabanki store settings
  if (!SERVICEABLE_PINCODES.includes(cleanPincode)) {
    res.status(400).json({
      error: 'PINCODE_NOT_SERVICEABLE',
      message: `Pincode ${cleanPincode} is outside our current fresh delivery zone. Saraswati Sweets delivers to Barabanki pincodes: ${SERVICEABLE_PINCODES.join(', ')}.`,
      allowedPincodes: SERVICEABLE_PINCODES,
    });
    return;
  }

  const id = `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newAddress: ServerAddress = {
    id,
    profile_id: userId,
    label,
    recipient_name,
    recipient_phone,
    street_address,
    landmark: landmark || undefined,
    city,
    state,
    pincode: cleanPincode,
    is_default: Boolean(is_default),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If set to default, clear other defaults
  if (newAddress.is_default) {
    for (const [addrId, addr] of inMemoryStore.addresses.entries()) {
      if (addr.profile_id === userId) {
        inMemoryStore.addresses.set(addrId, { ...addr, is_default: false });
      }
    }
  }

  if (isLiveSupabase && supabaseServer) {
    try {
      if (newAddress.is_default) {
        await supabaseServer
          .from('addresses')
          .update({ is_default: false })
          .eq('profile_id', userId);
      }

      const { data, error } = await supabaseServer
        .from('addresses')
        .insert([newAddress])
        .select()
        .single();

      if (!error && data) {
        inMemoryStore.addresses.set(data.id, data as ServerAddress);
        res.status(201).json({ success: true, address: data });
        return;
      }
    } catch (err) {
      console.warn('Supabase add address warning:', err);
    }
  }

  inMemoryStore.addresses.set(id, newAddress);
  res.status(201).json({ success: true, address: newAddress });
});

// PUT /api/addresses/:id - Edit address with pincode verification
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const {
    label,
    recipient_name,
    recipient_phone,
    street_address,
    landmark,
    city,
    state,
    pincode,
    is_default,
  } = req.body;

  let existing = inMemoryStore.addresses.get(id);

  if (pincode) {
    const cleanPincode = String(pincode).trim();
    if (!SERVICEABLE_PINCODES.includes(cleanPincode)) {
      res.status(400).json({
        error: 'PINCODE_NOT_SERVICEABLE',
        message: `Pincode ${cleanPincode} is not serviceable. Available in: ${SERVICEABLE_PINCODES.join(', ')}.`,
        allowedPincodes: SERVICEABLE_PINCODES,
      });
      return;
    }
  }

  if (is_default) {
    for (const [addrId, addr] of inMemoryStore.addresses.entries()) {
      if (addr.profile_id === userId) {
        inMemoryStore.addresses.set(addrId, { ...addr, is_default: false });
      }
    }
  }

  const updatedAddress: ServerAddress = {
    ...(existing || {
      id,
      profile_id: userId,
      city: 'Barabanki',
      state: 'Uttar Pradesh',
      created_at: new Date().toISOString(),
    }),
    label: label !== undefined ? label : existing?.label || 'Home',
    recipient_name: recipient_name !== undefined ? recipient_name : existing?.recipient_name || '',
    recipient_phone: recipient_phone !== undefined ? recipient_phone : existing?.recipient_phone || '',
    street_address: street_address !== undefined ? street_address : existing?.street_address || '',
    landmark: landmark !== undefined ? landmark : existing?.landmark,
    city: city || existing?.city || 'Barabanki',
    state: state || existing?.state || 'Uttar Pradesh',
    pincode: pincode ? String(pincode).trim() : existing?.pincode || '225001',
    is_default: is_default !== undefined ? Boolean(is_default) : existing?.is_default || false,
    updated_at: new Date().toISOString(),
  };

  inMemoryStore.addresses.set(id, updatedAddress);

  if (isLiveSupabase && supabaseServer) {
    try {
      await supabaseServer
        .from('addresses')
        .update(updatedAddress)
        .eq('id', id)
        .eq('profile_id', userId);
    } catch (err) {
      console.warn('Supabase update address warning:', err);
    }
  }

  res.json({ success: true, address: updatedAddress });
});

// DELETE /api/addresses/:id - Delete/soft-delete address
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  inMemoryStore.addresses.delete(id);

  if (isLiveSupabase && supabaseServer) {
    try {
      await supabaseServer
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('profile_id', userId);
    } catch (err) {
      console.warn('Supabase delete address warning:', err);
    }
  }

  res.json({ success: true, message: 'Address removed successfully' });
});

// POST /api/addresses/:id/default - Set default address
router.post('/:id/default', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  for (const [addrId, addr] of inMemoryStore.addresses.entries()) {
    if (addr.profile_id === userId) {
      inMemoryStore.addresses.set(addrId, { ...addr, is_default: addrId === id });
    }
  }

  if (isLiveSupabase && supabaseServer) {
    try {
      await supabaseServer.from('addresses').update({ is_default: false }).eq('profile_id', userId);
      await supabaseServer.from('addresses').update({ is_default: true }).eq('id', id).eq('profile_id', userId);
    } catch (err) {
      console.warn('Supabase set default address warning:', err);
    }
  }

  res.json({ success: true, message: 'Default address updated' });
});

export default router;
