import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw, 
  PlusCircle, 
  DollarSign, 
  Search, 
  CheckSquare,
  Square,
  PackagePlus,
  Truck,
  Layers,
  MessageCircle,
  RotateCcw,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira, CURRENCY_SYMBOL } from '../utils/currency';
import { BulkRestockModal } from './BulkRestockModal';
import { RestockItemRequest } from '../utils/whatsapp';

interface InventoryManagerProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdateThreshold: (productId: string, newThreshold: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onAddNewProduct: (product: Product) => void;
  onResetInventory: () => void;
  onRestockAllLow: () => void;
  onWhatsAppInquire: (product: Product) => void;
  supplierWhatsAppNumber?: string;
  onBulkRestockComplete?: (items: RestockItemRequest[], totalUnits: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  onUpdateStock,
  onUpdateThreshold,
  onUpdatePrice,
  onAddNewProduct,
  onResetInventory,
  onRestockAllLow,
  onWhatsAppInquire,
  supplierWhatsAppNumber = '15557328732',
  onBulkRestockComplete,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Bulk Restock Mode State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({});
  const [showBulkModal, setShowBulkModal] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Hardware Security');
  const [newProdPrice, setNewProdPrice] = useState(150000);
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdThreshold, setNewProdThreshold] = useState(3);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('XTS-AES 256 Encryption, Secure Tamper Enclosure');

  // Stats
  const totalSKUs = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const allNeedingRestock = products.filter(p => p.stock <= p.lowStockThreshold);

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'low') return product.stock > 0 && product.stock <= product.lowStockThreshold;
    if (filterStatus === 'out') return product.stock === 0;
    if (filterStatus === 'healthy') return product.stock > product.lowStockThreshold;
    return true;
  });

  // Toggle Bulk Mode
  const handleToggleBulkMode = () => {
    if (!isBulkMode) {
      setIsBulkMode(true);
      // Automatically pre-select low stock items for convenience
      const lowStockIds = allNeedingRestock.map(p => p.id);
      setSelectedProductIds(lowStockIds);
      // Initialize quantities: default 20 units or calculated batch
      const initialQtys: Record<string, number> = {};
      products.forEach(p => {
        initialQtys[p.id] = Math.max(15, p.lowStockThreshold * 4);
      });
      setRestockQuantities(initialQtys);
    } else {
      setIsBulkMode(false);
      setSelectedProductIds([]);
    }
  };

  // Select all low-stock items
  const handleSelectAllLowStock = () => {
    setIsBulkMode(true);
    const lowStockIds = allNeedingRestock.map(p => p.id);
    setSelectedProductIds(lowStockIds);
    setRestockQuantities(prev => {
      const updated = { ...prev };
      allNeedingRestock.forEach(p => {
        if (!updated[p.id]) {
          updated[p.id] = Math.max(15, p.lowStockThreshold * 4);
        }
      });
      return updated;
    });
  };

  // Toggle individual product selection
  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // ensure default quantity
        if (!restockQuantities[productId]) {
          const prod = products.find(p => p.id === productId);
          const defaultQty = prod ? Math.max(15, prod.lowStockThreshold * 4) : 20;
          setRestockQuantities(q => ({ ...q, [productId]: defaultQty }));
        }
        return [...prev, productId];
      }
    });
  };

  // Toggle all visible products
  const handleToggleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const newIds = Array.from(new Set([...selectedProductIds, ...visibleIds]));
      setSelectedProductIds(newIds);
      // Ensure quantities
      setRestockQuantities(prev => {
        const updated = { ...prev };
        visibleIds.forEach(id => {
          if (!updated[id]) updated[id] = 20;
        });
        return updated;
      });
    }
  };

  const handleUpdateRestockQuantity = (productId: string, qty: number) => {
    setRestockQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, qty),
    }));
  };

  const handleRemoveFromRestock = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId));
  };

  // Selected products objects
  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  const totalRestockUnits = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + (restockQuantities[p.id] || 20), 0);
  }, [selectedProducts, restockQuantities]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) return;

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: newProdName.trim(),
      sku: newProdSku.trim().toUpperCase(),
      category: newProdCategory,
      price: Number(newProdPrice) || 49.99,
      stock: Number(newProdStock) || 0,
      lowStockThreshold: Number(newProdThreshold) || 3,
      description: newProdDesc.trim() || 'Secure hardware verified device with tamper protection.',
      securitySpecs: newProdSpecs.split(',').map(s => s.trim()).filter(Boolean),
      certification: 'Certified Tamper-Proof',
      warranty: '2-Year Standard Warranty',
      rating: 5.0,
      reviewsCount: 1,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    };

    onAddNewProduct(newProduct);
    setShowAddModal(false);
    setNewProdName('');
    setNewProdSku('');
    setNewProdDesc('');
  };

  const handleConfirmRestockExecution = (
    items: RestockItemRequest[], 
    applyToInventory: boolean
  ) => {
    if (applyToInventory) {
      items.forEach(({ product, requestedQty }) => {
        onUpdateStock(product.id, product.stock + requestedQty);
      });
    }

    if (onBulkRestockComplete) {
      onBulkRestockComplete(items, totalRestockUnits);
    }

    // Reset selection
    setSelectedProductIds([]);
    setIsBulkMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Inventory Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total SKUs</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {totalSKUs}
          </p>
          <span className="text-[11px] text-slate-500 font-mono">Catalog items</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Stock In Hand</span>
            <PackagePlus className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {totalUnits}
          </p>
          <span className="text-[11px] text-slate-500 font-mono">Physical units</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Inventory Value</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">{CURRENCY_SYMBOL}</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {formatNaira(totalValuation)}
          </p>
          <span className="text-[11px] text-slate-500 font-mono">NGN warehouse value</span>
        </div>

        {/* Low Stock Alerts Card with Quick Bulk Restock trigger */}
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 bg-amber-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-amber-400">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {lowStockItems.length}
            </p>
            <span className="text-[11px] text-amber-500/80 font-mono">Below min threshold</span>
          </div>
          {allNeedingRestock.length > 0 && (
            <button
              id="btn-quick-select-low-stock"
              type="button"
              onClick={handleSelectAllLowStock}
              className="mt-2 text-[11px] font-mono font-semibold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer text-left"
            >
              <span>Bulk Restock Low ({allNeedingRestock.length})</span>
            </button>
          )}
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-slate-900 border border-rose-900/40 bg-rose-950/10">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400">
            <span>Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {outOfStockItems.length}
          </p>
          <span className="text-[11px] text-rose-500/80 font-mono">Requires restock</span>
        </div>
      </div>

      {/* Bulk Restock Active Notification & Action Bar */}
      {isBulkMode && (
        <div 
          id="bulk-restock-action-banner"
          className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                Bulk Restock Selection Active
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  {selectedProductIds.length} of {products.length} Selected
                </span>
              </h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Total Restock Units: <strong className="text-emerald-400">{totalRestockUnits} units</strong>. Select items below and send a combined order message to your supplier.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {allNeedingRestock.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllLowStock}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
              >
                Select All Low Stock ({allNeedingRestock.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Clear
            </button>

            <button
              id="btn-trigger-bulk-restock-modal"
              type="button"
              disabled={selectedProductIds.length === 0}
              onClick={() => setShowBulkModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_2px_12px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Send Supplier WhatsApp ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters, Bulk Restock Toggle, Add Product, Restock */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="input-inventory-search"
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'low'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            Low Stock ({lowStockItems.length})
          </button>
          <button
            onClick={() => setFilterStatus('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'out'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            Out of Stock ({outOfStockItems.length})
          </button>
        </div>

        {/* Global Inventory Actions including BULK RESTOCK TOGGLE */}
        <div className="flex items-center gap-2">
          {/* Bulk Restock Toggle Button */}
          <button
            id="btn-toggle-bulk-restock"
            type="button"
            onClick={handleToggleBulkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              isBulkMode 
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200'
            }`}
            title="Toggle multi-select bulk restock mode for supplier WhatsApp orders"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Bulk Restock {isBulkMode ? 'ON' : 'Mode'}</span>
            {isBulkMode && selectedProductIds.length > 0 && (
              <span className="bg-slate-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {selectedProductIds.length}
              </span>
            )}
          </button>

          <button
            id="btn-open-add-product"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onResetInventory}
            title="Reset to default store inventory"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {/* Bulk Checkbox Header */}
                {isBulkMode && (
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAllVisible}
                      className="text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="Select / Deselect all visible items"
                    >
                      {filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id)) ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Stock Health</th>
                {isBulkMode ? (
                  <th className="py-3 px-4 text-right">Restock Batch (+Units)</th>
                ) : (
                  <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
                const isSelected = selectedProductIds.includes(product.id);
                const currentRestockQty = restockQuantities[product.id] || 20;

                return (
                  <tr 
                    key={product.id}
                    id={`inventory-row-${product.id}`}
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-emerald-950/25 border-l-2 border-l-emerald-500' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox Column for Bulk Mode */}
                    {isBulkMode && (
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleProductSelection(product.id)}
                          className="text-slate-400 hover:text-emerald-400 cursor-pointer p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Item & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white font-sans text-xs truncate max-w-xs">
                            {product.name}
                          </p>
                          <span className="text-[11px] text-emerald-400 font-mono">
                            {product.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-300">
                      {product.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">{formatNaira(product.price)}</span>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4">
                      <span className={`font-bold text-sm ${
                        isOutOfStock 
                          ? 'text-rose-400' 
                          : isLowStock 
                            ? 'text-amber-400' 
                            : 'text-emerald-400'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>

                    {/* Threshold */}
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={product.lowStockThreshold}
                          onChange={(e) => onUpdateThreshold(product.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200 text-center focus:border-emerald-500/50"
                        />
                        <span className="text-[10px] text-slate-500">alert</span>
                      </div>
                    </td>

                    {/* Health Status Badge */}
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[11px]">
                          <XCircle className="w-3 h-3 text-rose-400" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Healthy Stock
                        </span>
                      )}
                    </td>

                    {/* Action Column: Bulk restock qty OR normal adjustments */}
                    <td className="py-3 px-4 text-right">
                      {isBulkMode ? (
                        <div className="flex items-center justify-end gap-2">
                          {isSelected ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 uppercase">Restock:</span>
                              <div className="flex items-center border border-emerald-500/50 bg-slate-950 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRestockQuantity(product.id, Math.max(1, currentRestockQty - 5))}
                                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
                                >
                                  -5
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={currentRestockQty}
                                  onChange={(e) => handleUpdateRestockQuantity(product.id, Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-12 bg-transparent text-center text-xs font-bold text-emerald-400 py-0.5 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRestockQuantity(product.id, currentRestockQty + 5)}
                                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
                                >
                                  +5
                                </button>
                              </div>
                              <span className="text-[11px] text-slate-400">units</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleProductSelection(product.id)}
                              className="px-2.5 py-1 text-xs text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer"
                            >
                              + Select
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 1))}
                            disabled={product.stock <= 0}
                            className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-xs transition-colors disabled:opacity-30 cursor-pointer"
                            title="Reduce stock by 1"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, product.stock + 1)}
                            className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 rounded text-xs transition-colors cursor-pointer"
                            title="Add 1 unit to stock"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, product.stock + 5)}
                            className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 rounded text-xs transition-colors cursor-pointer"
                            title="Add 5 units to stock"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, product.stock + 10)}
                            className="px-2 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/70 text-emerald-300 rounded text-xs transition-colors cursor-pointer"
                            title="Add 10 units to stock"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => onWhatsAppInquire(product)}
                            className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 border border-slate-700 transition-colors ml-1 cursor-pointer"
                            title="Generate WhatsApp Buy/Inquire link for this item"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Boxes className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No inventory items matched your search filter.</p>
          </div>
        )}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Add New Secure Electronics Product
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aegis Guard Hardware Enclave"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEC-ENC-01"
                    value={newProdSku}
                    onChange={e => setNewProdSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value as Product['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hardware Security">Hardware Security</option>
                    <option value="Encrypted Storage">Encrypted Storage</option>
                    <option value="Privacy Devices">Privacy Devices</option>
                    <option value="Secure Networking">Secure Networking</option>
                    <option value="Smart Surveillance">Smart Surveillance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Price (₦ NGN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={e => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdThreshold}
                    onChange={e => setNewProdThreshold(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Security hardware specifications and purpose..."
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Security Protocols (comma separated)</label>
                <input
                  type="text"
                  placeholder="AES-256 XTS, Anti-Tamper Mesh, FIPS 140-3"
                  value={newProdSpecs}
                  onChange={e => setNewProdSpecs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Restock Supplier WhatsApp Modal */}
      <BulkRestockModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedProducts={selectedProducts}
        restockQuantities={restockQuantities}
        onUpdateQuantity={handleUpdateRestockQuantity}
        onRemoveProduct={handleRemoveFromRestock}
        defaultSupplierNumber={supplierWhatsAppNumber}
        onConfirmRestock={handleConfirmRestockExecution}
      />
    </div>
  );
};
