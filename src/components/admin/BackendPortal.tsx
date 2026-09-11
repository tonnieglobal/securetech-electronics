import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Boxes, 
  TrendingUp, 
  FileText, 
  History, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  LogOut, 
  DollarSign, 
  Percent, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  Truck,
  UserCheck,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Product, AdminUser, OrderRecord, AuditLogEntry } from '../../types';
import { formatNaira, CURRENCY_SYMBOL } from '../../utils/currency';
import { downloadProductsCSV, downloadOrdersCSV } from '../../utils/exportReports';
import { ProductFormModal } from './ProductFormModal';
import { AuditReportModal } from './AuditReportModal';

interface BackendPortalProps {
  currentUser: AdminUser;
  onLogout: () => void;
  onReturnToStore: () => void;
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkUpdatePrices: (percentageDelta: number) => void;
  onBulkRestockAdd: (productIds: string[], addUnits: number) => void;
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderRecord['status']) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export const BackendPortal: React.FC<BackendPortalProps> = ({
  currentUser,
  onLogout,
  onReturnToStore,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkUpdatePrices,
  onBulkRestockAdd,
  orders,
  onUpdateOrderStatus,
  auditLogs,
  onAddAuditLog,
}) => {
  // Navigation tabs: 'overview' | 'products' | 'orders' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'audit'>('overview');

  // Product management state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name');
  
  // Selection for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkMarkupPercent, setBulkMarkupPercent] = useState<number>(5);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);

  // Stats
  const totalSKUs = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const healthyItems = products.filter(p => p.stock > p.lowStockThreshold);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Category breakdown for reporting
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; units: number; valuation: number }> = {};
    products.forEach(p => {
      if (!stats[p.category]) {
        stats[p.category] = { count: 0, units: 0, valuation: 0 };
      }
      stats[p.category].count += 1;
      stats[p.category].units += p.stock;
      stats[p.category].valuation += p.stock * p.price;
    });
    return stats;
  }, [products]);

  // Filtered and sorted products
  const displayProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

        let matchesStatus = true;
        if (statusFilter === 'healthy') matchesStatus = p.stock > p.lowStockThreshold;
        if (statusFilter === 'low') matchesStatus = p.stock > 0 && p.stock <= p.lowStockThreshold;
        if (statusFilter === 'out') matchesStatus = p.stock === 0;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery, selectedCategory, statusFilter, sortBy]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const rand = Math.floor(100 + Math.random() * 900);
    const duplicated: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-COPY${rand}`,
      name: `${product.name} (Copy)`,
      stock: 5,
    };
    onAddProduct(duplicated);
    onAddAuditLog({
      user: `${currentUser.name} (${currentUser.role})`,
      action: 'Product Duplicated',
      details: `Cloned SKU ${product.sku} to new SKU ${duplicated.sku}`,
      sku: duplicated.sku,
      type: 'product_crud'
    });
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.id);
    onAddAuditLog({
      user: `${currentUser.name} (${currentUser.role})`,
      action: 'Product Removed',
      details: `Deleted product ${productToDelete.name} (${productToDelete.sku}) from catalog.`,
      sku: productToDelete.sku,
      type: 'product_crud'
    });
    setProductToDelete(null);
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === displayProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(displayProducts.map(p => p.id));
    }
  };

  const handleApplyBulkMarkup = (percentage: number) => {
    onBulkUpdatePrices(percentage);
    onAddAuditLog({
      user: `${currentUser.name} (${currentUser.role})`,
      action: 'Bulk Price Adjustment',
      details: `Adjusted catalog prices by ${percentage > 0 ? '+' : ''}${percentage}% across inventory.`,
      type: 'price'
    });
  };

  const handleApplyBulkRestock = (unitsToAdd: number) => {
    const targetIds = selectedProductIds.length > 0 ? selectedProductIds : products.map(p => p.id);
    onBulkRestockAdd(targetIds, unitsToAdd);
    onAddAuditLog({
      user: `${currentUser.name} (${currentUser.role})`,
      action: 'Bulk Restock Inflow',
      details: `Added +${unitsToAdd} units to ${targetIds.length} designated SKUs.`,
      type: 'stock'
    });
    setSelectedProductIds([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono tracking-tight">
                  SECURE<span className="text-emerald-400">TECH</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold">
                  Backend Portal
                </span>
              </div>
              <span className="block text-[11px] text-slate-400 font-mono">
                Hardware Product Management & Reporting Hub
              </span>
            </div>
          </div>

          {/* User Session Badge & Actions */}
          <div className="flex items-center gap-3">
            {/* Return to Public Storefront */}
            <button
              id="btn-return-storefront"
              onClick={onReturnToStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Storefront</span>
            </button>

            {/* Active User Card */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-white font-sans">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{currentUser.email}</span>
              </div>

              <button
                id="btn-admin-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/50 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                title="End administrator session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="border-t border-slate-800/80 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
            <button
              id="tab-backend-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Executive Dashboard</span>
            </button>

            <button
              id="tab-backend-products"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Product Management ({totalSKUs})</span>
            </button>

            <button
              id="tab-backend-orders"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Orders & Sales Reports ({orders.length})</span>
            </button>

            <button
              id="tab-backend-audit"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full space-y-6">

        {/* ===================== TAB 1: EXECUTIVE DASHBOARD & REPORTING ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Export & Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Executive Warehouse & Financial Overview
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time synchronization across warehouse SKUs and WhatsApp sales channels
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Audit Sheet</span>
                </button>

                <button
                  onClick={() => downloadProductsCSV(products)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_2px_12px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Products CSV</span>
                </button>
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Total Warehouse Valuation</span>
                  <span className="text-emerald-400 font-bold">{CURRENCY_SYMBOL}</span>
                </div>
                <p className="text-2xl font-bold font-mono text-white mt-1.5">
                  {formatNaira(totalValuation)}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">Current asset holding</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Total Physical Units</span>
                  <Package className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-white mt-1.5">
                  {totalUnits}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">Across {totalSKUs} certified SKUs</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Sales Revenue Logged</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
                  {formatNaira(totalRevenue)}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">{orders.length} WhatsApp purchases recorded</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/50 bg-amber-950/10">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                  <span>Stock Shortage Alerts</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-amber-300 mt-1.5">
                  {lowStockItems.length + outOfStockItems.length}
                </p>
                <span className="text-[11px] text-amber-500/80 font-mono">
                  {outOfStockItems.length} out of stock · {lowStockItems.length} low threshold
                </span>
              </div>
            </div>

            {/* Inventory Health & Category Allocation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Portfolio Breakdown */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Valuation by Hardware Category
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">{Object.keys(categoryStats).length} Categories</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(categoryStats).map(([catName, stats]: [string, { count: number; units: number; valuation: number }]) => {
                    const percentage = totalValuation > 0 ? (stats.valuation / totalValuation) * 100 : 0;
                    return (
                      <div key={catName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300">{catName} ({stats.count} SKUs, {stats.units} units)</span>
                          <span className="text-white font-bold">{formatNaira(stats.valuation)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${Math.max(4, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inventory Health & Critical Action Box */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Critical Stock Actions & Shortage List
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {healthyItems.length} of {totalSKUs} healthy
                    </span>
                  </div>

                  {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-mono text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      All warehouse products are operating above safety thresholds.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {[...outOfStockItems, ...lowStockItems].map(p => {
                        const isOut = p.stock === 0;
                        return (
                          <div 
                            key={p.id}
                            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <div className="min-w-0">
                              <p className="text-white font-semibold truncate">{p.name}</p>
                              <span className="text-[11px] text-emerald-400">SKU: {p.sku}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isOut ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {isOut ? '0 units (OUT)' : `${p.stock} units left`}
                              </span>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="text-emerald-400 hover:underline text-[11px] cursor-pointer"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Batch replenishment:</span>
                  <button
                    onClick={() => handleApplyBulkRestock(20)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick +20 Units to All Shortages</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================== TAB 2: PRODUCT MANAGEMENT CRUD ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Control Bar: Search, Category Filter, Status Filter & Add Product */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    id="input-backend-product-search"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by hardware name, SKU, or specs..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Actions: Add New Product & Add Product Trigger */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-open-add-product"
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_2px_15px_rgba(16,185,129,0.35)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Security Product</span>
                  </button>
                </div>
              </div>

              {/* Second Row: Filters & Bulk Action Tools */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Encrypted Storage', 'Hardware Security', 'Privacy Devices', 'Secure Networking', 'Smart Surveillance'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Stock Health Toggle */}
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="healthy">Healthy Only (&gt; Min)</option>
                    <option value="low">Low Stock Only</option>
                    <option value="out">Out of Stock Only</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="name">Sort: Name A-Z</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock-asc">Stock: Low to High</option>
                    <option value="stock-desc">Stock: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Toolbar if items are selected or overall modifiers */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllProducts}
                  className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  {selectedProductIds.length === displayProducts.length && displayProducts.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Select All ({selectedProductIds.length} chosen)</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Bulk Price Adjuster */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Price Adjust:</span>
                  <button
                    onClick={() => handleApplyBulkMarkup(5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Raise prices by 5%"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => handleApplyBulkMarkup(-5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Discount prices by 5%"
                  >
                    -5%
                  </button>
                </div>

                {/* Bulk Restock */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Batch Restock:</span>
                  <button
                    onClick={() => handleApplyBulkRestock(10)}
                    className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer font-bold"
                  >
                    +10 Units
                  </button>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8"></th>
                      <th className="py-3 px-3">Product / SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Unit Price (NGN)</th>
                      <th className="py-3 px-3 text-center">Stock</th>
                      <th className="py-3 px-3 text-center">Threshold</th>
                      <th className="py-3 px-3 text-right">Valuation (NGN)</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {displayProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      const isOut = product.stock === 0;
                      const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;

                      return (
                        <tr 
                          key={product.id}
                          className={`hover:bg-slate-850/60 transition-colors ${
                            isSelected ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleSelectProduct(product.id)}
                              className="text-slate-500 hover:text-emerald-400 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-sans font-semibold text-white truncate max-w-xs sm:max-w-sm">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-emerald-400 font-bold">{product.sku}</span>
                                  {product.featured && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">Featured</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-400">
                            {product.category}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-white">
                            {formatNaira(product.price)}
                          </td>

                          <td className="py-3 px-3 text-center font-bold">
                            <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-200'}>
                              {product.stock}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center text-slate-400">
                            {product.lowStockThreshold}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            {formatNaira(product.stock * product.price)}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(product)}
                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(product)}
                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Clone SKU"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                              <button
                                onClick={() => setProductToDelete(product)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {displayProducts.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No products matched the active search or category filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: ORDERS & SALES REPORTS ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Orders Summary Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Direct Sales Ledger & WhatsApp Purchase Orders
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Fulfillment statuses, customer delivery notes, and realized Naira revenue
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadOrdersCSV(orders)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_2px_12px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Orders CSV</span>
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Order ID & Date</th>
                      <th className="py-3 px-3">Customer & Delivery</th>
                      <th className="py-3 px-3">Purchased Items</th>
                      <th className="py-3 px-3 text-right">Order Total (NGN)</th>
                      <th className="py-3 px-3 text-center">Fulfillment Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {orders.map((order) => {
                      const statusStyles: Record<string, string> = {
                        whatsapp_sent: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                        processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                        shipped: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                        delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                      };

                      return (
                        <tr key={order.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-3 px-3">
                            <p className="text-white font-bold">{order.id}</p>
                            <span className="text-slate-400 text-[11px]">{order.date}</span>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-sans font-semibold text-white">{order.customer.name}</p>
                            <span className="text-[11px] text-emerald-400 block">{order.customer.phone}</span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {order.customer.address}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-[11px] text-slate-300 truncate max-w-xs">
                                  • {item.productName} <strong className="text-emerald-400">(x{item.quantity})</strong>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                            {formatNaira(order.totalAmount)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as OrderRecord['status'];
                                onUpdateOrderStatus(order.id, newStatus);
                                onAddAuditLog({
                                  user: `${currentUser.name} (${currentUser.role})`,
                                  action: 'Order Status Changed',
                                  details: `Updated ${order.id} status to ${newStatus.toUpperCase()}`,
                                  type: 'status_change'
                                });
                              }}
                              className={`text-[11px] font-mono px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                                statusStyles[order.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              <option value="whatsapp_sent">WhatsApp Inquiry</option>
                              <option value="processing">Processing & Escrow</option>
                              <option value="shipped">Dispatched / Shipped</option>
                              <option value="delivered">Delivered & Verified</option>
                            </select>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors cursor-pointer"
                            >
                              View Notes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: AUDIT ACTIVITY LOG ===================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  System Audit Trail & Cryptographic Security Log
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Immutable record of inventory fluctuations, price changes, and operator logins
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-400">
                {auditLogs.length} events logged
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl divide-y divide-slate-800/80">
              {auditLogs.map((log) => {
                return (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono hover:bg-slate-850/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-emerald-400">
                          {log.action}
                        </span>
                        <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
                      </div>
                      <p className="text-white font-sans text-xs">{log.details}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-slate-400 block text-[11px]">{log.user}</span>
                      {log.sku && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded font-mono">
                          {log.sku}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialProduct={editingProduct}
        onSaveProduct={(savedProd) => {
          if (editingProduct) {
            onUpdateProduct(savedProd);
            onAddAuditLog({
              user: `${currentUser.name} (${currentUser.role})`,
              action: 'Product Edited',
              details: `Updated SKU ${savedProd.sku} (${savedProd.name}) - Stock: ${savedProd.stock}, Price: ${formatNaira(savedProd.price)}`,
              sku: savedProd.sku,
              type: 'product_crud'
            });
          } else {
            onAddProduct(savedProd);
            onAddAuditLog({
              user: `${currentUser.name} (${currentUser.role})`,
              action: 'Product Created',
              details: `Created new SKU ${savedProd.sku} with ${savedProd.stock} units at ${formatNaira(savedProd.price)}`,
              sku: savedProd.sku,
              type: 'product_crud'
            });
          }
        }}
      />

      {/* Audit Sheet Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        products={products}
        orders={orders}
      />

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-sans">Delete Security Product?</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Are you sure you want to permanently purge <strong className="text-white">{productToDelete.name}</strong> ({productToDelete.sku}) from the store catalog and inventory database?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-product"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Order Details: {selectedOrderDetails.id}</h3>
                <span className="text-[11px] text-slate-400">{selectedOrderDetails.date}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer & Destination:</span>
                <p className="text-white font-bold text-sm font-sans">{selectedOrderDetails.customer.name}</p>
                <p className="text-emerald-400">{selectedOrderDetails.customer.phone}</p>
                <p className="text-slate-300">{selectedOrderDetails.customer.address}</p>
              </div>

              {selectedOrderDetails.customer.deliveryNotes && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Special Instructions:</span>
                  <p className="text-slate-300 mt-0.5">{selectedOrderDetails.customer.deliveryNotes}</p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-slate-400 block text-[11px] mb-1">Line Items:</span>
                <div className="space-y-1 divide-y divide-slate-800">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="pt-1 flex items-center justify-between">
                      <span className="text-slate-200">{item.productName} (x{item.quantity})</span>
                      <span className="text-white font-bold">{formatNaira(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold">Total Order Value:</span>
                <span className="text-emerald-400 font-bold">{formatNaira(selectedOrderDetails.totalAmount)} NGN</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
