/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  MessageCircle, 
  Boxes, 
  AlertTriangle, 
  Filter, 
  CheckCircle, 
  ArrowUpDown,
  ExternalLink,
  PhoneCall,
  RotateCcw
} from 'lucide-react';
import { Product, CartItem, CustomerDetails, AdminUser, OrderRecord, AuditLogEntry } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './data/products';
import { INITIAL_ORDERS, INITIAL_AUDIT_LOGS } from './data/mockOrders';
import { formatNaira } from './utils/currency';
import { 
  getStoredWhatsAppNumber, 
  saveStoredWhatsAppNumber,
  createWhatsAppUrl 
} from './utils/whatsapp';
import { 
  getStoredAdminUser, 
  saveAdminSession, 
  clearAdminSession 
} from './utils/auth';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { WhatsAppBuyModal } from './components/WhatsAppBuyModal';
import { CartDrawer } from './components/CartDrawer';
import { InventoryManager } from './components/InventoryManager';
import { WhatsAppSettingsModal } from './components/WhatsAppSettingsModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { BackendPortal } from './components/admin/BackendPortal';

const STORAGE_KEY_PRODUCTS = 'securetech_inventory_products_ngn_v1';
const STORAGE_KEY_CART = 'securetech_cart_ngn_v1';
const STORAGE_KEY_ORDERS = 'securetech_orders_ngn_v1';
const STORAGE_KEY_AUDIT = 'securetech_audit_logs_v1';

export default function App() {
  // Products / Inventory state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Admin User session state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getStoredAdminUser);

  // Orders Ledger state with localStorage persistence
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Audit Logs state with localStorage persistence
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS;
  });

  // WhatsApp store number
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>(getStoredWhatsAppNumber);

  // Active View ('store' | 'inventory' | 'admin')
  const [activeView, setActiveView] = useState<'store' | 'inventory' | 'admin'>('store');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock' | 'rating'>('featured');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Modals state
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [whatsAppBuyProduct, setWhatsAppBuyProduct] = useState<{ product: Product; quantity: number } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWhatsAppSettingsOpen, setIsWhatsAppSettingsOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, description: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync products to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync orders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Sync audit logs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Handle WhatsApp number change
  const handleUpdateWhatsAppNumber = (num: string) => {
    saveStoredWhatsAppNumber(num);
    setWhatsAppNumber(num);
    addToast('whatsapp', 'WhatsApp Dispatch Number Updated', `Direct orders will now connect to +${num}`);
  };

  // Admin session handlers
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    saveAdminSession(user);
    addToast('success', 'Admin Authenticated', `Welcome back, ${user.name} (${user.role}).`);
    handleAddAuditLog({
      user: `${user.name} (${user.role})`,
      action: 'Admin Login',
      details: `Administrator logged into Backend Portal from ${user.email}`,
      type: 'auth'
    });
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setActiveView('store');
    addToast('info', 'Admin Signed Out', 'Backend portal session safely concluded.');
  };

  const handleAddAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...entry,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Inventory & Product modifications
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: newStock };
      }
      return p;
    }));
    addToast('info', 'Stock Quantity Updated', `SKU stock updated to ${newStock} units.`);
  };

  const handleUpdateThreshold = (productId: string, newThreshold: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, lowStockThreshold: newThreshold };
      }
      return p;
    }));
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    }));
    addToast('success', 'Unit Price Updated', `Product price adjusted to ${formatNaira(newPrice)}`);
  };

  const handleAddNewProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    addToast('success', 'Product Added to Inventory', `${newProd.name} added with ${newProd.stock} units.`);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    addToast('success', 'Product Record Updated', `${updatedProd.name} (${updatedProd.sku}) updated successfully.`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('warning', 'Product Purged', 'Item permanently removed from store catalog.');
  };

  const handleBulkUpdatePrices = (percentageDelta: number) => {
    setProducts(prev => prev.map(p => {
      const factor = 1 + (percentageDelta / 100);
      const newPrice = Math.round((p.price * factor) / 500) * 500;
      return { ...p, price: Math.max(500, newPrice) };
    }));
    addToast('success', 'Bulk Prices Updated', `Catalog adjusted by ${percentageDelta > 0 ? '+' : ''}${percentageDelta}%.`);
  };

  const handleBulkRestockAdd = (targetIds: string[], addUnits: number) => {
    setProducts(prev => prev.map(p => {
      if (targetIds.includes(p.id)) {
        return { ...p, stock: p.stock + addUnits };
      }
      return p;
    }));
    addToast('success', 'Batch Restock Applied', `Added +${addUnits} units to ${targetIds.length} SKUs.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderRecord['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast('info', 'Order Status Updated', `Order ${orderId} updated to ${newStatus.toUpperCase()}`);
  };

  const handleResetInventory = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    addToast('info', 'Inventory Reset', 'Catalog reset to original factory test data.');
  };

  const handleRestockAllLow = () => {
    setProducts(prev => prev.map(p => {
      if (p.stock <= p.lowStockThreshold) {
        return { ...p, stock: p.stock + 10 };
      }
      return p;
    }));
    addToast('success', 'Low Stock Restocked', 'Added +10 units to all low or out-of-stock items.');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      addToast('warning', 'Product Out of Stock', `${product.name} is currently out of stock. Use Buy Now via WhatsApp to backorder.`);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    addToast('success', 'Added to Hardware Cart', `${quantity}x ${product.name} ready in your cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const safeQuantity = Math.min(product.stock, quantity);

    setCartItems(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: safeQuantity } 
        : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Buy Now via WhatsApp: Deducts stock and records order in backend
  const handleWhatsAppOrderCompleted = (product: Product, quantity: number, customer: CustomerDetails) => {
    // Deduct stock
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        const remaining = Math.max(0, p.stock - quantity);
        return { ...p, stock: remaining };
      }
      return p;
    }));

    // Record order in backend ledger
    const newOrder: OrderRecord = {
      id: `ORD-NG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: [{
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        price: product.price,
      }],
      totalAmount: product.price * quantity,
      customer,
      status: 'whatsapp_sent'
    };
    setOrders(prev => [newOrder, ...prev]);

    handleAddAuditLog({
      user: `Customer: ${customer.name}`,
      action: 'WhatsApp Order Created',
      details: `Dispatched order ${newOrder.id} for ${quantity}x ${product.name} (${formatNaira(newOrder.totalAmount)}).`,
      sku: product.sku,
      type: 'status_change'
    });

    addToast(
      'whatsapp',
      'WhatsApp Order Dispatched!',
      `Order for ${quantity}x ${product.name} generated. Live inventory reduced by ${quantity} units.`
    );
  };

  // Cart Checkout via WhatsApp: Deducts stock and records multi-item order in backend
  const handleCartCheckoutWhatsApp = (items: CartItem[], customer: CustomerDetails) => {
    // Deduct stock for all items
    setProducts(prev => {
      let updated = [...prev];
      items.forEach(item => {
        updated = updated.map(p => {
          if (p.id === item.product.id) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        });
      });
      return updated;
    });

    // Record order in backend ledger
    const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const newOrder: OrderRecord = {
      id: `ORD-NG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      customer,
      status: 'whatsapp_sent'
    };
    setOrders(prev => [newOrder, ...prev]);

    handleAddAuditLog({
      user: `Customer: ${customer.name}`,
      action: 'Cart Order Dispatched',
      details: `Cart order ${newOrder.id} with ${items.length} items dispatched (${formatNaira(totalAmount)}).`,
      type: 'status_change'
    });

    // Clear cart
    setCartItems([]);

    addToast(
      'whatsapp',
      'Cart Order Sent via WhatsApp!',
      `Full cart order dispatched to WhatsApp dispatch. Warehouse stock counts updated.`
    );
  };

  // Trigger WhatsApp Quick Buy modal
  const handleOpenBuyNowWhatsApp = (product: Product, quantity: number = 1) => {
    setWhatsAppBuyProduct({ product, quantity });
  };

  // Quick WhatsApp chat / general question
  const handleFloatingWhatsApp = () => {
    const defaultMsg = `Hello SecureTech Electronics team! I have an inquiry regarding your secure hardware products and stock availability.`;
    const url = createWhatsAppUrl(whatsAppNumber, defaultMsg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filtered & sorted products for store view
  const displayProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchCategory = selectedCategory === 'All Products' || p.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchSearch = !query || 
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.securitySpecs.some(s => s.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query);
        const matchStock = hideOutOfStock ? p.stock > 0 : true;

        return matchCategory && matchSearch && matchStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock') return b.stock - a.stock;
        if (sortBy === 'rating') return b.rating - a.rating;
        // featured default
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy, hideOutOfStock]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        products={products}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInventory={() => setActiveView('inventory')}
        onOpenWhatsAppSettings={() => setIsWhatsAppSettingsOpen(true)}
        whatsAppNumber={whatsAppNumber}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        adminUser={adminUser}
      />

      {/* Main Content Area */}
      {activeView === 'admin' ? (
        adminUser ? (
          <BackendPortal
            currentUser={adminUser}
            onLogout={handleAdminLogout}
            onReturnToStore={() => setActiveView('store')}
            products={products}
            onAddProduct={handleAddNewProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onBulkUpdatePrices={handleBulkUpdatePrices}
            onBulkRestockAdd={handleBulkRestockAdd}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
          />
        ) : (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminLoginView
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => setActiveView('store')}
            />
          </div>
        )
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeView === 'inventory' ? (
            /* Inventory Management View */
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Boxes className="w-6 h-6 text-emerald-400" />
                    Product Inventory Management
                  </h1>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Real-time stock controls, SKU audits, threshold monitors & direct WhatsApp reordering.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-return-store-catalog"
                    onClick={() => setActiveView('store')}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer"
                  >
                    <span>View Store Catalog</span>
                    <span className="text-emerald-400 font-mono">({products.length} items)</span>
                  </button>
                  <button
                    id="btn-go-to-admin-from-inv"
                    onClick={() => setActiveView('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Login</span>
                  </button>
                </div>
              </div>

              <InventoryManager
                products={products}
                onUpdateStock={handleUpdateStock}
                onUpdateThreshold={handleUpdateThreshold}
                onUpdatePrice={handleUpdatePrice}
                onAddNewProduct={handleAddNewProduct}
                onResetInventory={handleResetInventory}
                onRestockAllLow={handleRestockAllLow}
                onWhatsAppInquire={(p) => handleOpenBuyNowWhatsApp(p, 1)}
                supplierWhatsAppNumber={whatsAppNumber}
                onBulkRestockComplete={(items, totalUnits) => {
                  addToast(
                    'whatsapp',
                    'Bulk Restock WhatsApp Sent!',
                    `Wholesale batch order for ${items.length} SKUs (${totalUnits} units) dispatched to supplier via WhatsApp.`
                  );
                }}
              />
            </div>
          ) : (
            /* Store Catalog View */
            <div className="space-y-6">
            {/* Store Hero Banner with Security Assurance */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Secure Electronics & Hardware Encryption</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  High-Security Hardware, <br />
                  <span className="text-emerald-400">Direct WhatsApp Checkout.</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Order military-grade encrypted storage, hardware security tokens, and privacy-shielded devices. Real-time warehouse inventory with instant 1-click WhatsApp order dispatch and tamper-proof shipping.
                </p>

                {/* Quick Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Live Stock Reservation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Merchant Dispatch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Tamper-Evident Delivery</span>
                  </div>
                </div>
              </div>

              {/* Decorative Subtle Grid Graphic */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden md:flex items-center justify-end pr-8 pointer-events-none opacity-20">
                <Lock className="w-56 h-56 text-emerald-400" />
              </div>
            </div>

            {/* Category Filter Pills & Sort Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    id={`filter-cat-${category.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort & Stock Filters */}
              <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs font-mono">
                {/* Out of Stock Checkbox */}
                <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideOutOfStock}
                    onChange={(e) => setHideOutOfStock(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Out of Stock</span>
                </label>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1 text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <select
                    id="select-sort-products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="featured">Featured Security</option>
                    <option value="stock">Highest Stock</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCategory !== 'All Products' || hideOutOfStock) && (
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>
                  Showing <strong>{displayProducts.length}</strong> matching electronics products
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Products');
                    setHideOutOfStock(false);
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Product Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNowWhatsApp={(p, q) => handleOpenBuyNowWhatsApp(p, q)}
                    onViewDetails={(p) => setInspectProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Boxes className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-300 font-mono">No secure electronics products found.</p>
                <p className="text-xs text-slate-500 font-mono">
                  Try adjusting your search criteria or switch category filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Products');
                    setHideOutOfStock(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      )}

      {/* Floating WhatsApp Quick Action Button */}
      <button
        id="btn-floating-whatsapp"
        onClick={handleFloatingWhatsApp}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-[0_4px_25px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 cursor-pointer"
        title="Chat with SecureTech Sales & Stock Dispatch on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-slate-950" />
        <span className="hidden sm:inline font-mono">WhatsApp Store Desk</span>
      </button>

      {/* Product Details Modal */}
      <ProductModal
        product={inspectProduct}
        isOpen={!!inspectProduct}
        onClose={() => setInspectProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNowWhatsApp={handleOpenBuyNowWhatsApp}
      />

      {/* WhatsApp Buy Now Checkout Modal */}
      <WhatsAppBuyModal
        product={whatsAppBuyProduct?.product || null}
        initialQuantity={whatsAppBuyProduct?.quantity || 1}
        whatsAppNumber={whatsAppNumber}
        isOpen={!!whatsAppBuyProduct}
        onClose={() => setWhatsAppBuyProduct(null)}
        onOrderCompleted={handleWhatsAppOrderCompleted}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        whatsAppNumber={whatsAppNumber}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCartCheckoutWhatsApp={handleCartCheckoutWhatsApp}
      />

      {/* WhatsApp Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={isWhatsAppSettingsOpen}
        onClose={() => setIsWhatsAppSettingsOpen(false)}
        currentNumber={whatsAppNumber}
        onSaveNumber={handleUpdateWhatsAppNumber}
      />

      {/* Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />

      {/* Security Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <img 
              src="/images/eden-empire-logo.png.png" 
              alt="Eden Empire Technology Limited" 
              className="h-6 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-slate-400">Live WhatsApp Merchant: +{whatsAppNumber}</span>
            <span>•</span>
            <button 
              onClick={() => setIsWhatsAppSettingsOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Configure WhatsApp
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveView('inventory')}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Stock Inventory ({products.reduce((acc, p) => acc + p.stock, 0)} units)
            </button>
            <span>•</span>
            <button 
              id="btn-footer-backend-portal"
              onClick={() => setActiveView('admin')}
              className="text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
