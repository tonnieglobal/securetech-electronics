import React from 'react';
import { 
  ShieldCheck, 
  Boxes, 
  ShoppingCart, 
  MessageCircle, 
  Phone, 
  Lock, 
  AlertTriangle,
  Search
} from 'lucide-react';
import { Product, AdminUser } from '../types';

interface NavbarProps {
  products: Product[];
  cartCount: number;
  onOpenCart: () => void;
  onOpenInventory: () => void;
  onOpenWhatsAppSettings: () => void;
  whatsAppNumber: string;
  activeView: 'store' | 'inventory' | 'admin';
  setActiveView: (view: 'store' | 'inventory' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  adminUser?: AdminUser | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  products,
  cartCount,
  onOpenCart,
  onOpenWhatsAppSettings,
  whatsAppNumber,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  adminUser,
}) => {
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Security Banner */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
              <Lock className="w-3 h-3" /> FIPS 140-2 & EAL6+ Certified Hardware
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Tamper-evident vacuum packaging on all shipments</span>
          </div>

          <button
            id="btn-whatsapp-header"
            onClick={onOpenWhatsAppSettings}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-mono cursor-pointer"
            title="Configure store WhatsApp contact"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" />
            <span>WhatsApp Dispatch: +{whatsAppNumber}</span>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button 
            id="brand-logo-btn"
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <img 
              src="/images/eden-empire-logo.png.png" 
              alt="Eden Empire Technology Limited" 
              className="h-[80px] w-auto object-contain"
            />
          </button>

          {/* View Toggle tabs */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              id="tab-store-catalog"
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'store'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Store Catalog
            </button>
            <button
              id="tab-inventory-manager"
              onClick={() => setActiveView('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'inventory'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Live Inventory</span>
              {lowStockCount > 0 && (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {lowStockCount} low
                </span>
              )}
            </button>
            <button
              id="tab-backend-portal"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Portal</span>
              {adminUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Admin Logged In" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar (Store View) */}
        {activeView === 'store' && (
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-500" />
            <input
              id="input-nav-search"
              type="text"
              placeholder="Search secure electronics or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Inventory Quick Status Pill */}
          <button
            id="btn-inventory-status-pill"
            onClick={() => setActiveView(activeView === 'inventory' ? 'store' : 'inventory')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-slate-700 text-xs text-slate-300 transition-all cursor-pointer"
            title="Open Inventory Management"
          >
            <Boxes className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-mono">
              Stock: <strong className="text-white">{totalStockUnits}</strong> units
            </span>
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="hidden xl:inline">Alerts</span>
              </span>
            )}
          </button>

          {/* Admin Portal Shortcut Button */}
          <button
            id="btn-admin-portal-header"
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              activeView === 'admin'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Login to Admin Portal"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="inline font-medium">Login</span>
          </button>

          {/* Cart Button */}
          <button
            id="btn-open-cart"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-slate-950 text-emerald-300 text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
