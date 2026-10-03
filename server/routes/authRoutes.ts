import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../authMiddleware';
import { supabaseServer, isLiveSupabase, inMemoryStore, ServerProfile } from '../db';

const router = Router();

// GET /api/auth/profile - Fetch current authenticated profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    profile: req.user,
  });
});

// PUT /api/auth/profile - Update user profile (name, phone)
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { full_name, phone } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  const cleanName = typeof full_name === 'string' ? full_name.trim() : '';
  if (cleanName) {
    req.user.full_name = cleanName;
  }

  if (typeof phone === 'string') {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length === 10) {
      req.user.phone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    }
  }

  req.user.updated_at = new Date().toISOString();

  // Save to in-memory store under canonical id and alias tokens
  inMemoryStore.profiles.set(req.user.id, req.user);
  if (req.user.phone) {
    const rawClean = req.user.phone.replace(/\D/g, '').slice(-10);
    
  }

  // Also sync to Supabase if live
  if (isLiveSupabase && supabaseServer) {
    try {
      await supabaseServer.from('profiles').upsert(req.user, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase profile update warning:', err);
    }
  }

  res.json({ success: true, profile: req.user });
});

// POST /api/auth/sync - Sync profile row on first login
router.post('/sync', async (req: AuthenticatedRequest, res: Response) => {
  const { id, email, phone, full_name, role } = req.body;

  if (!id) {
    res.status(400).json({ error: 'MISSING_ID', message: 'User ID is required' });
    return;
  }

  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
  const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : phone;

  const assignedRole = role || (email?.includes('admin') ? 'ADMIN' : email?.includes('staff') ? 'STAFF' : 'CUSTOMER');
  // Bug #2 Fix: Never generate a placeholder name.
  const displayName = full_name?.trim() || (email ? email.split('@')[0] : '');

  const profileData: ServerProfile = {
    id,
    email: email || undefined,
    phone: formattedPhone || undefined,
    full_name: displayName,
    role: assignedRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isLiveSupabase && supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        res.json({ success: true, profile: data });
        return;
      }
    } catch (err) {
      console.warn('Supabase profile sync warning:', err);
    }
  }

  // Sync to in-memory store
  inMemoryStore.profiles.set(id, profileData);
  if (cleanPhone) {
    
  }
  res.json({ success: true, profile: profileData });
});

// POST /api/auth/demo-login - Facilitates instant testing for both customer phone & admin credentials
router.post('/demo-login', async (req, res) => {
  const { phone, email, password } = req.body;

  if (email && password) {
    // Admin / Staff login
    if (email === 'admin@saraswatisweets.in' || email.includes('admin')) {
      let adminProfile = inMemoryStore.profiles.get('admin-default');
      if (!adminProfile) {
        adminProfile = {
          id: 'admin-default',
          email: 'admin@saraswatisweets.in',
          phone: '+919161110030',
          full_name: 'Shop Owner (Admin)',
          role: 'ADMIN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        inMemoryStore.profiles.set('admin-default', adminProfile);
      }
      const token = 'demo-admin-token';
      res.json({
        success: true,
        token,
        profile: adminProfile,
      });
      return;
    } else if (email === 'staff@saraswatisweets.in' || email.includes('staff')) {
      let staffProfile = inMemoryStore.profiles.get('staff-default');
      if (!staffProfile) {
        staffProfile = {
          id: 'staff-default',
          email: 'staff@saraswatisweets.in',
          phone: '+919450012346',
          full_name: 'Store Counter Staff',
          role: 'STAFF',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        inMemoryStore.profiles.set('staff-default', staffProfile);
      }
      const token = 'demo-staff-token';
      res.json({
        success: true,
        token,
        profile: staffProfile,
      });
      return;
    } else {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      return;
    }
  }

  if (phone) {
    // Customer phone login
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      res.status(400).json({ error: 'INVALID_PHONE', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    
    const formattedPhoneToSearch = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    let userId: any = randomUUID();
    let isRealUser = false;
    if (isLiveSupabase && supabaseServer) {
      const { data } = await supabaseServer.from('profiles').select('id').eq('phone', formattedPhoneToSearch).maybeSingle();
      if (data) {
        userId = data.id;
        isRealUser = true;
      } else {
        const { data: authData, error: authErr } = await supabaseServer.auth.admin.createUser({
          phone: formattedPhoneToSearch,
          phone_confirm: true,
          user_metadata: { full_name: req.body.full_name || '' }
        });
        if (authData?.user) {
          userId = authData.user.id;
          isRealUser = true;
        } else {
          console.error('Failed to create mock user in Supabase auth:', authErr);
        }
      }
    } else {
      const existingUser = Array.from(inMemoryStore.profiles.values()).find(p => p.phone === formattedPhoneToSearch || p.phone === cleanPhone);
      userId = existingUser ? existingUser.id : randomUUID();
    }

    const token = isRealUser ? `dev-user-${userId}` : `dev-user-${cleanPhone}`;
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    const providedName = (req.body.full_name && typeof req.body.full_name === 'string' && req.body.full_name.trim()) || '';

    // Check if profile exists under canonical ID or token
    let profile = inMemoryStore.profiles.get(userId) || inMemoryStore.profiles.get(token);

    if (!profile) {
      profile = {
        id: userId,
        phone: formattedPhone,
        // Bug #2 Fix: Never generate a placeholder name. If no real name provided, store empty string.
        // This ensures the checkout recipient name field stays blank, not pre-filled with "Patron XXXX".
        full_name: providedName || '',
        role: 'CUSTOMER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // If user provides a real full name, update it!
      if (providedName) {
        profile.full_name = providedName;
      }
      profile.phone = formattedPhone;
      profile.updated_at = new Date().toISOString();
    }

    // Persist under both keys so lookups never fail
    inMemoryStore.profiles.set(userId, profile);
    inMemoryStore.profiles.set(token, profile);

    res.json({
      success: true,
      token,
      profile,
    });
    return;
  }

  res.status(400).json({ error: 'BAD_REQUEST', message: 'Provide either phone or email credentials' });
});

export default router;
