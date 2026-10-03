import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabase = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabaseServer: SupabaseClient | null = isLiveSupabase
  ? createClient(supabaseUrl as string, supabaseServiceKey as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Product variants master list with official prices from Barabanki store (matches seed.sql)
export interface MasterVariant {
  id: string;
  productId: string;
  productName: string;
  label: string;
  weightGrams: number;
  price: number;
  mrp: number;
  imageUrl: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockQuantity: number;
}

export const MASTER_VARIANTS: MasterVariant[] = [
  // Signature Kaju Katli
  {
    id: 'v-kk-250',
    productId: 'prod-kaju-katli',
    productName: 'Signature Silver Leaf Kaju Katli',
    label: '250g',
    weightGrams: 250,
    price: 260,
    mrp: 280,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 100,
  },
  {
    id: 'v-kk-500',
    productId: 'prod-kaju-katli',
    productName: 'Signature Silver Leaf Kaju Katli',
    label: '500g',
    weightGrams: 500,
    price: 510,
    mrp: 550,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 75,
  },
  {
    id: 'v-kk-1kg',
    productId: 'prod-kaju-katli',
    productName: 'Signature Silver Leaf Kaju Katli',
    label: '1 kg Box',
    weightGrams: 1000,
    price: 990,
    mrp: 1080,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 40,
  },

  // Pure Shuddh Ghee Motichoor Ladoo
  {
    id: 'v-ml-250',
    productId: 'prod-motichoor-ladoo',
    productName: 'Pure Shuddh Ghee Motichoor Ladoo',
    label: '250g',
    weightGrams: 250,
    price: 175,
    mrp: 190,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 120,
  },
  {
    id: 'v-ml-500',
    productId: 'prod-motichoor-ladoo',
    productName: 'Pure Shuddh Ghee Motichoor Ladoo',
    label: '500g',
    weightGrams: 500,
    price: 340,
    mrp: 370,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 85,
  },
  {
    id: 'v-ml-1kg',
    productId: 'prod-motichoor-ladoo',
    productName: 'Pure Shuddh Ghee Motichoor Ladoo',
    label: '1 kg Box',
    weightGrams: 1000,
    price: 660,
    mrp: 720,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 50,
  },

  // Royal Saffron Gulab Jamun
  {
    id: 'v-gj-500',
    productId: 'prod-gulab-jamun',
    productName: 'Royal Saffron Gulab Jamun',
    label: '500g (Approx 8 pcs)',
    weightGrams: 500,
    price: 240,
    mrp: 260,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 60,
  },
  {
    id: 'v-gj-1kg',
    productId: 'prod-gulab-jamun',
    productName: 'Royal Saffron Gulab Jamun',
    label: '1 kg (Approx 16 pcs)',
    weightGrams: 1000,
    price: 460,
    mrp: 500,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 40,
  },

  // Awadhi Desi Ghee Besan Ladoo
  {
    id: 'v-bl-250',
    productId: 'prod-besan-ladoo',
    productName: 'Awadhi Desi Ghee Besan Ladoo',
    label: '250g',
    weightGrams: 250,
    price: 180,
    mrp: 200,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 90,
  },
  {
    id: 'v-bl-500',
    productId: 'prod-besan-ladoo',
    productName: 'Awadhi Desi Ghee Besan Ladoo',
    label: '500g',
    weightGrams: 500,
    price: 350,
    mrp: 390,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 60,
  },
  {
    id: 'v-bl-1kg',
    productId: 'prod-besan-ladoo',
    productName: 'Awadhi Desi Ghee Besan Ladoo',
    label: '1 kg Box',
    weightGrams: 1000,
    price: 680,
    mrp: 750,
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 35,
  },

  // Mathura Style Roasted Peda
  {
    id: 'v-mp-250',
    productId: 'prod-mathura-peda',
    productName: 'Mathura Style Roasted Peda',
    label: '250g',
    weightGrams: 250,
    price: 160,
    mrp: 180,
    imageUrl: 'https://images.unsplash.com/photo-1601050690113-1ec941ea624b?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 80,
  },
  {
    id: 'v-mp-500',
    productId: 'prod-mathura-peda',
    productName: 'Mathura Style Roasted Peda',
    label: '500g',
    weightGrams: 500,
    price: 310,
    mrp: 350,
    imageUrl: 'https://images.unsplash.com/photo-1601050690113-1ec941ea624b?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 55,
  },

  // Kolkata Style Spongy Rasgulla
  {
    id: 'v-rg-500',
    productId: 'prod-rasgulla',
    productName: 'Kolkata Style Spongy Rasgulla',
    label: '500g (Approx 6 pcs)',
    weightGrams: 500,
    price: 190,
    mrp: 210,
    imageUrl: 'https://images.unsplash.com/photo-1616031037011-087000171abe?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 50,
  },
  {
    id: 'v-rg-1kg',
    productId: 'prod-rasgulla',
    productName: 'Kolkata Style Spongy Rasgulla',
    label: '1 kg (Approx 12 pcs)',
    weightGrams: 1000,
    price: 360,
    mrp: 400,
    imageUrl: 'https://images.unsplash.com/photo-1616031037011-087000171abe?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 30,
  },

  // Awadhi Shahi Dalmoth
  {
    id: 'v-dm-250',
    productId: 'prod-dalmoth',
    productName: 'Awadhi Shahi Dalmoth Mixture',
    label: '250g Pouch',
    weightGrams: 250,
    price: 130,
    mrp: 145,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 120,
  },
  {
    id: 'v-dm-500',
    productId: 'prod-dalmoth',
    productName: 'Awadhi Shahi Dalmoth Mixture',
    label: '500g Pouch',
    weightGrams: 500,
    price: 250,
    mrp: 280,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 90,
  },

  // Crispy Ajwain Mathri
  {
    id: 'v-mt-400',
    productId: 'prod-mathri',
    productName: 'Crispy Ajwain Khasta Mathri',
    label: '400g Box',
    weightGrams: 400,
    price: 150,
    mrp: 170,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 80,
  },

  // Royal Gift Hampers
  {
    id: 'hamper-var-hamper-awadh-darbar',
    productId: 'hamper-awadh-darbar',
    productName: 'The Awadh Darbar Royal Hamper',
    label: 'Embossed Silk Gold Trunk Box',
    weightGrams: 1000,
    price: 1450,
    mrp: 1650,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 25,
  },
  {
    id: 'hamper-var-hamper-utsav-casket',
    productId: 'hamper-utsav-casket',
    productName: 'Utsav Mithai & Dry Fruits Casket',
    label: 'Maroon & Gold Velvet Box',
    weightGrams: 1000,
    price: 1150,
    mrp: 1300,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'IN_STOCK',
    stockQuantity: 30,
  },
  { id: 'v-mini-samosa-250', productId: 'prod-mini-samosa', productName: 'Mini Samosa', label: '250g', weightGrams: 250, price: 170, mrp: 170, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-samosa-500', productId: 'prod-mini-samosa', productName: 'Mini Samosa', label: '500g', weightGrams: 500, price: 340, mrp: 340, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-samosa-1kg', productId: 'prod-mini-samosa', productName: 'Mini Samosa', label: '1kg', weightGrams: 1000, price: 680, mrp: 680, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-khasta-250', productId: 'prod-mini-khasta', productName: 'Mini Khasta', label: '250g', weightGrams: 250, price: 170, mrp: 170, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-khasta-500', productId: 'prod-mini-khasta', productName: 'Mini Khasta', label: '500g', weightGrams: 500, price: 340, mrp: 340, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-khasta-1kg', productId: 'prod-mini-khasta', productName: 'Mini Khasta', label: '1kg', weightGrams: 1000, price: 680, mrp: 680, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-plain-mathri-250', productId: 'prod-plain-mathri', productName: 'Plain Mathri', label: '250g', weightGrams: 250, price: 170, mrp: 170, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-plain-mathri-500', productId: 'prod-plain-mathri', productName: 'Plain Mathri', label: '500g', weightGrams: 500, price: 340, mrp: 340, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-plain-mathri-1kg', productId: 'prod-plain-mathri', productName: 'Plain Mathri', label: '1kg', weightGrams: 1000, price: 680, mrp: 680, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-mathri-250', productId: 'prod-achari-mathri', productName: 'Achari Mathri', label: '250g', weightGrams: 250, price: 180, mrp: 180, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-mathri-500', productId: 'prod-achari-mathri', productName: 'Achari Mathri', label: '500g', weightGrams: 500, price: 360, mrp: 360, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-mathri-1kg', productId: 'prod-achari-mathri', productName: 'Achari Mathri', label: '1kg', weightGrams: 1000, price: 720, mrp: 720, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-samosa-250', productId: 'prod-achari-samosa', productName: 'Achari Samosa', label: '250g', weightGrams: 250, price: 190, mrp: 190, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-samosa-500', productId: 'prod-achari-samosa', productName: 'Achari Samosa', label: '500g', weightGrams: 500, price: 380, mrp: 380, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-achari-samosa-1kg', productId: 'prod-achari-samosa', productName: 'Achari Samosa', label: '1kg', weightGrams: 1000, price: 760, mrp: 760, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-samosa-250', productId: 'prod-mewa-samosa', productName: 'Mewa Samosa', label: '250g', weightGrams: 250, price: 190, mrp: 190, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-samosa-500', productId: 'prod-mewa-samosa', productName: 'Mewa Samosa', label: '500g', weightGrams: 500, price: 380, mrp: 380, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-samosa-1kg', productId: 'prod-mewa-samosa', productName: 'Mewa Samosa', label: '1kg', weightGrams: 1000, price: 760, mrp: 760, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-masoor-dalmoth-250', productId: 'prod-masoor-dalmoth', productName: 'Masoor Dalmoth', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-masoor-dalmoth-500', productId: 'prod-masoor-dalmoth', productName: 'Masoor Dalmoth', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-masoor-dalmoth-1kg', productId: 'prod-masoor-dalmoth', productName: 'Masoor Dalmoth', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pudina-mixture-250', productId: 'prod-pudina-mixture', productName: 'Pudina Mixture', label: '250g', weightGrams: 250, price: 225, mrp: 225, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pudina-mixture-500', productId: 'prod-pudina-mixture', productName: 'Pudina Mixture', label: '500g', weightGrams: 500, price: 450, mrp: 450, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pudina-mixture-1kg', productId: 'prod-pudina-mixture', productName: 'Pudina Mixture', label: '1kg', weightGrams: 1000, price: 900, mrp: 900, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-dalmoth-250', productId: 'prod-kaju-dalmoth', productName: 'Kaju Dalmoth', label: '250g', weightGrams: 250, price: 300, mrp: 300, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-dalmoth-500', productId: 'prod-kaju-dalmoth', productName: 'Kaju Dalmoth', label: '500g', weightGrams: 500, price: 600, mrp: 600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-dalmoth-1kg', productId: 'prod-kaju-dalmoth', productName: 'Kaju Dalmoth', label: '1kg', weightGrams: 1000, price: 1200, mrp: 1200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-sev-besan-250', productId: 'prod-sev-besan', productName: 'Sev (Besan)', label: '250g', weightGrams: 250, price: 150, mrp: 150, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-sev-besan-500', productId: 'prod-sev-besan', productName: 'Sev (Besan)', label: '500g', weightGrams: 500, price: 300, mrp: 300, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-sev-besan-1kg', productId: 'prod-sev-besan', productName: 'Sev (Besan)', label: '1kg', weightGrams: 1000, price: 600, mrp: 600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-ganthe-250', productId: 'prod-ganthe', productName: 'Ganthe', label: '250g', weightGrams: 250, price: 150, mrp: 150, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-ganthe-500', productId: 'prod-ganthe', productName: 'Ganthe', label: '500g', weightGrams: 500, price: 300, mrp: 300, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-ganthe-1kg', productId: 'prod-ganthe', productName: 'Ganthe', label: '1kg', weightGrams: 1000, price: 600, mrp: 600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kalash-250', productId: 'prod-kaju-kalash', productName: 'Kaju Kalash', label: '250g', weightGrams: 250, price: 375, mrp: 375, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kalash-500', productId: 'prod-kaju-kalash', productName: 'Kaju Kalash', label: '500g', weightGrams: 500, price: 750, mrp: 750, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kalash-1kg', productId: 'prod-kaju-kalash', productName: 'Kaju Kalash', label: '1kg', weightGrams: 1000, price: 1500, mrp: 1500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kesar-250', productId: 'prod-kaju-kesar', productName: 'Kaju Kesar', label: '250g', weightGrams: 250, price: 375, mrp: 375, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kesar-500', productId: 'prod-kaju-kesar', productName: 'Kaju Kesar', label: '500g', weightGrams: 500, price: 750, mrp: 750, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-kesar-1kg', productId: 'prod-kaju-kesar', productName: 'Kaju Kesar', label: '1kg', weightGrams: 1000, price: 1500, mrp: 1500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pista-roll-250', productId: 'prod-pista-roll', productName: 'Pista Roll', label: '250g', weightGrams: 250, price: 500, mrp: 500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pista-roll-500', productId: 'prod-pista-roll', productName: 'Pista Roll', label: '500g', weightGrams: 500, price: 1000, mrp: 1000, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pista-roll-1kg', productId: 'prod-pista-roll', productName: 'Pista Roll', label: '1kg', weightGrams: 1000, price: 2000, mrp: 2000, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-dry-fruit-laddoo-250', productId: 'prod-dry-fruit-laddoo', productName: 'Dry Fruit Laddoo', label: '250g', weightGrams: 250, price: 375, mrp: 375, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-dry-fruit-laddoo-500', productId: 'prod-dry-fruit-laddoo', productName: 'Dry Fruit Laddoo', label: '500g', weightGrams: 500, price: 750, mrp: 750, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-dry-fruit-laddoo-1kg', productId: 'prod-dry-fruit-laddoo', productName: 'Dry Fruit Laddoo', label: '1kg', weightGrams: 1000, price: 1500, mrp: 1500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-badam-sugarfree-250', productId: 'prod-badam-sugarfree', productName: 'Badam Sugarfree', label: '250g', weightGrams: 250, price: 375, mrp: 375, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-badam-sugarfree-500', productId: 'prod-badam-sugarfree', productName: 'Badam Sugarfree', label: '500g', weightGrams: 500, price: 750, mrp: 750, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-badam-sugarfree-1kg', productId: 'prod-badam-sugarfree', productName: 'Badam Sugarfree', label: '1kg', weightGrams: 1000, price: 1500, mrp: 1500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-sugarfree-250', productId: 'prod-anjeer-sugarfree', productName: 'Anjeer Sugarfree', label: '250g', weightGrams: 250, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-sugarfree-500', productId: 'prod-anjeer-sugarfree', productName: 'Anjeer Sugarfree', label: '500g', weightGrams: 500, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-sugarfree-1kg', productId: 'prod-anjeer-sugarfree', productName: 'Anjeer Sugarfree', label: '1kg', weightGrams: 1000, price: 1600, mrp: 1600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-king-250', productId: 'prod-anjeer-king', productName: 'Anjeer King', label: '250g', weightGrams: 250, price: 450, mrp: 450, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-king-500', productId: 'prod-anjeer-king', productName: 'Anjeer King', label: '500g', weightGrams: 500, price: 900, mrp: 900, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-anjeer-king-1kg', productId: 'prod-anjeer-king', productName: 'Anjeer King', label: '1kg', weightGrams: 1000, price: 1800, mrp: 1800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-bite-250', productId: 'prod-mewa-bite', productName: 'Mewa Bite', label: '250g', weightGrams: 250, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-bite-500', productId: 'prod-mewa-bite', productName: 'Mewa Bite', label: '500g', weightGrams: 500, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-bite-1kg', productId: 'prod-mewa-bite', productName: 'Mewa Bite', label: '1kg', weightGrams: 1000, price: 1600, mrp: 1600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-gujiya-250', productId: 'prod-kaju-gujiya', productName: 'Kaju Gujiya', label: '250g', weightGrams: 250, price: 375, mrp: 375, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-gujiya-500', productId: 'prod-kaju-gujiya', productName: 'Kaju Gujiya', label: '500g', weightGrams: 500, price: 750, mrp: 750, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-gujiya-1kg', productId: 'prod-kaju-gujiya', productName: 'Kaju Gujiya', label: '1kg', weightGrams: 1000, price: 1500, mrp: 1500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-peda-250', productId: 'prod-kaju-peda', productName: 'Kaju Peda', label: '250g', weightGrams: 250, price: 350, mrp: 350, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-peda-500', productId: 'prod-kaju-peda', productName: 'Kaju Peda', label: '500g', weightGrams: 500, price: 700, mrp: 700, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-peda-1kg', productId: 'prod-kaju-peda', productName: 'Kaju Peda', label: '1kg', weightGrams: 1000, price: 1400, mrp: 1400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-barfi-without-silver-leaf-250', productId: 'prod-kaju-barfi-without-silver-leaf', productName: 'Kaju Barfi (without Silver Leaf)', label: '250g', weightGrams: 250, price: 350, mrp: 350, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-barfi-without-silver-leaf-500', productId: 'prod-kaju-barfi-without-silver-leaf', productName: 'Kaju Barfi (without Silver Leaf)', label: '500g', weightGrams: 500, price: 700, mrp: 700, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kaju-barfi-without-silver-leaf-1kg', productId: 'prod-kaju-barfi-without-silver-leaf', productName: 'Kaju Barfi (without Silver Leaf)', label: '1kg', weightGrams: 1000, price: 1400, mrp: 1400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-choco-white-250', productId: 'prod-choco-white', productName: 'Choco White', label: '250g', weightGrams: 250, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-choco-white-500', productId: 'prod-choco-white', productName: 'Choco White', label: '500g', weightGrams: 500, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-choco-white-1kg', productId: 'prod-choco-white', productName: 'Choco White', label: '1kg', weightGrams: 1000, price: 1600, mrp: 1600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-orange-white-250', productId: 'prod-orange-white', productName: 'Orange White', label: '250g', weightGrams: 250, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-orange-white-500', productId: 'prod-orange-white', productName: 'Orange White', label: '500g', weightGrams: 500, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-orange-white-1kg', productId: 'prod-orange-white', productName: 'Orange White', label: '1kg', weightGrams: 1000, price: 1600, mrp: 1600, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-baklava-250', productId: 'prod-baklava', productName: 'Baklava', label: '250g', weightGrams: 250, price: 500, mrp: 500, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-baklava-500', productId: 'prod-baklava', productName: 'Baklava', label: '500g', weightGrams: 500, price: 1000, mrp: 1000, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-baklava-1kg', productId: 'prod-baklava', productName: 'Baklava', label: '1kg', weightGrams: 1000, price: 2000, mrp: 2000, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chandrakala-250', productId: 'prod-chandrakala', productName: 'Chandrakala', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chandrakala-500', productId: 'prod-chandrakala', productName: 'Chandrakala', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chandrakala-1kg', productId: 'prod-chandrakala', productName: 'Chandrakala', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-barfi-250', productId: 'prod-batisa-barfi', productName: 'Batisa Barfi', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-barfi-500', productId: 'prod-batisa-barfi', productName: 'Batisa Barfi', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-barfi-1kg', productId: 'prod-batisa-barfi', productName: 'Batisa Barfi', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-gol-batisa-250', productId: 'prod-gol-batisa', productName: 'Gol Batisa', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-gol-batisa-500', productId: 'prod-gol-batisa', productName: 'Gol Batisa', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-gol-batisa-1kg', productId: 'prod-gol-batisa', productName: 'Gol Batisa', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-lal-peda-250', productId: 'prod-lal-peda', productName: 'Lal Peda', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-lal-peda-500', productId: 'prod-lal-peda', productName: 'Lal Peda', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-lal-peda-1kg', productId: 'prod-lal-peda', productName: 'Lal Peda', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kesariya-peda-250', productId: 'prod-kesariya-peda', productName: 'Kesariya Peda', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kesariya-peda-500', productId: 'prod-kesariya-peda', productName: 'Kesariya Peda', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kesariya-peda-1kg', productId: 'prod-kesariya-peda', productName: 'Kesariya Peda', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-katli-250', productId: 'prod-khoya-katli', productName: 'Khoya Katli', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-katli-500', productId: 'prod-khoya-katli', productName: 'Khoya Katli', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-katli-1kg', productId: 'prod-khoya-katli', productName: 'Khoya Katli', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-balushahi-250', productId: 'prod-mini-balushahi', productName: 'Mini Balushahi', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-balushahi-500', productId: 'prod-mini-balushahi', productName: 'Mini Balushahi', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mini-balushahi-1kg', productId: 'prod-mini-balushahi', productName: 'Mini Balushahi', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-laddu-250', productId: 'prod-mewa-laddu', productName: 'Mewa Laddu', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-laddu-500', productId: 'prod-mewa-laddu', productName: 'Mewa Laddu', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-laddu-1kg', productId: 'prod-mewa-laddu', productName: 'Mewa Laddu', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-gilori-250', productId: 'prod-khoya-gilori', productName: 'Khoya Gilori', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-gilori-500', productId: 'prod-khoya-gilori', productName: 'Khoya Gilori', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-gilori-1kg', productId: 'prod-khoya-gilori', productName: 'Khoya Gilori', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-doda-barfi-250', productId: 'prod-doda-barfi', productName: 'Doda Barfi', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-doda-barfi-500', productId: 'prod-doda-barfi', productName: 'Doda Barfi', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-doda-barfi-1kg', productId: 'prod-doda-barfi', productName: 'Doda Barfi', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-magdal-250', productId: 'prod-magdal', productName: 'Magdal', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-magdal-500', productId: 'prod-magdal', productName: 'Magdal', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-magdal-1kg', productId: 'prod-magdal', productName: 'Magdal', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-barfi-250', productId: 'prod-milk-barfi', productName: 'Milk Barfi', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-barfi-500', productId: 'prod-milk-barfi', productName: 'Milk Barfi', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-barfi-1kg', productId: 'prod-milk-barfi', productName: 'Milk Barfi', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-motichur-laddu-250', productId: 'prod-mewa-motichur-laddu', productName: 'Mewa Motichur Laddu', label: '250g', weightGrams: 250, price: 225, mrp: 225, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-motichur-laddu-500', productId: 'prod-mewa-motichur-laddu', productName: 'Mewa Motichur Laddu', label: '500g', weightGrams: 500, price: 450, mrp: 450, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-mewa-motichur-laddu-1kg', productId: 'prod-mewa-motichur-laddu', productName: 'Mewa Motichur Laddu', label: '1kg', weightGrams: 1000, price: 900, mrp: 900, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-soonth-laddu-250', productId: 'prod-soonth-laddu', productName: 'Soonth Laddu', label: '250g', weightGrams: 250, price: 225, mrp: 225, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-soonth-laddu-500', productId: 'prod-soonth-laddu', productName: 'Soonth Laddu', label: '500g', weightGrams: 500, price: 450, mrp: 450, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-soonth-laddu-1kg', productId: 'prod-soonth-laddu', productName: 'Soonth Laddu', label: '1kg', weightGrams: 1000, price: 900, mrp: 900, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-churma-laddu-250', productId: 'prod-churma-laddu', productName: 'Churma Laddu', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-churma-laddu-500', productId: 'prod-churma-laddu', productName: 'Churma Laddu', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-churma-laddu-1kg', productId: 'prod-churma-laddu', productName: 'Churma Laddu', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chocolate-biscuit-250', productId: 'prod-chocolate-biscuit', productName: 'Chocolate Biscuit', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chocolate-biscuit-500', productId: 'prod-chocolate-biscuit', productName: 'Chocolate Biscuit', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-chocolate-biscuit-1kg', productId: 'prod-chocolate-biscuit', productName: 'Chocolate Biscuit', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-laddu-250', productId: 'prod-batisa-laddu', productName: 'Batisa Laddu', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-laddu-500', productId: 'prod-batisa-laddu', productName: 'Batisa Laddu', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-batisa-laddu-1kg', productId: 'prod-batisa-laddu', productName: 'Batisa Laddu', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-karachi-halwa-250', productId: 'prod-karachi-halwa', productName: 'Karachi Halwa', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-karachi-halwa-500', productId: 'prod-karachi-halwa', productName: 'Karachi Halwa', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-karachi-halwa-1kg', productId: 'prod-karachi-halwa', productName: 'Karachi Halwa', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pinni-250', productId: 'prod-pinni', productName: 'Pinni', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pinni-500', productId: 'prod-pinni', productName: 'Pinni', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-pinni-1kg', productId: 'prod-pinni', productName: 'Pinni', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kala-jam-250', productId: 'prod-kala-jam', productName: 'Kala Jam', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kala-jam-500', productId: 'prod-kala-jam', productName: 'Kala Jam', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-kala-jam-1kg', productId: 'prod-kala-jam', productName: 'Kala Jam', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-cake-250', productId: 'prod-milk-cake', productName: 'Milk Cake', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-cake-500', productId: 'prod-milk-cake', productName: 'Milk Cake', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-milk-cake-1kg', productId: 'prod-milk-cake', productName: 'Milk Cake', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-nariyal-barfi-coconut-barfi-250', productId: 'prod-nariyal-barfi-coconut-barfi', productName: 'Nariyal Barfi (Coconut Barfi)', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-nariyal-barfi-coconut-barfi-500', productId: 'prod-nariyal-barfi-coconut-barfi', productName: 'Nariyal Barfi (Coconut Barfi)', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-nariyal-barfi-coconut-barfi-1kg', productId: 'prod-nariyal-barfi-coconut-barfi', productName: 'Nariyal Barfi (Coconut Barfi)', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-kalakand-250', productId: 'prod-khoya-kalakand', productName: 'Khoya Kalakand', label: '250g', weightGrams: 250, price: 200, mrp: 200, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-kalakand-500', productId: 'prod-khoya-kalakand', productName: 'Khoya Kalakand', label: '500g', weightGrams: 500, price: 400, mrp: 400, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
  { id: 'v-khoya-kalakand-1kg', productId: 'prod-khoya-kalakand', productName: 'Khoya Kalakand', label: '1kg', weightGrams: 1000, price: 800, mrp: 800, imageUrl: '', stockStatus: 'IN_STOCK', stockQuantity: 50 },
];

export const SERVICEABLE_PINCODES = ['225001', '225002', '225003', '225122'];
export const STORE_SETTINGS = {
  store_name: 'Saraswati Sweets',
  tagline: 'Pure Desi Ghee Mithai & Artisanal Namkeen Since 1978',
  store_phone: '+91 91611 10030',
  whatsapp: '+91 91611 10030',
  store_email: 'order@saraswatisweets.in',
  address_text: 'Saraswati Sweets, Indira Market, Begum Gunj, Barabanki, Uttar Pradesh 225001, Uttar Pradesh 225001',
  delivery_charge: 40,
  free_delivery_above: 499,
  cod_limit_amount: 2000,
  tax_rate_percent: 5,
  serviceable_pincodes: SERVICEABLE_PINCODES,
};

// In-Memory store for fast fallback & local development sync
export interface ServerProfile {
  id: string;
  phone?: string;
  email?: string;
  full_name?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  promotional_emails_opt_in?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerAddress {
  id: string;
  profile_id: string;
  label: string; // 'Home', 'Office', 'Other'
  recipient_name: string;
  recipient_phone: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerDeliverySlot {
  id: string;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "10:00"
  end_time: string; // e.g. "13:00"
  capacity: number;
  booked_count: number;
  cutoff_at: string; // ISO string
  status: string;
}

export interface ServerCoupon {
  id: string;
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  min_order_value: number;
  max_discount_amount?: number;
  is_active: boolean;
  start_date: string;
  valid_until: string;
  total_limit?: number; // Total redemptions across store
  per_user_limit?: number; // Redemptions per user/phone
  used_count: number;
}

export interface ServerCouponUsage {
  id: string;
  coupon_id: string;
  coupon_code: string;
  order_id: string;
  user_id?: string;
  phone?: string;
  discount_amount: number;
  created_at: string;
}

export interface ServerOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
  item_type?: 'PRODUCT' | 'HAMPER';
  hamper_details?: {
    box_type?: string;
    items_included?: Array<{ product_name: string; variant_label: string; quantity: number }>;
  };
}

export interface ServerOffer {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  coupon_code?: string;
  discount_text: string;
  badge?: string;
  bg_color?: string;
  image_url?: string;
  is_active: boolean;
  valid_until?: string;
  display_order: number;
  created_at: string;
}

export interface ServerBanner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  badge?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ServerReview {
  id: string;
  product_id: string;
  product_name: string;
  order_id: string;
  user_id?: string;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  is_approved: boolean; // unpublished until admin approves
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ServerHamperItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_label: string;
  quantity: number;
}

export interface ServerGiftHamper {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  box_type: string;
  price: number;
  mrp: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  items_included: ServerHamperItem[];
  created_at: string;
  updated_at: string;
}

export type BulkEnquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';

export interface ServerBulkEnquiry {
  id: string;
  enquiry_number: string;
  contact_name: string;
  organization_name?: string;
  phone: string;
  email?: string;
  event_type: 'WEDDING' | 'CORPORATE' | 'FESTIVE_BULK' | 'CUSTOM_EVENT';
  event_date: string;
  estimated_guests?: number;
  estimated_quantity_kg?: number;
  budget_range?: string;
  delivery_address?: string;
  requested_sweets?: string;
  notes?: string;
  admin_notes?: string;
  status: BulkEnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface ServerNotification {
  id: string;
  user_id: string; // 'ADMIN', 'STORE_OWNER', or profile_id
  title: string;
  message: string;
  type: 'ORDER_PLACED' | 'ORDER_STATUS' | 'PAYMENT_FAILED' | 'ENQUIRY_RECEIVED' | 'PROMOTIONAL';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ServerPayment {
  id: string;
  order_id: string;
  order_number: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number; // in paise
  currency: string;
  status: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  method?: string;
  error_code?: string;
  error_description?: string;
  refund_id?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'
  | 'REFUNDED';

export interface ServerOrder {
  id: string;
  order_number: string;
  user_id?: string;
  guest_phone?: string;
  guest_email?: string;
  address_snapshot: ServerAddress;
  delivery_slot_id: string;
  slot_snapshot: {
    slot_date: string;
    start_time: string;
    end_time: string;
  };
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  delivery_charge: number;
  tax_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: 'COD' | 'ONLINE';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_refund_id?: string;
  refund_reason?: string;
  special_instructions?: string;
  packaging_notes?: string;
  idempotency_key: string;
  placed_at: string;
  paid_at?: string;
  expires_at?: string;
  confirmed_at?: string;
  preparing_at?: string;
  ready_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
  items: ServerOrderItem[];
  delivery_partner_id?: string;
  delivery_partner_name?: string;
  delivery_partner_phone?: string;
  assigned_at?: string;
}

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PLACED', 'PAYMENT_FAILED', 'CANCELLED'],
  PLACED: ['CONFIRMED', 'CANCELLED', 'REFUNDED'],
  CONFIRMED: ['PREPARING', 'CANCELLED', 'REFUNDED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED', 'REFUNDED'],
  READY_FOR_PICKUP: ['OUT_FOR_DELIVERY', 'CANCELLED', 'REFUNDED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  PAYMENT_FAILED: [],
  REFUNDED: [],
};

// Generate initial delivery slots for today and next 7 days
function generateInitialSlots(): Map<string, ServerDeliverySlot> {
  const map = new Map<string, ServerDeliverySlot>();
  const templates = [
    { start: '10:00', end: '13:00', label: 'Morning Slot (10 AM - 1 PM)', cutoffHours: 2 },
    { start: '14:00', end: '17:00', label: 'Afternoon Slot (2 PM - 5 PM)', cutoffHours: 2 },
    { start: '18:00', end: '21:00', label: 'Evening Slot (6 PM - 9 PM)', cutoffHours: 2 },
  ];

  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    templates.forEach((tmpl, idx) => {
      const slotId = `slot-${dateStr}-${tmpl.start.replace(':', '')}`;
      // Cutoff time: slot date at start_time minus cutoffHours
      const cutoffDate = new Date(`${dateStr}T${tmpl.start}:00Z`);
      cutoffDate.setHours(cutoffDate.getHours() - tmpl.cutoffHours);

      map.set(slotId, {
        id: slotId,
        slot_date: dateStr,
        start_time: tmpl.start,
        end_time: tmpl.end,
        capacity: 30,
        booked_count: i === 0 && idx === 0 ? 30 : (i * 3 + idx) % 7, // Demo slot 1 full to test disabled UI
        cutoff_at: cutoffDate.toISOString(),
        status: 'ACTIVE',
      });
    });
  }
  return map;
}

export interface ServerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface ServerProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  image_url: string;
  pure_ghee: boolean;
  shelf_life_days: number;
  is_active: boolean;
  ingredients: string;
  is_bestseller?: boolean;
  is_featured?: boolean;
  badge_label?: string;
}

export interface ServerDeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  status: 'AVAILABLE' | 'ON_DELIVERY' | 'OFF_DUTY';
  current_assigned_orders: number;
  created_at: string;
}

export interface ServerAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ServerStoreSettings {
  store_name: string;
  tagline: string;
  store_phone: string;
  whatsapp: string;
  store_email: string;
  address_text: string;
  delivery_charge_flat: number;
  free_delivery_above: number;
  cod_limit_amount: number;
  tax_rate_percent: number;
  opening_time: string;
  closing_time: string;
  is_store_open: boolean;
  serviceable_pincodes: string[];
}


// ==========================================================
// SUPABASE SYNC MAP (Write-Through Cache)
// ==========================================================
export function toUUID(str: string): string {
  if (!str || typeof str !== 'string') return str;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str; 
  }
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(15, 18)}-${hash.slice(18, 30)}`;
}

export const inMemoryStore = {
  profiles: new Map<string, ServerProfile>(),
  addresses: new Map<string, ServerAddress>(),
  userCarts: new Map<string, Map<string, number>>(), // profileId -> (variantId -> quantity)
  deliverySlots: generateInitialSlots(),
  orders: new Map<string, ServerOrder>(),
  ordersByIdempotency: new Map<string, ServerOrder>(),
  payments: new Map<string, ServerPayment>(), // razorpay_payment_id or razorpay_order_id -> payment
  processedWebhookEvents: new Set<string>(), // event_id -> deduplication
  categories: new Map<string, ServerCategory>([
    [
      '687913b9-108c-49e3-94e1-c255718415a5',
      {
        id: '687913b9-108c-49e3-94e1-c255718415a5',
        name: 'Desi Ghee Sweets',
        slug: 'desi-ghee-sweets',
        description: 'Handcrafted in 100% pure cow desi ghee with heritage Awadhi recipes.',
        image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
        display_order: 1,
        is_active: true,
      },
    ],
    [
      'c1000000-0000-0000-0000-000000000002',
      {
        id: 'c1000000-0000-0000-0000-000000000002',
        name: 'Kaju & Dry Fruit Specials',
        slug: 'kaju-dry-fruits',
        description: 'Finest Mangalore cashews and dry-fruit confections adorned with silver foil.',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        display_order: 2,
        is_active: true,
      },
    ],
    [
      'c1000000-0000-0000-0000-000000000003',
      {
        id: 'c1000000-0000-0000-0000-000000000003',
        name: 'Chhena & Syrupy Delights',
        slug: 'chhena-syrupy',
        description: 'Fresh cow milk chhena sweets steeped in fragrant rose and saffron nectars.',
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
        display_order: 3,
        is_active: true,
      },
    ],
    [
      '284272ed-691e-4720-ba2b-11a711478638',
      {
        id: '284272ed-691e-4720-ba2b-11a711478638',
        name: 'Khoya & Mawa Specials',
        slug: 'khoya-mawa',
        description: 'Slow-roasted condensed buffalo milk peda and burfis from Barabanki.',
        image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
        display_order: 4,
        is_active: true,
      },
    ],
    [
      'c1000000-0000-0000-0000-000000000005',
      {
        id: 'c1000000-0000-0000-0000-000000000005',
        name: 'Artisanal Namkeen & Savories',
        slug: 'namkeen-savories',
        description: 'Crispy mathri, spicy dalmoth, and salted treats roasted in pure oils.',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        display_order: 5,
        is_active: true,
      },
    ],
    [
      'c1000000-0000-0000-0000-000000000004',
      {
        id: 'c1000000-0000-0000-0000-000000000004',
        name: 'Festive Hampers & Gift Trunks',
        slug: 'gift-hampers',
        description: 'Royal velvet and gold-embossed gift boxes curated for Diwali, Weddings, and Celebrations.',
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        display_order: 6,
        is_active: true,
      },
    ],
    ['c1000000-0000-0000-0000-000000000005', { id: 'c1000000-0000-0000-0000-000000000005', name: 'Namkeen & Snacks', slug: 'namkeen-snacks', description: 'A crisp, savory selection of traditional namkeen and snacks.', image_url: '', display_order: 7, is_active: true }],
    ['c1000000-0000-0000-0000-000000000002', { id: 'c1000000-0000-0000-0000-000000000002', name: 'Dry Fruit Sweets', slug: 'dry-fruit-sweets', description: 'Premium dry fruit sweets.', image_url: '', display_order: 4, is_active: true }],
    ['883ae551-dee9-47e0-84e3-651883073ccb', { id: '883ae551-dee9-47e0-84e3-651883073ccb', name: 'Specialty Sweets', slug: 'specialty-sweets', description: 'Specialty sweets.', image_url: '', display_order: 5, is_active: true }],
    ['c1000000-0000-0000-0000-000000000001', { id: 'c1000000-0000-0000-0000-000000000001', name: 'Traditional Mithai', slug: 'traditional-mithai', description: 'Traditional mithai.', image_url: '', display_order: 6, is_active: true }],
  ]),
  products: new Map<string, ServerProduct>([
    [
      'prod-kaju-katli',
      {
        id: 'prod-kaju-katli',
        name: 'Signature Silver Leaf Kaju Katli',
        slug: 'signature-kaju-katli',
        description: 'Velvety smooth cashew diamond fudge crafted from first-grade Goan cashews.',
        category_id: 'c1000000-0000-0000-0000-000000000002',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        pure_ghee: true,
        shelf_life_days: 20,
        is_active: true,
        ingredients: 'Cashew nuts, Sugar, Edible Silver Leaf (Vark), Cardamom',
        is_bestseller: true,
        is_featured: true,
        badge_label: 'Shop Pride',
      },
    ],
    [
      'prod-motichoor-ladoo',
      {
        id: 'prod-motichoor-ladoo',
        name: 'Pure Shuddh Ghee Motichoor Ladoo',
        slug: 'shuddh-ghee-motichoor-ladoo',
        description: 'Melt-in-mouth tiny gram flour pearls fried in 100% cow desi ghee.',
        category_id: '687913b9-108c-49e3-94e1-c255718415a5',
        image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
        pure_ghee: true,
        shelf_life_days: 7,
        is_active: true,
        ingredients: 'Besan (Gram Flour), Pure Desi Ghee, Sugar, Saffron, Magaz Seeds',
        is_bestseller: true,
        is_featured: true,
        badge_label: 'Bestseller',
      },
    ],
    [
      'prod-malai-peda',
      {
        id: 'prod-malai-peda',
        name: 'Kesar Malai Peda',
        slug: 'kesar-malai-peda',
        description: 'Traditional slow-reduced milk khoya infused with Kashmiri saffron and pistachios.',
        category_id: '284272ed-691e-4720-ba2b-11a711478638',
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
        pure_ghee: false,
        shelf_life_days: 5,
        is_active: true,
        ingredients: 'Pure Khoya, Milk, Sugar, Kashmiri Kesar, Pistachio Slivers',
        is_bestseller: false,
        is_featured: true,
        badge_label: 'Royal Treat',
      },
    ],
    [
      'prod-besan-ladoo',
      {
        id: 'prod-besan-ladoo',
        name: 'Awadhi Desi Ghee Besan Ladoo',
        slug: 'desi-ghee-besan-ladoo',
        description: 'Coarsely milled organic gram flour roasted slowly until golden aromatic perfection.',
        category_id: '687913b9-108c-49e3-94e1-c255718415a5',
        image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
        pure_ghee: true,
        shelf_life_days: 21,
        is_active: true,
        ingredients: 'Chana Besan, Cow Desi Ghee, Bura Sugar, Almonds, Cardamom',
        is_bestseller: true,
        is_featured: false,
        badge_label: 'Heritage Recipe',
      },
    ],
    [
      'prod-mathura-peda',
      {
        id: 'prod-mathura-peda',
        name: 'Mathura Style Roasted Peda',
        slug: 'mathura-roasted-peda',
        description: 'Deep carmelized roasted mawa pedas coated with fine boora sugar.',
        category_id: '284272ed-691e-4720-ba2b-11a711478638',
        image_url: 'https://images.unsplash.com/photo-1601050690113-1ec941ea624b?auto=format&fit=crop&w=800&q=80',
        pure_ghee: true,
        shelf_life_days: 14,
        is_active: true,
        ingredients: 'Roasted Mawa, Desi Ghee, Boora, Jaiphal, Cardamom',
        is_bestseller: false,
        is_featured: true,
        badge_label: 'Vintage Awadh',
      },
    ],
    [
      'prod-rasgulla',
      {
        id: 'prod-rasgulla',
        name: 'Kolkata Style Spongy Rasgulla',
        slug: 'kolkata-spongy-rasgulla',
        description: 'Feather-soft fresh chhena balls simmered in light fragrant syrup.',
        category_id: 'c1000000-0000-0000-0000-000000000003',
        image_url: 'https://images.unsplash.com/photo-1616031037011-087000171abe?auto=format&fit=crop&w=800&q=80',
        pure_ghee: false,
        shelf_life_days: 3,
        is_active: true,
        ingredients: 'Fresh Cow Milk Chhena, Purified Water, Sugar, Rose Water',
        is_bestseller: true,
        is_featured: false,
        badge_label: 'Chhena Special',
      },
    ],
    [
      'prod-dalmoth',
      {
        id: 'prod-dalmoth',
        name: 'Awadhi Shahi Dalmoth Mixture',
        slug: 'awadhi-shahi-dalmoth',
        description: 'Crisp whole masoor lentils blended with sev, cashews, and secret royal spice mix.',
        category_id: 'c1000000-0000-0000-0000-000000000005',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        pure_ghee: false,
        shelf_life_days: 60,
        is_active: true,
        ingredients: 'Whole Masoor, Gram Flour Sev, Fried Cashews, Amchoor, Black Salt',
        is_bestseller: true,
        is_featured: true,
        badge_label: 'Savory Hit',
      },
    ],
    [
      'prod-mathri',
      {
        id: 'prod-mathri',
        name: 'Crispy Ajwain Khasta Mathri',
        slug: 'crispy-ajwain-mathri',
        description: 'Flaky layered savory flour crisps seasoned with hand-rubbed carom seeds.',
        category_id: 'c1000000-0000-0000-0000-000000000005',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        pure_ghee: false,
        shelf_life_days: 45,
        is_active: true,
        ingredients: 'Wheat Flour, Carom Seeds (Ajwain), Ground Spices, Edible Oil, Sea Salt',
        is_bestseller: false,
        is_featured: false,
        badge_label: 'Tea Time Classic',
      },
    ],
    ['prod-mini-samosa', { id: 'prod-mini-samosa', name: 'Mini Samosa', slug: 'mini-samosa', description: 'A crispy savory snack – mini samosa.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-mini-khasta', { id: 'prod-mini-khasta', name: 'Mini Khasta', slug: 'mini-khasta', description: 'A crispy savory snack – mini khasta.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-plain-mathri', { id: 'prod-plain-mathri', name: 'Plain Mathri', slug: 'plain-mathri', description: 'A crispy savory snack – plain mathri.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-achari-mathri', { id: 'prod-achari-mathri', name: 'Achari Mathri', slug: 'achari-mathri', description: 'A crispy savory snack – achari mathri.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-achari-samosa', { id: 'prod-achari-samosa', name: 'Achari Samosa', slug: 'achari-samosa', description: 'A crispy savory snack – achari samosa.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-mewa-samosa', { id: 'prod-mewa-samosa', name: 'Mewa Samosa', slug: 'mewa-samosa', description: 'A crispy savory snack – mewa samosa.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-masoor-dalmoth', { id: 'prod-masoor-dalmoth', name: 'Masoor Dalmoth', slug: 'masoor-dalmoth', description: 'A crispy savory snack – masoor dalmoth.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-pudina-mixture', { id: 'prod-pudina-mixture', name: 'Pudina Mixture', slug: 'pudina-mixture', description: 'A crispy savory snack – pudina mixture.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-kaju-dalmoth', { id: 'prod-kaju-dalmoth', name: 'Kaju Dalmoth', slug: 'kaju-dalmoth', description: 'A crispy savory snack – kaju dalmoth.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-sev-besan', { id: 'prod-sev-besan', name: 'Sev (Besan)', slug: 'sev-besan', description: 'A crispy savory snack – sev (besan).', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-ganthe', { id: 'prod-ganthe', name: 'Ganthe', slug: 'ganthe', description: 'A crispy savory snack – ganthe.', category_id: 'c1000000-0000-0000-0000-000000000005', image_url: '', pure_ghee: false, shelf_life_days: 30, is_active: true, ingredients: '' }],
    ['prod-kaju-kalash', { id: 'prod-kaju-kalash', name: 'Kaju Kalash', slug: 'kaju-kalash', description: 'A delicious traditional sweet – kaju kalash.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kaju-kesar', { id: 'prod-kaju-kesar', name: 'Kaju Kesar', slug: 'kaju-kesar', description: 'A delicious traditional sweet – kaju kesar.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-pista-roll', { id: 'prod-pista-roll', name: 'Pista Roll', slug: 'pista-roll', description: 'A delicious traditional sweet – pista roll.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-dry-fruit-laddoo', { id: 'prod-dry-fruit-laddoo', name: 'Dry Fruit Laddoo', slug: 'dry-fruit-laddoo', description: 'A delicious traditional sweet – dry fruit laddoo.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-badam-sugarfree', { id: 'prod-badam-sugarfree', name: 'Badam Sugarfree', slug: 'badam-sugarfree', description: 'A delicious traditional sweet – badam sugarfree.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-anjeer-sugarfree', { id: 'prod-anjeer-sugarfree', name: 'Anjeer Sugarfree', slug: 'anjeer-sugarfree', description: 'A delicious traditional sweet – anjeer sugarfree.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-anjeer-king', { id: 'prod-anjeer-king', name: 'Anjeer King', slug: 'anjeer-king', description: 'A delicious traditional sweet – anjeer king.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-mewa-bite', { id: 'prod-mewa-bite', name: 'Mewa Bite', slug: 'mewa-bite', description: 'A delicious traditional sweet – mewa bite.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kaju-gujiya', { id: 'prod-kaju-gujiya', name: 'Kaju Gujiya', slug: 'kaju-gujiya', description: 'A delicious traditional sweet – kaju gujiya.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kaju-peda', { id: 'prod-kaju-peda', name: 'Kaju Peda', slug: 'kaju-peda', description: 'A delicious traditional sweet – kaju peda.', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kaju-barfi-without-silver-leaf', { id: 'prod-kaju-barfi-without-silver-leaf', name: 'Kaju Barfi (without Silver Leaf)', slug: 'kaju-barfi-without-silver-leaf', description: 'A delicious traditional sweet – kaju barfi (without silver leaf).', category_id: 'c1000000-0000-0000-0000-000000000002', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-choco-white', { id: 'prod-choco-white', name: 'Choco White', slug: 'choco-white', description: 'A delicious traditional sweet – choco white.', category_id: '883ae551-dee9-47e0-84e3-651883073ccb', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-orange-white', { id: 'prod-orange-white', name: 'Orange White', slug: 'orange-white', description: 'A delicious traditional sweet – orange white.', category_id: '883ae551-dee9-47e0-84e3-651883073ccb', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-baklava', { id: 'prod-baklava', name: 'Baklava', slug: 'baklava', description: 'A delicious traditional sweet – baklava.', category_id: '883ae551-dee9-47e0-84e3-651883073ccb', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-chandrakala', { id: 'prod-chandrakala', name: 'Chandrakala', slug: 'chandrakala', description: 'A delicious traditional sweet – chandrakala.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-batisa-barfi', { id: 'prod-batisa-barfi', name: 'Batisa Barfi', slug: 'batisa-barfi', description: 'A delicious traditional sweet – batisa barfi.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-gol-batisa', { id: 'prod-gol-batisa', name: 'Gol Batisa', slug: 'gol-batisa', description: 'A delicious traditional sweet – gol batisa.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-lal-peda', { id: 'prod-lal-peda', name: 'Lal Peda', slug: 'lal-peda', description: 'A delicious traditional sweet – lal peda.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kesariya-peda', { id: 'prod-kesariya-peda', name: 'Kesariya Peda', slug: 'kesariya-peda', description: 'A delicious traditional sweet – kesariya peda.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-khoya-katli', { id: 'prod-khoya-katli', name: 'Khoya Katli', slug: 'khoya-katli', description: 'A delicious traditional sweet – khoya katli.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-mini-balushahi', { id: 'prod-mini-balushahi', name: 'Mini Balushahi', slug: 'mini-balushahi', description: 'A delicious traditional sweet – mini balushahi.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-mewa-laddu', { id: 'prod-mewa-laddu', name: 'Mewa Laddu', slug: 'mewa-laddu', description: 'A delicious traditional sweet – mewa laddu.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-khoya-gilori', { id: 'prod-khoya-gilori', name: 'Khoya Gilori', slug: 'khoya-gilori', description: 'A delicious traditional sweet – khoya gilori.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-doda-barfi', { id: 'prod-doda-barfi', name: 'Doda Barfi', slug: 'doda-barfi', description: 'A delicious traditional sweet – doda barfi.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-magdal', { id: 'prod-magdal', name: 'Magdal', slug: 'magdal', description: 'A delicious traditional sweet – magdal.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-milk-barfi', { id: 'prod-milk-barfi', name: 'Milk Barfi', slug: 'milk-barfi', description: 'A delicious traditional sweet – milk barfi.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-mewa-motichur-laddu', { id: 'prod-mewa-motichur-laddu', name: 'Mewa Motichur Laddu', slug: 'mewa-motichur-laddu', description: 'A delicious traditional sweet – mewa motichur laddu.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-soonth-laddu', { id: 'prod-soonth-laddu', name: 'Soonth Laddu', slug: 'soonth-laddu', description: 'A delicious traditional sweet – soonth laddu.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-churma-laddu', { id: 'prod-churma-laddu', name: 'Churma Laddu', slug: 'churma-laddu', description: 'A delicious traditional sweet – churma laddu.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-chocolate-biscuit', { id: 'prod-chocolate-biscuit', name: 'Chocolate Biscuit', slug: 'chocolate-biscuit', description: 'A delicious traditional sweet – chocolate biscuit.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-batisa-laddu', { id: 'prod-batisa-laddu', name: 'Batisa Laddu', slug: 'batisa-laddu', description: 'A delicious traditional sweet – batisa laddu.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-karachi-halwa', { id: 'prod-karachi-halwa', name: 'Karachi Halwa', slug: 'karachi-halwa', description: 'A delicious traditional sweet – karachi halwa.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-pinni', { id: 'prod-pinni', name: 'Pinni', slug: 'pinni', description: 'A delicious traditional sweet – pinni.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-kala-jam', { id: 'prod-kala-jam', name: 'Kala Jam', slug: 'kala-jam', description: 'A delicious traditional sweet – kala jam.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-milk-cake', { id: 'prod-milk-cake', name: 'Milk Cake', slug: 'milk-cake', description: 'A delicious traditional sweet – milk cake.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-nariyal-barfi-coconut-barfi', { id: 'prod-nariyal-barfi-coconut-barfi', name: 'Nariyal Barfi (Coconut Barfi)', slug: 'nariyal-barfi-coconut-barfi', description: 'A delicious traditional sweet – nariyal barfi (coconut barfi).', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
    ['prod-khoya-kalakand', { id: 'prod-khoya-kalakand', name: 'Khoya Kalakand', slug: 'khoya-kalakand', description: 'A delicious traditional sweet – khoya kalakand.', category_id: 'c1000000-0000-0000-0000-000000000001', image_url: '', pure_ghee: true, shelf_life_days: 15, is_active: true, ingredients: '' }],
  ]),
  variants: new Map<string, MasterVariant>(MASTER_VARIANTS.map((v) => [v.id, v])),
  deliveryPartners: new Map<any, any>(),
  auditLogs: [] as ServerAuditLog[],
  storeSettings: {
    store_name: 'Saraswati Sweets',
    tagline: 'Pure Desi Ghee Mithai & Artisanal Namkeen Since 1978',
    store_phone: '+91 91611 10030',
    whatsapp: '+91 91611 10030',
    store_email: 'order@saraswatisweets.in',
    address_text: 'Saraswati Sweets, Indira Market, Begum Gunj, Barabanki, Uttar Pradesh 225001, Uttar Pradesh 225001',
    serviceable_pincodes: ['225001', '225002', '225003', '225122'],
    delivery_charge_flat: 40,
    free_delivery_above: 499,
    cod_limit_amount: 2000,
    tax_rate_percent: 5,
    opening_time: '06:30',
    closing_time: '22:00',
    is_store_open: true,
  } as ServerStoreSettings,
  coupons: new Map<any, any>(),
  couponUsage: [] as ServerCouponUsage[],
  offers: new Map<any, any>(),
  banners: new Map<any, any>(),
  reviews: new Map<any, any>(),
  giftHampers: new Map<any, any>(),
  bulkEnquiries: new Map<any, any>(),
  notifications: [] as ServerNotification[],
};

/**
 * Validates a coupon server-side against validity dates, min order amount,
 * store-wide total limit, and per-user redemption limits.
 */
export function validateCouponServer(
  couponCode: string,
  subtotal: number,
  userId?: string,
  userPhone?: string
): {
  valid: boolean;
  coupon?: ServerCoupon;
  discount_amount: number;
  error?: string;
  errorCode?: string;
} {
  if (!couponCode) {
    return { valid: false, discount_amount: 0, error: 'Coupon code required', errorCode: 'COUPON_REQUIRED' };
  }

  const cleanCode = couponCode.trim().toUpperCase();
  const coupon = inMemoryStore.coupons.get(cleanCode);

  if (!coupon) {
    return { valid: false, discount_amount: 0, error: `Coupon code '${cleanCode}' is invalid`, errorCode: 'COUPON_NOT_FOUND' };
  }

  if (!coupon.is_active) {
    return { valid: false, discount_amount: 0, error: `Coupon '${cleanCode}' is currently inactive`, errorCode: 'COUPON_INACTIVE' };
  }

  const now = new Date().getTime();
  if (coupon.start_date && now < new Date(coupon.start_date).getTime()) {
    return { valid: false, discount_amount: 0, error: `Coupon '${cleanCode}' has not started yet`, errorCode: 'COUPON_NOT_STARTED' };
  }

  if (coupon.valid_until && now > new Date(coupon.valid_until).getTime()) {
    return { valid: false, discount_amount: 0, error: `Coupon '${cleanCode}' has expired`, errorCode: 'COUPON_EXPIRED' };
  }

  if (subtotal < coupon.min_order_value) {
    return {
      valid: false,
      discount_amount: 0,
      error: `Minimum order amount of ₹${coupon.min_order_value} required to use coupon '${cleanCode}' (current subtotal ₹${subtotal})`,
      errorCode: 'MIN_ORDER_NOT_MET',
    };
  }

  // Check store-wide total usage limit
  if (coupon.total_limit && (coupon.used_count || 0) >= coupon.total_limit) {
    return {
      valid: false,
      discount_amount: 0,
      error: `Coupon '${cleanCode}' has reached maximum total redemptions`,
      errorCode: 'TOTAL_LIMIT_REACHED',
    };
  }

  // Check per-user limit
  if (coupon.per_user_limit) {
    const userUsageCount = inMemoryStore.couponUsage.filter((usage) => {
      if (usage.coupon_code !== cleanCode) return false;
      const matchUser = userId && usage.user_id === userId;
      const matchPhone = userPhone && usage.phone === userPhone;
      return Boolean(matchUser || matchPhone);
    }).length;

    if (userUsageCount >= coupon.per_user_limit) {
      return {
        valid: false,
        discount_amount: 0,
        error: `You have reached the maximum allowed uses (${coupon.per_user_limit}) for coupon '${cleanCode}'`,
        errorCode: 'PER_USER_LIMIT_REACHED',
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'FLAT') {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === 'PERCENTAGE') {
    const calculated = (subtotal * coupon.value) / 100;
    discount = coupon.max_discount_amount ? Math.min(coupon.max_discount_amount, calculated) : calculated;
  }

  return {
    valid: true,
    coupon,
    discount_amount: Math.round(discount),
  };
}

// Auto-expire unpaid PENDING_PAYMENT orders after 15 min: releases slot capacity and cancels order
export function expireUnpaidOrders(): number {
  const now = Date.now();
  const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
  let expiredCount = 0;

  for (const [id, order] of inMemoryStore.orders.entries()) {
    if (order.status === 'PENDING_PAYMENT') {
      const orderCreatedAt = new Date(order.created_at).getTime();
      const isExpired = now - orderCreatedAt > EXPIRY_MS;

      if (isExpired) {
        order.status = 'CANCELLED';
        order.payment_status = 'FAILED';
        order.cancelled_at = new Date().toISOString();
        order.updated_at = new Date().toISOString();

        // Release slot capacity
        const slot = inMemoryStore.deliverySlots.get(order.delivery_slot_id);
        if (slot && slot.booked_count > 0) {
          slot.booked_count -= 1;
          inMemoryStore.deliverySlots.set(slot.id, slot);
        }

        inMemoryStore.orders.set(id, order);
        expiredCount++;
      }
    }
  }

  return expiredCount;
}

// Run periodic cleanup every 30 seconds
setInterval(() => {
  try {
    expireUnpaidOrders();
  } catch (err) {
    console.error('Error during auto-expire cleanup:', err);
  }
}, 30000);

// Seed admin profile
inMemoryStore.profiles.set('admin-default', {
  id: 'admin-default',
  email: 'admin@saraswatisweets.in',
  phone: '+919161110030',
  full_name: 'Shop Owner (Admin)',
  role: 'ADMIN',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

inMemoryStore.profiles.set('staff-default', {
  id: 'staff-default',
  email: 'staff@saraswatisweets.in',
  phone: '+919450012346',
  full_name: 'Store Counter Staff',
  role: 'STAFF',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export function logAuditEvent(
  user: { id?: string; full_name?: string; role?: string } | undefined,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, any> = {}
): ServerAuditLog {
  const log: ServerAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: user?.id || 'system',
    user_name: user?.full_name || 'System / Automated',
    user_role: user?.role || 'SYSTEM',
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    created_at: new Date().toISOString(),
  };

  inMemoryStore.auditLogs.unshift(log);
  if (inMemoryStore.auditLogs.length > 500) {
    inMemoryStore.auditLogs.length = 500;
  }
  return log;
}



// ==========================================================
// PERSISTENCE ENGINE (Supabase Postgres)
// ==========================================================
export async function loadStoreState(): Promise<void> {
  if (!isLiveSupabase || !supabaseServer) {
    console.warn('[Store] Supabase not configured. Using empty memory state.');
    return;
  }

  try {
    console.log('[Store] Fetching all data from Supabase Postgres...');
    
    // Fetch critical tables
    const [
      cats, prods, vars, offs, bans, hampers, 
      slots, ords, profs, addrs, pays, revs, 
      coups, bulks, prodImgs, ordItems
    ] = await Promise.all([
      supabaseServer.from('categories').select('*'),
      supabaseServer.from('products').select('*'),
      supabaseServer.from('product_variants').select('*'),
      supabaseServer.from('offers').select('*'),
      supabaseServer.from('banners').select('*'),
      supabaseServer.from('gift_hampers').select('*'),
      supabaseServer.from('delivery_slots').select('*'),
      supabaseServer.from('orders').select('*'),
      supabaseServer.from('profiles').select('*'),
      supabaseServer.from('addresses').select('*'),
      supabaseServer.from('payments').select('*'),
      supabaseServer.from('reviews').select('*'),
      supabaseServer.from('coupons').select('*'),
      supabaseServer.from('bulk_enquiries').select('*'),
      supabaseServer.from('product_images').select('*'),
      supabaseServer.from('order_items').select('*')
    ]);

    // Populate SyncMaps (bypassing the custom .set to avoid re-upserting)
    if (cats.data) { inMemoryStore.categories.clear(); cats.data.forEach(x => inMemoryStore.categories.set(x.id, x)); }
    if (offs.data) { inMemoryStore.offers.clear(); offs.data.forEach(x => inMemoryStore.offers.set(x.id, x)); }
    if (bans.data) { inMemoryStore.banners.clear(); bans.data.forEach(x => inMemoryStore.banners.set(x.id, x)); }
    if (hampers.data) { inMemoryStore.giftHampers.clear(); hampers.data.forEach(x => inMemoryStore.giftHampers.set(x.id, x)); }
    if (slots.data) { inMemoryStore.deliverySlots.clear(); slots.data.forEach(x => inMemoryStore.deliverySlots.set(x.id, x)); }

    if (prods.data) {
      inMemoryStore.products.clear();
      const imgMap = new Map();
      if (typeof prodImgs !== 'undefined' && prodImgs.data) {
        prodImgs.data.forEach((img: any) => {
            if (img.is_primary) imgMap.set(img.product_id, img.image_url);
        });
      }
      prods.data.forEach((x: any) => {
          x.pure_ghee = x.is_pure_ghee;
          x.image_url = imgMap.get(x.id) || x.image_url;
          inMemoryStore.products.set(x.id, x);
      });
    }

    if (ords.data) {
       inMemoryStore.orders.clear();
       const ordMap = new Map();
       if (typeof ordItems !== 'undefined' && ordItems.data) {
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
       ords.data.forEach((x: any) => {
           x.items = ordMap.get(x.id) || [];
           inMemoryStore.orders.set(x.id, x);
       });
    }

    if (vars.data) {
      inMemoryStore.variants.clear();
      vars.data.forEach((x: any) => {
        x.productId = x.product_id;
        x.weightGrams = x.weight_grams;
        x.stockStatus = x.stock_status;
        x.stockQuantity = x.stock_quantity;
        inMemoryStore.variants.set(x.id, x);
      });
    }
    
    if (profs.data) { inMemoryStore.profiles.clear(); profs.data.forEach(x => inMemoryStore.profiles.set(x.id, x)); }
    if (addrs.data) { inMemoryStore.addresses.clear(); addrs.data.forEach(x => inMemoryStore.addresses.set(x.id, x)); }
    if (pays.data) { inMemoryStore.payments.clear(); pays.data.forEach(x => inMemoryStore.payments.set(x.id, x)); }
    if (revs.data) { inMemoryStore.reviews.clear(); revs.data.forEach(x => inMemoryStore.reviews.set(x.id, x)); }
    if (coups.data) { inMemoryStore.coupons.clear(); coups.data.forEach(x => inMemoryStore.coupons.set(x.code, x)); }
    if (bulks.data) { inMemoryStore.bulkEnquiries.clear(); bulks.data.forEach(x => inMemoryStore.bulkEnquiries.set(x.id, x)); }

    console.log(`[Store] Loaded persistent state from Postgres (${inMemoryStore.products.size} products, ${inMemoryStore.orders.size} orders).`);
  } catch (err) {
    console.error('Failed to load store state from Postgres:', err);
  }
}

export function saveStoreState(): void {
  // No-op. SyncMap automatically writes to Supabase on every mutation.
  // The local store_state.json file has been eliminated.
}
