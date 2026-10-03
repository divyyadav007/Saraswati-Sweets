import React, { useEffect, useState, useRef, useTransition } from 'react';
import {
  BarChart3,
  ShoppingCart,
  Package,
  FolderTree,
  Users,
  Bike,
  Calendar,
  Settings,
  ShieldCheck,
  AlertCircle,
  Lock,
  LogOut,
  Search,
  Plus,
  Upload,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText,
  X,
  IndianRupee,
  Check,
  Ban,
  TrendingUp,
  MapPin,
  Phone,
  Gift,
  Tag,
  Star,
  Building2,
  Bell,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';
import { AdminHampersTab } from '../components/admin/AdminHampersTab';
import { AdminMarketingTab } from '../components/admin/AdminMarketingTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminEnquiriesTab } from '../components/admin/AdminEnquiriesTab';
import { AdminNotificationsTab } from '../components/admin/AdminNotificationsTab';
import { AdminCouponUsageModal } from '../components/admin/AdminCouponUsageModal';
import { ProductImagePlaceholder } from '../components/common/ProductImagePlaceholder';

interface AdminPageProps {
  onBackToStore: () => void;
  onGoToLogin: () => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'customers'
  | 'delivery'
  | 'slots'
  | 'hampers'
  | 'marketing'
  | 'reviews'
  | 'enquiries'
  | 'notifications'
  | 'settings'
  | 'audit';

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore, onGoToLogin }) => {
  const { user, isAuthenticated, isStaff, isAdmin, signOut, getAuthHeaders } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [trendView, setTrendView] = useState<'7days' | '30days'>('7days');

  // Stage 6 State
  const [hampers, setHampers] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedCouponForUsage, setSelectedCouponForUsage] = useState<any | null>(null);

  // Orders Tab filters & search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  // Assign Delivery Modal
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  // Refund Modal state
  const [refundOrderTarget, setRefundOrderTarget] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('Customer cancellation / return');
  const [isRefunding, setIsRefunding] = useState(false);

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    category_id: '',
    description: '',
    image_url: '',
    pure_ghee: true,
    shelf_life_days: 7,
    ingredients: '',
    variantLabel: '500g',
    variantPrice: 300,
    variantMrp: 340,
    variantWeight: 500,
    variantStock: 50,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sweet Catalog Tab filters
  const [adminProductCategory, setAdminProductCategory] = useState<string>('ALL');
  const [adminProductSearch, setAdminProductSearch] = useState<string>('');

  // Category Add / Edit Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 1,
  });

  // Delivery Partner Add Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    vehicle_number: '',
  });

  // Coupon Add / Edit Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'FLAT' as 'FLAT' | 'PERCENTAGE',
    discount_value: 50,
    min_order_amount: 300,
    max_discount_amount: 150,
    total_limit: '' as string | number,
    per_user_limit: '' as string | number,
    is_active: true,
  });

  // Variant Add / Edit Modal
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState({
    label: '500g',
    weightGrams: 500,
    price: 300,
    mrp: 350,
    stockQuantity: 50,
    stockStatus: 'IN_STOCK',
  });

  // Slot Bulk Generator state
  const [bulkStartDate, setBulkStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkDays, setBulkDays] = useState(7);
  const [bulkCapacity, setBulkCapacity] = useState(30);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);

  // 1. DATA LOADER
  const loadAllAdminData = async (silent = false) => {
    if (!isAuthenticated || !isStaff) return;
    if (!silent) setLoading(true);
    setServerError('');

    try {
      const headers = getAuthHeaders();
      const [
        overviewRes,
        ordersRes,
        productsRes,
        categoriesRes,
        partnersRes,
        slotsRes,
        settingsRes,
        couponsRes,
        hampersRes,
        offersRes,
        bannersRes,
        reviewsRes,
        enquiriesRes,
        notificationsRes,
      ] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/delivery-partners', { headers }),
        fetch('/api/admin/delivery-slots', { headers }),
        fetch('/api/admin/store/settings', { headers }),
        fetch('/api/admin/coupons', { headers }),
        fetch('/api/admin/hampers', { headers }),
        fetch('/api/admin/offers', { headers }),
        fetch('/api/admin/banners', { headers }),
        fetch('/api/admin/reviews', { headers }),
        fetch('/api/admin/enquiries', { headers }),
        fetch('/api/admin/notifications', { headers }),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setMetrics(data.metrics);
        setStoreSettings(data.storeSettings);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      if (partnersRes.ok) {
        const data = await partnersRes.json();
        setDeliveryPartners(data.partners || []);
      }

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setDeliverySlots(data.slots || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setStoreSettings(data.settings);
      }

      if (couponsRes.ok) {
        const data = await couponsRes.json();
        setCoupons(data.coupons || []);
      }

      if (hampersRes.ok) {
        const data = await hampersRes.json();
        setHampers(data.hampers || []);
      }

      if (offersRes.ok) {
        const data = await offersRes.json();
        setOffers(data.offers || []);
      }

      if (bannersRes.ok) {
        const data = await bannersRes.json();
        setBanners(data.banners || []);
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews || []);
      }

      if (enquiriesRes.ok) {
        const data = await enquiriesRes.json();
        setEnquiries(data.enquiries || []);
      }

      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        setNotifications(data.notifications || []);
      }

      // If ADMIN, also load audit logs & customers
      if (isAdmin) {
        const [auditRes, custRes] = await Promise.all([
          fetch('/api/admin/audit-logs', { headers }),
          fetch('/api/admin/customers', { headers }),
        ]);
        if (auditRes.ok) {
          const d = await auditRes.json();
          setAuditLogs(d.auditLogs || []);
        }
        if (custRes.ok) {
          const d = await custRes.json();
          setCustomers(d.customers || []);
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to sync with store server.');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAuthenticated, isStaff]);

  // 2. LIVE POLLING: Orders screen polls every 20 seconds
  useEffect(() => {
    if (!isAuthenticated || !isStaff) return;

    const interval = setInterval(() => {
      // Background poll orders & metrics without showing full screen loader
      loadAllAdminData(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isStaff, isAdmin]);

  // Manual Refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadAllAdminData(true);
    showToast('Store data refreshed!', 'info');
  };

  // 3. IMAGE UPLOAD HANDLER (JPEG/PNG/WebP <= 5MB, Single Primary Image)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME Type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showToast('Only JPEG, PNG, and WebP images are supported.', 'error');
      return;
    }

    // Validate File Size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please optimize photo.', 'error');
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

        // 1. Get server-signed upload URL (Supabase Storage flow)
        const signRes = await fetch('/api/admin/signed-upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });
        const signData = await signRes.json();
        if (!signRes.ok) {
          showToast(signData.message || 'Failed to authorize storage upload', 'error');
          setIsUploadingImage(false);
          return;
        }

        // 2. Upload photo to signed storage endpoint with authorization token
        const res = await fetch(signData.uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            dataUrl: base64Data,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            token: signData.token,
            path: signData.path,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setProductForm((prev) => ({ ...prev, image_url: data.imageUrl }));
          showToast('Photo uploaded as primary sweet image!', 'success');
        } else {
          showToast(data.message || 'Upload failed', 'error');
        }
        setIsUploadingImage(false);
        } catch (innerErr: any) {
          showToast(innerErr.message || 'Error uploading image to server', 'error');
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Error processing image', 'error');
      setIsUploadingImage(false);
    }
  };

  // 4. ORDER STATUS TRANSITION WITH AUDIT LOGGING
  const handleOrderStatusTransition = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        showToast(`Order status updated to ${nextStatus}`, 'success');
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Transition rejected by state machine', 'error');
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // 5. ASSIGN DELIVERY PARTNER
  const handleAssignDelivery = async () => {
    if (!assigningOrder || !selectedPartnerId) {
      showToast('Select a delivery partner first.', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${assigningOrder.id}/assign-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ partnerId: selectedPartnerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === assigningOrder.id ? data.order : o)));
        showToast(data.message || 'Delivery assigned!', 'success');
        setAssigningOrder(null);
        setSelectedPartnerId('');
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Assignment failed', 'error');
      }
    } catch (err) {
      showToast('Failed to assign partner', 'error');
    }
  };

  // 6. RAZORPAY REFUND ACTION (ADMIN ONLY) WITH DOUBLE-REFUND GUARD
  const handleExecuteRefund = async () => {
    if (!refundOrderTarget) return;

    if (!isAdmin) {
      showToast('Only shop administrator has refund authority.', 'error');
      return;
    }

    setIsRefunding(true);
    try {
      const res = await fetch(`/api/admin/orders/${refundOrderTarget.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ reason: refundReason }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === refundOrderTarget.id ? data.order : o)));
        showToast(`Refund of ₹${refundOrderTarget.total_amount} processed successfully!`, 'success');
        setRefundOrderTarget(null);
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Refund failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing refund', 'error');
    } finally {
      setIsRefunding(false);
    }
  };

  // 7. STOCK STATUS TOGGLER
  const handleToggleStock = async (variantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
    try {
      const res = await fetch(`/api/admin/variants/${variantId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ stockStatus: nextStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            variants: p.variants.map((v: any) =>
              v.id === variantId ? { ...v, stockStatus: nextStatus } : v
            ),
          }))
        );
        showToast('Stock availability updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to toggle stock', 'error');
    }
  };

  // 8. PRODUCT SAVE (ADMIN ONLY)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Admin can add or modify products.', 'error');
      return;
    }

    try {
      const isEdit = Boolean(productForm.id);
      const url = isEdit ? `/api/admin/products/${productForm.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: productForm.name,
        category_id: productForm.category_id || categories[0]?.id,
        description: productForm.description,
        image_url: productForm.image_url,
        pure_ghee: productForm.pure_ghee,
        shelf_life_days: productForm.shelf_life_days,
        ingredients: productForm.ingredients,
        ...(!isEdit
          ? {
              variants: [
                {
                  label: productForm.variantLabel,
                  weightGrams: productForm.variantWeight,
                  price: productForm.variantPrice,
                  mrp: productForm.variantMrp,
                  stockQuantity: productForm.variantStock,
                },
              ],
            }
          : {}),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Product updated!' : 'Mithai added to catalog!', 'success');
        setIsProductModalOpen(false);
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to save product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    }
  };

  // 9. DELETE PRODUCT (ADMIN ONLY)
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!isAdmin) {
      showToast('Only Admin can delete products.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${productName}?`,
      message:
        'This will permanently remove the mithai and all its size variants from the store.',
      confirmLabel: 'Yes, Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            showToast('Product removed.', 'info');
            loadAllAdminData(true);
          }
        } catch {
          showToast('Failed to delete product', 'error');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 10. SAVE STORE SETTINGS (ADMIN ONLY)
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Admin can modify store settings.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Update Store Settings?',
      message: 'This will update active delivery rates, free delivery thresholds, and shop contact details in Barabanki.',
      confirmLabel: 'Save Settings',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/store/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify(storeSettings),
          });
          const d = await res.json();
          if (res.ok) {
            showToast('Store settings updated!', 'success');
          } else {
            showToast(d.message || 'Failed to save settings', 'error');
          }
        } catch {
          showToast('Error saving settings', 'error');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 11. BULK GENERATE SLOTS
  const handleBulkGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSlots(true);

    try {
      const res = await fetch('/api/admin/delivery-slots/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          startDate: bulkStartDate,
          daysCount: bulkDays,
          capacity: bulkCapacity,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Slots generated!', 'success');
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to generate slots', 'error');
      }
    } catch {
      showToast('Error creating delivery slots', 'error');
    } finally {
      setIsGeneratingSlots(false);
    }
  };

  // 12. CATEGORY HANDLERS (ADMIN ONLY)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Admin can manage categories.', 'error');
      return;
    }

    try {
      const isEdit = Boolean(editingCategoryId);
      const url = isEdit ? `/api/admin/categories/${editingCategoryId}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Category updated!' : 'Category created!', 'success');
        setIsCategoryModalOpen(false);
        setEditingCategoryId(null);
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to save category', 'error');
      }
    } catch {
      showToast('Error saving category', 'error');
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (!isAdmin) {
      showToast('Only Admin can delete categories.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete Category '${categoryName}'?`,
      message: 'This will remove the category tile from the store catalog. Sweets inside will need reassignment.',
      confirmLabel: 'Yes, Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            showToast('Category deleted.', 'info');
            loadAllAdminData(true);
          }
        } catch {
          showToast('Failed to delete category', 'error');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 13. DELIVERY PARTNER HANDLERS
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Admin can add delivery partners.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/delivery-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(partnerForm),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Rider ${partnerForm.name} onboarded!`, 'success');
        setIsPartnerModalOpen(false);
        setPartnerForm({ name: '', phone: '', vehicle_number: '' });
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to add rider', 'error');
      }
    } catch {
      showToast('Error saving delivery partner', 'error');
    }
  };

  const handleTogglePartnerStatus = async (partnerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';
    try {
      const res = await fetch(`/api/admin/delivery-partners/${partnerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Rider status set to ${nextStatus}`, 'success');
        loadAllAdminData(true);
      }
    } catch {
      showToast('Failed to update rider status', 'error');
    }
  };

  // 14. COUPON HANDLERS (ADMIN ONLY FOR MUTATIONS)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Admin can create or modify coupons.', 'error');
      return;
    }

    try {
      const isEdit = Boolean(editingCouponId);
      const url = isEdit ? `/api/admin/coupons/${editingCouponId}` : '/api/admin/coupons';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(couponForm),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Coupon updated!' : 'Coupon created!', 'success');
        setIsCouponModalOpen(false);
        setEditingCouponId(null);
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to save coupon', 'error');
      }
    } catch {
      showToast('Error saving coupon', 'error');
    }
  };

  const handleToggleCoupon = async (coupon: any) => {
    if (!isAdmin) {
      showToast('Only Admin can toggle coupons.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      if (res.ok) {
        showToast(`Coupon ${coupon.code} ${!coupon.is_active ? 'activated' : 'deactivated'}`, 'info');
        loadAllAdminData(true);
      }
    } catch {
      showToast('Failed to toggle coupon status', 'error');
    }
  };

  const handleDeleteCoupon = (coupon: any) => {
    if (!isAdmin) {
      showToast('Only Admin can delete coupons.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete Coupon ${coupon.code}?`,
      message: 'This will permanently remove this coupon discount from the checkout page.',
      confirmLabel: 'Yes, Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            showToast(`Coupon ${coupon.code} deleted.`, 'info');
            loadAllAdminData(true);
          }
        } catch {
          showToast('Failed to delete coupon', 'error');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 15. VARIANT MANAGEMENT (ADMIN ONLY)
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedProductForVariant) {
      showToast('Only Admin can manage sweet variants.', 'error');
      return;
    }

    try {
      const isEdit = Boolean(editingVariantId);
      const url = isEdit
        ? `/api/admin/variants/${editingVariantId}`
        : `/api/admin/products/${selectedProductForVariant.id}/variants`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(variantForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Variant updated!' : 'Variant added to product!', 'success');
        setIsVariantModalOpen(false);
        setEditingVariantId(null);
        setSelectedProductForVariant(null);
        loadAllAdminData(true);
      } else {
        showToast(data.message || 'Failed to save variant', 'error');
      }
    } catch {
      showToast('Error saving variant', 'error');
    }
  };

  // 16. ORDER CANCELLATION PROMPT (WITH CONFIRMATION DIALOG)
  const handlePromptOrderCancellation = (order: any) => {
    setConfirmDialog({
      isOpen: true,
      title: `Cancel Order #${order.order_number}?`,
      message: `Are you sure you want to cancel this order? This will release reserved delivery slot capacity and record an audit log.`,
      confirmLabel: 'Yes, Cancel Order',
      isDestructive: true,
      onConfirm: () => {
        handleOrderStatusTransition(order.id, 'CANCELLED');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ROUTE GUARDS
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF4DE] text-[#B8781E] flex items-center justify-center mx-auto border border-[#C9A227]/40 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-3xl text-[#1F1B16]">
          Protected Admin Area
        </h1>
        <p className="text-sm text-[#6B6258] leading-relaxed">
          The Saraswati Sweets operations console requires staff or shop owner authentication.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white font-semibold text-sm transition-colors shadow-xs"
          >
            Staff / Owner Login
          </button>
          <button
            type="button"
            onClick={onBackToStore}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-white border border-[#E8DFD2] hover:bg-[#F3EBE0] text-[#1F1B16] font-semibold text-sm transition-colors"
          >
            Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF4DE] text-[#B3261E] flex items-center justify-center mx-auto border border-[#B3261E]/30 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-3xl text-[#1F1B16]">
          Access Denied
        </h1>
        <p className="text-sm text-[#6B6258] leading-relaxed">
          You are currently signed in as a customer (<strong>{user?.full_name}</strong>). This administration console is strictly restricted to store staff and owners.
        </p>
        <button
          type="button"
          onClick={onBackToStore}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#8A1538] text-white text-sm font-semibold hover:bg-[#701029]"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchNum = o.order_number?.toLowerCase().includes(q);
      const matchName = o.address_snapshot?.recipient_name?.toLowerCase().includes(q);
      const matchPhone = o.address_snapshot?.recipient_phone?.includes(q) || o.guest_phone?.includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP HEADER & BARABANKI BRAND STRIP */}
      <div className="rounded-2xl bg-[#8A1538] text-white p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-[#C9A227] text-[#1F1B16]' : 'bg-white/20 text-white'
              }`}
            >
              Role: {user?.role}
            </span>
            <span className="text-white/70 text-xs">•</span>
            <span className="text-white/90 text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Barabanki Store Sync (20s)
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Saraswati Sweets • Store Console
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-0.5">
            Logged in: <strong>{user?.full_name}</strong> ({user?.email || user?.phone})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onBackToStore}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
          >
            Storefront
          </button>

          <button
            type="button"
            onClick={signOut}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-white text-[#8A1538] text-xs font-semibold hover:bg-[#FAF4DE] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-[#FAF4DE] border border-[#B3261E]/40 text-sm text-[#8A1538] font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#B3261E]" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 2. PHONE-FRIENDLY SCROLLABLE NAVIGATION TABS */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-1 border-b border-[#E8DFD2]">
        {[
          { key: 'overview', label: 'Dashboard', icon: BarChart3 },
          { key: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
          { key: 'products', label: `Sweets & Stock (${products.length})`, icon: Package },
          { key: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
          { key: 'hampers', label: `Gift Hampers (${hampers.length})`, icon: Gift },
          { key: 'marketing', label: `Offers & Banners (${offers.length + banners.length})`, icon: Tag },
          { key: 'reviews', label: `Reviews (${reviews.filter((r) => !r.is_approved).length > 0 ? `${reviews.filter((r) => !r.is_approved).length} new` : reviews.length})`, icon: Star },
          { key: 'enquiries', label: `Bulk Enquiries (${enquiries.filter((e) => e.status === 'NEW').length > 0 ? `${enquiries.filter((e) => e.status === 'NEW').length} new` : enquiries.length})`, icon: Building2 },
          { key: 'notifications', label: `Notifications (${notifications.filter((n) => !n.is_read).length > 0 ? `${notifications.filter((n) => !n.is_read).length} unread` : notifications.length})`, icon: Bell },
          { key: 'customers', label: `Customers (${customers.length})`, icon: Users, adminOnly: true },
          { key: 'delivery', label: `Delivery Riders (${deliveryPartners.length})`, icon: Bike },
          { key: 'slots', label: `Delivery Slots (${deliverySlots.length})`, icon: Calendar },
          { key: 'settings', label: 'Store Settings', icon: Settings },
          { key: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: ShieldCheck, adminOnly: true },
        ]
          .filter((t) => !t.adminOnly || isAdmin)
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#8A1538] text-white shadow-xs'
                    : 'bg-white text-[#1F1B16] border border-[#E8DFD2] hover:bg-[#F3EBE0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6E08B]' : 'text-[#8A1538]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* 3. TAB PANELS */}

      {/* ==================================================== */}
      {/* TAB A: OVERVIEW / DASHBOARD                          */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics 4-Cards Row */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD2] shadow-xs">
                <span className="text-xs text-[#6B6258] font-medium flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-[#8A1538]" /> Today's Sales
                </span>
                <div className="text-2xl font-bold font-display text-[#1F1B16] tabular-nums mt-1">
                  {formatINR(metrics.todayRevenue)}
                </div>
                <span className="text-[11px] text-[#2E7D4F] font-semibold mt-1 block">
                  {metrics.todayOrders} orders placed today
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD2] shadow-xs">
                <span className="text-xs text-[#6B6258] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B8781E]" /> Orders Pending
                </span>
                <div className="text-2xl font-bold font-display text-[#8A1538] tabular-nums mt-1">
                  {metrics.pendingOrders}
                </div>
                <span className="text-[11px] text-[#6B6258] mt-1 block">
                  Awaiting dispatch / kitchen
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD2] shadow-xs">
                <span className="text-xs text-[#6B6258] font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Kitchen Prep
                </span>
                <div className="text-2xl font-bold font-display text-[#C9A227] tabular-nums mt-1">
                  {metrics.preparingOrders}
                </div>
                <span className="text-[11px] text-[#6B6258] mt-1 block">
                  Fresh packing underway
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD2] shadow-xs">
                <span className="text-xs text-[#6B6258] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#B3261E]" /> Low Stock Alerts
                </span>
                <div className="text-2xl font-bold font-display text-[#B3261E] tabular-nums mt-1">
                  {metrics.lowStockItems}
                </div>
                <span className="text-[11px] text-[#6B6258] mt-1 block">
                  Sweets below 10 units
                </span>
              </div>
            </div>
          )}

          {/* 7-Day & 30-Day Trend Visualizer */}
          {metrics && (
            <div className="bg-white rounded-2xl border border-[#E8DFD2] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD2] pb-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#8A1538]" />
                    <span>Sales & Orders Trajectory</span>
                  </h3>
                  <p className="text-xs text-[#6B6258]">
                    Daily Barabanki local delivery volume and sales trajectory.
                  </p>
                </div>
                
                {/* 7-Day / 30-Day Segmented Switch */}
                <div className="flex items-center gap-1 bg-[#F3EBE0] p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTrendView('7days')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendView === '7days' ? 'bg-[#8A1538] text-white shadow-xs' : 'text-[#6B6258] hover:text-[#1F1B16]'
                    }`}
                  >
                    7-Day Daily Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendView('30days')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendView === '30days' ? 'bg-[#8A1538] text-white shadow-xs' : 'text-[#6B6258] hover:text-[#1F1B16]'
                    }`}
                  >
                    30-Day Summary
                  </button>
                </div>
              </div>

              {trendView === '7days' ? (
                /* 7-Day Bar chart representation */
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-4 pb-2">
                  {metrics.trend7Days?.map((d: any) => {
                    const maxRev = Math.max(...metrics.trend7Days.map((x: any) => x.revenue), 1000);
                    const heightPercent = Math.max(15, Math.round((d.revenue / maxRev) * 100));

                    return (
                      <div key={d.date} className="flex flex-col items-center gap-2 text-center">
                        <span className="text-[10px] font-bold text-[#1F1B16] tabular-nums">
                          {formatINR(d.revenue)}
                        </span>
                        <div className="w-full bg-[#F3EBE0] rounded-t-lg h-32 flex items-end justify-center p-1">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#8A1538] hover:bg-[#701029] rounded-t-md transition-all shadow-xs"
                            title={`${d.label}: ${formatINR(d.revenue)} (${d.orders} orders)`}
                          />
                        </div>
                        <span className="text-[11px] text-[#6B6258] font-medium truncate max-w-[50px] sm:max-w-none">
                          {d.label.split(',')[0]}
                        </span>
                        <span className="text-[10px] text-[#2E7D4F] font-bold">
                          {d.orders} ord
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 30-Day Aggregated Trend Grid */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#FBF7F1] border border-[#E8DFD2] space-y-1">
                    <span className="text-xs text-[#6B6258] font-medium">30-Day Revenue</span>
                    <div className="text-2xl font-bold font-display text-[#8A1538] tabular-nums">
                      {formatINR(metrics.trend30Days?.totalRevenue || 0)}
                    </div>
                    <span className="text-[11px] text-[#2E7D4F] font-semibold">Storewide gross intake</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF7F1] border border-[#E8DFD2] space-y-1">
                    <span className="text-xs text-[#6B6258] font-medium">30-Day Completed Orders</span>
                    <div className="text-2xl font-bold font-display text-[#1F1B16] tabular-nums">
                      {metrics.trend30Days?.totalOrders || 0}
                    </div>
                    <span className="text-[11px] text-[#6B6258]">Delivered to Barabanki addresses</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF7F1] border border-[#E8DFD2] space-y-1">
                    <span className="text-xs text-[#6B6258] font-medium">Average Order Value (AOV)</span>
                    <div className="text-2xl font-bold font-display text-[#C9A227] tabular-nums">
                      {metrics.trend30Days?.totalOrders
                        ? formatINR(Math.round(metrics.trend30Days.totalRevenue / metrics.trend30Days.totalOrders))
                        : '₹937'}
                    </div>
                    <span className="text-[11px] text-[#6B6258]">Per customer basket size</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Low-Stock Inventory Triage */}
          {products.some((p) => p.variants?.some((v: any) => v.stockStatus !== 'IN_STOCK' || v.stockQuantity < 15)) && (
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-[#B3261E] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#B3261E]" />
                  <span>Kitchen Inventory Alert • Low / Out of Stock Items</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-semibold text-[#8A1538] hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {products
                  .flatMap((p) =>
                    p.variants
                      ?.filter((v: any) => v.stockStatus !== 'IN_STOCK' || v.stockQuantity < 15)
                      .map((v: any) => ({ ...v, productName: p.name })) || []
                  )
                  .slice(0, 6)
                  .map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#1F1B16] truncate">{v.productName}</div>
                        <div className="text-[11px] text-[#6B6258]">
                          {v.label} • {v.stockQuantity} units left
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleStock(v.id, v.stockStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors whitespace-nowrap ${
                          v.stockStatus === 'IN_STOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#2E7D4F]'
                        }`}
                      >
                        {v.stockStatus === 'IN_STOCK' ? 'Set Out of Stock' : 'Mark In Stock'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="p-4 rounded-xl bg-white border border-[#E8DFD2] hover:border-[#8A1538] hover:bg-[#FBF7F1] text-left transition-all shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-sm text-[#1F1B16]">Manage Live Orders</div>
                <div className="text-xs text-[#6B6258] mt-0.5">Kitchen prep, dispatch, and delivery</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8A1538]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setIsProductModalOpen(true);
              }}
              className="p-4 rounded-xl bg-white border border-[#E8DFD2] hover:border-[#8A1538] hover:bg-[#FBF7F1] text-left transition-all shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-sm text-[#1F1B16]">+ Add New Sweet / Mithai</div>
                <div className="text-xs text-[#6B6258] mt-0.5">Upload photo & set prices</div>
              </div>
              <Plus className="w-4 h-4 text-[#8A1538]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slots')}
              className="p-4 rounded-xl bg-white border border-[#E8DFD2] hover:border-[#8A1538] hover:bg-[#FBF7F1] text-left transition-all shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-sm text-[#1F1B16]">Bulk-Generate Slots</div>
                <div className="text-xs text-[#6B6258] mt-0.5">Open upcoming delivery days</div>
              </div>
              <Calendar className="w-4 h-4 text-[#8A1538]" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB B: ORDERS MANAGEMENT                             */}
      {/* ==================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD2] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#8A1538]" />
                <span>Orders Dashboard (Live Polling every 20s)</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                Enforce state transitions, assign delivery riders, and process Razorpay refunds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6258] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auto-syncing
              </span>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6B6258] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search order #, patron name, or phone..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                'ALL',
                'PENDING_PAYMENT',
                'PLACED',
                'CONFIRMED',
                'PREPARING',
                'READY_FOR_PICKUP',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'CANCELLED',
                'REFUNDED',
              ].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#8A1538] text-white shadow-xs'
                      : 'bg-stone-100 text-[#6B6258] hover:text-[#1F1B16]'
                  }`}
                >
                  {st === 'ALL' ? 'All Orders' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B6258]">
              No orders found matching the selected filter or search query.
            </div>
          ) : (
            <div className="divide-y divide-[#E8DFD2]">
              {filteredOrders.map((order) => {
                const status = order.status;
                const isPaidOnline = order.payment_method === 'ONLINE' && order.payment_status === 'COMPLETED';

                return (
                  <div key={order.id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#8A1538]">
                          #{order.order_number}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            status === 'DELIVERED'
                              ? 'bg-emerald-100 text-[#2E7D4F]'
                              : status === 'CANCELLED'
                              ? 'bg-red-100 text-[#B3261E]'
                              : status === 'REFUNDED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#F7E9EE] text-[#8A1538]'
                          }`}
                        >
                          {status}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            order.payment_method === 'ONLINE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.payment_method} • {order.payment_status}
                        </span>

                        <span className="text-xs text-[#6B6258]">
                          {new Date(order.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                    <div className="text-sm font-bold text-[#1F1B16]">
                        {/* Bug #3 Fix: was order.total (always 0), must use order.total_amount */}
                        {formatINR(order.total_amount)}
                      </div>
                    </div>

                    <div className="text-xs text-[#6B6258] leading-relaxed">
                      Customer: <strong className="text-[#1F1B16]">{order.address_snapshot?.recipient_name}</strong> (
                      {order.address_snapshot?.recipient_phone}) • Destination:{' '}
                      {order.address_snapshot?.street_address}, {order.address_snapshot?.pincode}
                    </div>

                    {/* Bug #4 Fix: Show delivery slot date and time window */}
                    {order.slot_snapshot && (
                      <div className="text-xs text-[#8A1538] font-semibold flex items-center gap-1">
                        <span>🕐</span>
                        <span>
                          Delivery: {order.slot_snapshot.slot_date} &bull; {order.slot_snapshot.start_time}–{order.slot_snapshot.end_time}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#1F1B16] font-medium">
                      Items:{' '}
                      {order.items?.map((it: any) => `${it.product_name} (${it.variant_label}) × ${it.quantity}`).join(' • ')}
                    </div>

                    {order.delivery_partner_name && (
                      <div className="text-xs text-[#2E7D4F] flex items-center gap-1 font-semibold">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Rider Assigned: {order.delivery_partner_name} ({order.delivery_partner_phone})</span>
                      </div>
                    )}

                    {/* State Machine Transition Action Buttons & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#6B6258]">Next Status:</span>

                        {status === 'PENDING_PAYMENT' && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Awaiting Razorpay Payment (15m expiry)
                          </span>
                        )}

                        {status === 'PLACED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOrderStatusTransition(order.id, 'CONFIRMED')}
                              className="px-3 py-1 rounded-lg bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-semibold shadow-xs"
                            >
                              Confirm Order
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePromptOrderCancellation(order)}
                              className="px-3 py-1 rounded-lg border border-[#B3261E] text-[#B3261E] hover:bg-red-50 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {status === 'CONFIRMED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOrderStatusTransition(order.id, 'PREPARING')}
                              className="px-3 py-1 rounded-lg bg-[#C9A227] hover:bg-[#AB881D] text-[#1F1B16] text-xs font-bold shadow-xs"
                            >
                              Start Kitchen Prep
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePromptOrderCancellation(order)}
                              className="px-3 py-1 rounded-lg border border-[#B3261E] text-[#B3261E] hover:bg-red-50 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {status === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusTransition(order.id, 'READY_FOR_PICKUP')}
                            className="px-3 py-1 rounded-lg bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-semibold shadow-xs"
                          >
                            Mark Ready for Dispatch
                          </button>
                        )}

                        {status === 'READY_FOR_PICKUP' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusTransition(order.id, 'OUT_FOR_DELIVERY')}
                            className="px-3 py-1 rounded-lg bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-semibold shadow-xs"
                          >
                            Send Out for Delivery
                          </button>
                        )}

                        {status === 'OUT_FOR_DELIVERY' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusTransition(order.id, 'DELIVERED')}
                            className="px-3 py-1 rounded-lg bg-[#2E7D4F] hover:bg-[#25633e] text-white text-xs font-semibold shadow-xs"
                          >
                            Mark Delivered & Paid
                          </button>
                        )}

                        {status === 'DELIVERED' && (
                          <span className="text-[11px] font-semibold text-[#2E7D4F] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Order Complete & Paid
                          </span>
                        )}

                        {status === 'CANCELLED' && (
                          <span className="text-[11px] font-semibold text-[#B3261E]">
                            Order Cancelled (Slot Restored)
                          </span>
                        )}

                        {status === 'REFUNDED' && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Refunded ({order.razorpay_refund_id || 'Processed'})
                          </span>
                        )}
                      </div>

                      {/* Right action group: Assign Delivery & Admin Refund */}
                      <div className="flex items-center gap-2">
                        {status !== 'CANCELLED' && status !== 'DELIVERED' && status !== 'REFUNDED' && (
                          <button
                            type="button"
                            onClick={() => setAssigningOrder(order)}
                            className="px-3 py-1 rounded-lg border border-[#E8DFD2] hover:bg-[#F3EBE0] text-xs font-semibold text-[#1F1B16] flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5 text-[#8A1538]" />
                            <span>{order.delivery_partner_id ? 'Reassign Rider' : 'Assign Rider'}</span>
                          </button>
                        )}

                        {isAdmin && isPaidOnline && status !== 'REFUNDED' && (
                          <button
                            type="button"
                            onClick={() => setRefundOrderTarget(order)}
                            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                          >
                            Refund via Razorpay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB C: PRODUCTS & VARIANTS MANAGEMENT                */}
      {/* ==================================================== */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD2] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#8A1538]" />
                <span>Sweet Catalog & Counter Inventory</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                Add sweets, upload primary photos (JPEG/PNG/WebP $\le$ 5MB), and toggle counter stock status.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setProductForm({
                    id: '',
                    name: '',
                    category_id: categories[0]?.id || '',
                    description: '',
                    image_url: '',
                    pure_ghee: true,
                    shelf_life_days: 7,
                    ingredients: '',
                    variantLabel: '500g',
                    variantPrice: 300,
                    variantMrp: 340,
                    variantWeight: 500,
                    variantStock: 50,
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F6E08B]" />
                <span>+ Add New Sweet</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills & Search */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button
                  type="button"
                  onClick={() => setAdminProductCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    adminProductCategory === 'ALL'
                      ? 'bg-[#8A1538] text-white shadow-xs'
                      : 'bg-[#FBF7F1] border border-[#E8DFD2] text-[#6B6258] hover:text-[#1F1B16]'
                  }`}
                >
                  All Sweets ({products.length})
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAdminProductCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                        adminProductCategory === cat.id
                          ? 'bg-[#8A1538] text-white shadow-xs'
                          : 'bg-[#FBF7F1] border border-[#E8DFD2] text-[#6B6258] hover:text-[#1F1B16]'
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#6B6258] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminProductSearch}
                  onChange={(e) => setAdminProductSearch(e.target.value)}
                  placeholder="Filter by sweet name or SKU..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] focus:bg-white focus:outline-none focus:border-[#8A1538]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products
              .filter((prod) => {
                const matchesCat = adminProductCategory === 'ALL' || prod.category_id === adminProductCategory;
                const matchesSearch =
                  !adminProductSearch.trim() ||
                  prod.name.toLowerCase().includes(adminProductSearch.toLowerCase().trim()) ||
                  prod.variants?.some((v: any) => v.sku?.toLowerCase().includes(adminProductSearch.toLowerCase().trim()));
                return matchesCat && matchesSearch;
              })
              .map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover bg-[#F3EBE0] shrink-0 border border-[#E8DFD2]"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      aspect="square"
                      size="sm"
                      variant="admin-thumbnail"
                      productName={prod.name}
                      className="w-16 h-16 rounded-xl shrink-0 border border-[#E8DFD2]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-[#1F1B16] truncate">{prod.name}</h4>
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({
                                id: prod.id,
                                name: prod.name,
                                category_id: prod.category_id,
                                description: prod.description,
                                image_url: prod.image_url,
                                pure_ghee: prod.pure_ghee,
                                shelf_life_days: prod.shelf_life_days,
                                ingredients: prod.ingredients,
                                variantLabel: '',
                                variantPrice: 0,
                                variantMrp: 0,
                                variantWeight: 0,
                                variantStock: 0,
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="p-1 text-[#6B6258] hover:text-[#8A1538]"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1 text-[#6B6258] hover:text-[#B3261E]"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6258] line-clamp-1 mt-0.5">{prod.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8A1538] font-semibold flex-wrap">
                      {categories.find((c) => c.id === prod.category_id)?.name && (
                        <span className="bg-[#FAF4DE] text-[#7A1129] px-2 py-0.5 rounded-md font-bold text-[10px] border border-[#C79A3D]/30">
                          {categories.find((c) => c.id === prod.category_id)?.name}
                        </span>
                      )}
                      {prod.pure_ghee && <span>• 100% Desi Ghee</span>}
                      <span>• Shelf Life: {prod.shelf_life_days} days</span>
                    </div>
                  </div>
                </div>

                {/* Variants List & Counter Availability Switch */}
                <div className="space-y-1.5 pt-2 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6B6258] uppercase tracking-wider block">
                      Variants & Counter Stock:
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForVariant(prod);
                          setEditingVariantId(null);
                          setVariantForm({
                            label: '1 kg Box',
                            weightGrams: 1000,
                            price: 550,
                            mrp: 600,
                            stockQuantity: 50,
                            stockStatus: 'IN_STOCK',
                          });
                          setIsVariantModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#8A1538] hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Size</span>
                      </button>
                    )}
                  </div>

                  {prod.variants?.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-[#E8DFD2]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1F1B16]">{v.label}</span>
                        <span className="text-[#6B6258] tabular-nums font-semibold">{formatINR(v.price)}</span>
                        {v.mrp > v.price && (
                          <span className="text-[10px] text-stone-400 line-through tabular-nums">
                            {formatINR(v.mrp)}
                          </span>
                        )}
                        <span className="text-[10px] text-[#6B6258] bg-stone-100 px-1.5 py-0.5 rounded font-mono">
                          Qty: {v.stockQuantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForVariant(prod);
                              setEditingVariantId(v.id);
                              setVariantForm({
                                label: v.label,
                                weightGrams: v.weightGrams,
                                price: v.price,
                                mrp: v.mrp,
                                stockQuantity: v.stockQuantity,
                                stockStatus: v.stockStatus,
                              });
                              setIsVariantModalOpen(true);
                            }}
                            className="p-1 text-stone-400 hover:text-[#8A1538]"
                            title="Edit Variant Details"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleStock(v.id, v.stockStatus)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                            v.stockStatus === 'IN_STOCK'
                              ? 'bg-emerald-100 text-[#2E7D4F] hover:bg-red-100 hover:text-[#B3261E]'
                              : 'bg-red-100 text-[#B3261E] hover:bg-emerald-100 hover:text-[#2E7D4F]'
                          }`}
                        >
                          {v.stockStatus === 'IN_STOCK' ? '✓ In Stock' : '✕ Out of Stock'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB D: CATEGORIES                                    */}
      {/* ==================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD2] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#8A1538]" />
                <span>Categories Directory</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                Organize Barabanki sweets into storefront collection tiles.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setCategoryForm({ name: '', description: '', image_url: '', display_order: categories.length + 1 });
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F6E08B]" />
                <span>+ Add Category</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] flex items-start gap-3">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#F3EBE0] shrink-0 border border-[#E8DFD2]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-sm text-[#1F1B16] truncate">{cat.name}</h4>
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setCategoryForm({
                              name: cat.name,
                              description: cat.description || '',
                              image_url: cat.image_url,
                              display_order: cat.display_order,
                            });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-[#8A1538]"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 text-stone-400 hover:text-[#B3261E]"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6258] line-clamp-2 mt-0.5">{cat.description}</p>
                  <div className="text-[11px] text-[#8A1538] font-semibold mt-1">
                    {cat.product_count || 0} Sweets Listed • Order #{cat.display_order}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB E: CUSTOMERS DIRECTORY (ADMIN ONLY)              */}
      {/* ==================================================== */}
      {activeTab === 'customers' && isAdmin && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E8DFD2] pb-3">
            <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8A1538]" />
              <span>Customer Patron Directory</span>
            </h3>
            <p className="text-xs text-[#6B6258]">
              Registered buyers, mobile numbers, order histories, and lifetime value in Barabanki.
            </p>
          </div>

          <div className="divide-y divide-[#E8DFD2] overflow-x-auto">
            {customers.map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between gap-4 min-w-[500px] text-xs">
                <div>
                  <div className="font-bold text-sm text-[#1F1B16]">{cust.full_name}</div>
                  <div className="text-[#6B6258] mt-0.5">
                    Phone: {cust.phone || 'N/A'} • Email: {cust.email || 'N/A'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#8A1538] tabular-nums">
                    {formatINR(cust.totalSpent || 0)}
                  </div>
                  <div className="text-[11px] text-[#6B6258] mt-0.5">
                    {cust.orderCount || 0} orders • Last: {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString('en-IN') : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB F: DELIVERY PARTNERS                             */}
      {/* ==================================================== */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD2] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#8A1538]" />
                <span>Barabanki Local Delivery Fleet</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                Assign orders to trusted store delivery riders for doorstep drop-off.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setPartnerForm({ name: '', phone: '', vehicle_number: '' });
                  setIsPartnerModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F6E08B]" />
                <span>+ Add Rider</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryPartners.map((dp) => (
              <div key={dp.id} className="p-4 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#1F1B16]">{dp.name}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dp.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-[#2E7D4F]'
                        : dp.status === 'ON_DELIVERY'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {dp.status}
                  </span>
                </div>
                <div className="text-xs text-[#6B6258]">
                  Phone: <strong>{dp.phone}</strong> • Vehicle: <strong>{dp.vehicle_number}</strong>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5">
                  <span className="text-[#8A1538] font-semibold">
                    Assigned Orders: {dp.current_assigned_orders || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePartnerStatus(dp.id, dp.status)}
                    className="text-[11px] font-bold text-[#8A1538] hover:underline"
                  >
                    Toggle {dp.status === 'AVAILABLE' ? 'Off Duty' : 'Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB G: DELIVERY SLOTS MANAGEMENT                     */}
      {/* ==================================================== */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          {/* Bulk Generator Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8A1538]" />
                <span>Bulk Generate Delivery Slots</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                Generate 3 delivery windows per day (Morning 10-1, Afternoon 2-5, Evening 6-9) with automated cutoff hours.
              </p>
            </div>

            <form onSubmit={handleBulkGenerateSlots} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Days
                </label>
                <select
                  value={bulkDays}
                  onChange={(e) => setBulkDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-white text-xs font-medium focus:outline-none focus:border-[#8A1538]"
                >
                  <option value={7}>Next 7 Days (21 Slots)</option>
                  <option value={14}>Next 14 Days (42 Slots)</option>
                  <option value={30}>Next 30 Days (90 Slots)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Capacity / Slot
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingSlots}
                className="w-full min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#F6E08B]" />
                <span>{isGeneratingSlots ? 'Generating...' : 'Bulk Generate'}</span>
              </button>
            </form>
          </div>

          {/* Slots List */}
          <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-3">
            <h4 className="font-display font-bold text-base text-[#1F1B16]">
              Configured Delivery Slots ({deliverySlots.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {deliverySlots.slice(0, 15).map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[#1F1B16]">
                    <span>{s.slot_date}</span>
                    <span className="text-[#8A1538]">{s.start_time} - {s.end_time}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B6258]">
                    <span>Booked: {s.booked_count} / {s.capacity}</span>
                    <span className="text-[10px] font-semibold text-[#2E7D4F]">
                      {Math.max(0, s.capacity - s.booked_count)} slots left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB H: STORE SETTINGS (ADMIN ONLY)                   */}
      {/* ==================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#8A1538]" />
                <span>Store Settings & Delivery Parameters</span>
              </h3>
              <p className="text-xs text-[#6B6258]">
                {isAdmin
                  ? 'Configure Barabanki delivery charges, COD caps, and shop operating hours.'
                  : 'View-only access for staff members.'}
              </p>
            </div>
            {!isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Staff View-Only
              </span>
            )}
          </div>

          {storeSettings && (
            <form onSubmit={handleSaveStoreSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeSettings.store_name || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeSettings.phone || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Barabanki Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={storeSettings.delivery_charge || 0}
                  onChange={(e) => setStoreSettings({ ...storeSettings, delivery_charge: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={storeSettings.free_delivery_threshold || 0}
                  onChange={(e) => setStoreSettings({ ...storeSettings, free_delivery_threshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Cash on Delivery Limit (₹)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={storeSettings.cod_max_limit || 0}
                  onChange={(e) => setStoreSettings({ ...storeSettings, cod_max_limit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Serviceable Barabanki Pincodes
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeSettings.allowed_pincodes?.join(', ') || ''}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      allowed_pincodes: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-medium focus:outline-none focus:border-[#8A1538] disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                {isAdmin ? (
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Save Store Settings
                  </button>
                ) : (
                  <p className="text-xs text-[#6B6258] italic">
                    * Log in as Shop Owner (Admin) to modify store rates and settings.
                  </p>
                )}
              </div>
            </form>
          )}

          {/* COUPONS & DISCOUNTS MANAGEMENT (ADMIN ONLY FOR MUTATIONS) */}
          <div className="pt-6 border-t border-[#E8DFD2] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-bold text-base text-[#1F1B16] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8A1538]" />
                  <span>Store Coupons & Promo Discounts</span>
                </h4>
                <p className="text-xs text-[#6B6258]">
                  Manage coupon codes applicable at customer checkout (audited on change).
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCouponId(null);
                    setCouponForm({
                      code: '',
                      description: '',
                      discount_type: 'FLAT',
                      discount_value: 50,
                      min_order_amount: 300,
                      max_discount_amount: 150,
                      total_limit: '',
                      per_user_limit: '',
                      is_active: true,
                    });
                    setIsCouponModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#F6E08B]" />
                  <span>+ Add Coupon</span>
                </button>
              )}
            </div>

            {coupons.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B6258] bg-[#FBF7F1] rounded-xl border border-[#E8DFD2]">
                No coupons active. Click '+ Add Coupon' to configure promo codes.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map((coup) => (
                  <div
                    key={coup.id}
                    className="p-3.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#8A1538] bg-white px-2 py-0.5 rounded border border-[#E8DFD2]">
                          {coup.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            coup.is_active ? 'bg-emerald-100 text-[#2E7D4F]' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {coup.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCouponId(coup.id);
                              setCouponForm({
                                code: coup.code,
                                description: coup.description || '',
                                discount_type: coup.discount_type,
                                discount_value: coup.discount_value,
                                min_order_amount: coup.min_order_amount,
                                max_discount_amount: coup.max_discount_amount || 150,
                                total_limit: coup.total_limit || '',
                                per_user_limit: coup.per_user_limit || '',
                                is_active: coup.is_active,
                              });
                              setIsCouponModalOpen(true);
                            }}
                            className="p-1 text-stone-400 hover:text-[#8A1538]"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coup)}
                            className="p-1 text-stone-400 hover:text-[#B3261E]"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#1F1B16] font-medium">{coup.description}</p>

                    <div className="text-[11px] text-[#6B6258] flex items-center justify-between pt-1 border-t border-black/5">
                      <span>
                        Discount:{' '}
                        <strong>
                          {coup.discount_type === 'FLAT' ? `₹${coup.discount_value}` : `${coup.discount_value}%`}
                        </strong>{' '}
                        • Min: ₹{coup.min_order_amount}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coup)}
                          className="font-bold text-[#8A1538] hover:underline"
                        >
                          {coup.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B6258] border-t border-dashed border-[#E8DFD2]">
                      <span>
                        Limits: Total: {coup.total_limit ?? '∞'} • Per User: {coup.per_user_limit ?? '∞'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCouponForUsage(coup)}
                        className="font-semibold text-[#8A1538] hover:underline flex items-center gap-1"
                      >
                        <History className="w-3 h-3" />
                        <span>Usage ({coup.used_count || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB I: AUDIT TRAIL (ADMIN ONLY)                      */}
      {/* ==================================================== */}
      {activeTab === 'audit' && isAdmin && (
        <div className="bg-white rounded-2xl border border-[#E8DFD2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E8DFD2] pb-3">
            <h3 className="font-display font-bold text-lg text-[#1F1B16] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8A1538]" />
              <span>Security & Operations Audit Trail</span>
            </h3>
            <p className="text-xs text-[#6B6258]">
              Immutable log of order status transitions, Razorpay refunds, and store configuration changes.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B6258]">
              No audit logs recorded yet. Actions by staff and owner will automatically appear here.
            </div>
          ) : (
            <div className="divide-y divide-[#E8DFD2] overflow-x-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-[500px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#8A1538]">{log.action}</span>
                      <span className="text-[#6B6258]">• User: <strong>{log.user_name}</strong> ({log.user_role})</span>
                    </div>
                    <div className="text-[#1F1B16] mt-0.5 font-mono text-[11px]">
                      Entity: {log.entity_type} #{log.entity_id} • Details: {JSON.stringify(log.details)}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#6B6258] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB J: GIFT HAMPERS COMPOSITION BUILDER              */}
      {/* ==================================================== */}
      {activeTab === 'hampers' && (
        <AdminHampersTab
          hampers={hampers}
          products={products}
          isAdmin={isAdmin}
          getAuthHeaders={getAuthHeaders}
          onRefresh={loadAllAdminData}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* TAB K: MARKETING (OFFERS, BANNERS, COUPONS)          */}
      {/* ==================================================== */}
      {activeTab === 'marketing' && (
        <AdminMarketingTab
          offers={offers}
          banners={banners}
          coupons={coupons}
          isAdmin={isAdmin}
          getAuthHeaders={getAuthHeaders}
          onRefresh={loadAllAdminData}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* TAB L: REVIEWS MODERATION                            */}
      {/* ==================================================== */}
      {activeTab === 'reviews' && (
        <AdminReviewsTab
          reviews={reviews}
          isAdmin={isAdmin}
          getAuthHeaders={getAuthHeaders}
          onRefresh={loadAllAdminData}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* TAB M: BULK / CORPORATE / WEDDING ENQUIRIES          */}
      {/* ==================================================== */}
      {activeTab === 'enquiries' && (
        <AdminEnquiriesTab
          enquiries={enquiries}
          isAdmin={isAdmin}
          getAuthHeaders={getAuthHeaders}
          onRefresh={loadAllAdminData}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* TAB N: NOTIFICATIONS FEED & TEST EMAIL DISPATCH      */}
      {/* ==================================================== */}
      {activeTab === 'notifications' && (
        <AdminNotificationsTab
          notifications={notifications}
          isAdmin={isAdmin}
          getAuthHeaders={getAuthHeaders}
          onRefresh={loadAllAdminData}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* COUPON USAGE MODAL                                   */}
      {/* ==================================================== */}
      {selectedCouponForUsage && (
        <AdminCouponUsageModal
          coupon={selectedCouponForUsage}
          isOpen={Boolean(selectedCouponForUsage)}
          getAuthHeaders={getAuthHeaders}
          onClose={() => setSelectedCouponForUsage(null)}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT                          */}
      {/* ==================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-lg text-[#1F1B16]">
                {productForm.id ? 'Edit Sweet / Mithai' : 'Add New Sweet to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Mithai Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Kesar Peda"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Category *
                </label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-white text-xs font-medium focus:outline-none focus:border-[#8A1538]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Aromatic Awadhi specialty prepared with pure ingredients..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              {/* PRIMARY PHOTO UPLOAD (JPEG/PNG/WebP <= 5MB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16]">
                  Primary Product Photo (JPEG, PNG, WebP $\le$ 5MB)
                </label>

                <div className="flex items-center gap-3">
                  {productForm.image_url ? (
                    <img
                      src={productForm.image_url}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD2] bg-[#F3EBE0]"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      aspect="square"
                      size="sm"
                      variant="admin-thumbnail"
                      className="w-16 h-16 rounded-xl border border-[#E8DFD2]"
                    />
                  )}

                  <div className="space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-[#E8DFD2] bg-white hover:bg-[#F3EBE0] text-xs font-semibold text-[#1F1B16] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#8A1538]" />
                      <span>{isUploadingImage ? 'Uploading photo...' : 'Upload Primary Photo'}</span>
                    </button>
                    <div className="text-[10px] text-[#6B6258]">
                      Square 1:1 image recommended. Max file size: 5MB.
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant specifications if new product */}
              {!productForm.id && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E8DFD2]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Variant Pack</label>
                    <input
                      type="text"
                      value={productForm.variantLabel}
                      onChange={(e) => setProductForm({ ...productForm, variantLabel: e.target.value })}
                      placeholder="e.g. 500g"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DFD2] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.variantPrice}
                      onChange={(e) => setProductForm({ ...productForm, variantPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DFD2] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={productForm.variantMrp}
                      onChange={(e) => setProductForm({ ...productForm, variantMrp: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DFD2] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Stock</label>
                    <input
                      type="number"
                      value={productForm.variantStock}
                      onChange={(e) => setProductForm({ ...productForm, variantStock: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DFD2] text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-[#E8DFD2]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
                >
                  Save Mithai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ASSIGN DELIVERY PARTNER                     */}
      {/* ==================================================== */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-base text-[#1F1B16]">
                Assign Delivery Partner
              </h3>
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#6B6258]">
              Order #{assigningOrder.order_number} to {assigningOrder.address_snapshot?.recipient_name} ({assigningOrder.address_snapshot?.street_address})
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16]">
                Select Barabanki Rider
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-white text-xs font-medium focus:outline-none focus:border-[#8A1538]"
              >
                <option value="">-- Choose Active Rider --</option>
                {deliveryPartners.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name} ({dp.vehicle_number}) • {dp.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignDelivery}
                className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: RAZORPAY REFUND CONFIRMATION (ADMIN ONLY)   */}
      {/* ==================================================== */}
      {refundOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-[#1F1B16]">
                Refund Order #{refundOrderTarget.order_number}?
              </h3>
              <p className="text-xs text-[#6B6258] leading-relaxed">
                This will trigger the Razorpay Refunds API for <strong>{formatINR(refundOrderTarget.total_amount)}</strong> back to the customer's account and transition order status to <strong>REFUNDED</strong>.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                Refund Reason
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundOrderTarget(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRefunding}
                onClick={handleExecuteRefund}
                className="flex-1 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isRefunding ? 'Processing Refund...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: CATEGORY ADD / EDIT (ADMIN ONLY)            */}
      {/* ==================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-base text-[#1F1B16]">
                {editingCategoryId ? 'Edit Sweet Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategoryId(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desi Ghee Ladoos"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Traditional Awadhi sweets made with pure shuddh ghee..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={categoryForm.image_url}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E8DFD2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategoryId(null);
                  }}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: DELIVERY PARTNER ONBOARDING (ADMIN ONLY)    */}
      {/* ==================================================== */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-base text-[#1F1B16]">
                Onboard Delivery Rider
              </h3>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Rider Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94500 XXXXX"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  placeholder="UP-32-XX-0000"
                  value={partnerForm.vehicle_number}
                  onChange={(e) => setPartnerForm({ ...partnerForm, vehicle_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E8DFD2]">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
                >
                  Add Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: COUPON ADD / EDIT (ADMIN ONLY)              */}
      {/* ==================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-base text-[#1F1B16]">
                {editingCouponId ? 'Edit Store Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCouponModalOpen(false);
                  setEditingCouponId(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BARABANKI50"
                  value={couponForm.code}
                  disabled={Boolean(editingCouponId)}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs font-mono font-bold focus:outline-none focus:border-[#8A1538] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Flat ₹50 off on orders over ₹399"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-white text-xs font-medium"
                  >
                    <option value="FLAT">Flat (₹)</option>
                    <option value="PERCENTAGE">Percent (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">
                    Value {couponForm.discount_type === 'FLAT' ? '(₹)' : '(%)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.max_discount_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Total Limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="∞ (Unlimited)"
                    value={couponForm.total_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, total_limit: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Per-User Limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="∞ (Unlimited)"
                    value={couponForm.per_user_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, per_user_limit: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E8DFD2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCouponModalOpen(false);
                    setEditingCouponId(null);
                  }}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 7: SWEET VARIANT ADD / EDIT (ADMIN ONLY)       */}
      {/* ==================================================== */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-3">
              <h3 className="font-display font-bold text-base text-[#1F1B16]">
                {editingVariantId ? 'Edit Sweet Pack Variant' : 'Add Pack Size Variant'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsVariantModalOpen(false);
                  setEditingVariantId(null);
                  setSelectedProductForVariant(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#6B6258]">
              Product: <strong>{selectedProductForVariant?.name}</strong>
            </div>

            <form onSubmit={handleSaveVariant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16] mb-1">
                  Pack Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500g Box (approx 12 pcs)"
                  value={variantForm.label}
                  onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs focus:outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Weight (grams)</label>
                  <input
                    type="number"
                    min={50}
                    value={variantForm.weightGrams}
                    onChange={(e) => setVariantForm({ ...variantForm, weightGrams: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Counter Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={variantForm.stockQuantity}
                    onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1B16] mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={variantForm.mrp}
                    onChange={(e) => setVariantForm({ ...variantForm, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD2] bg-[#FBF7F1] text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E8DFD2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsVariantModalOpen(false);
                    setEditingVariantId(null);
                    setSelectedProductForVariant(null);
                  }}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#8A1538] hover:bg-[#701029] text-white text-xs font-bold shadow-xs"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: GENERIC DESTRUCTIVE CONFIRMATION DIALOG     */}
      {/* ==================================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E8DFD2] space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-[#1F1B16]">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-[#6B6258] leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 min-h-[44px] rounded-xl border border-[#E8DFD2] text-xs font-semibold text-[#1F1B16] hover:bg-[#F3EBE0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold text-white shadow-xs ${
                  confirmDialog.isDestructive
                    ? 'bg-[#B3261E] hover:bg-red-700'
                    : 'bg-[#8A1538] hover:bg-[#701029]'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
