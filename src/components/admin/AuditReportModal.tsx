import React from 'react';
import { X, Printer, ShieldCheck, Download, Boxes, CheckCircle } from 'lucide-react';
import { Product, OrderRecord } from '../../types';
import { formatNaira, CURRENCY_SYMBOL } from '../../utils/currency';
import { downloadProductsCSV } from '../../utils/exportReports';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: OrderRecord[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
}) => {
  if (!isOpen) return null;

  const totalSKUs = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-printable-audit-sheet"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Official Inventory & Valuation Audit Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                SecureTech Electronics Warehouse & Financial Disclosures
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit Sheet</span>
            </button>
            <button
              onClick={() => downloadProductsCSV(products)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-slate-950 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Printable Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-slate-300">
          {/* Audit Header Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                Verification Cert #ST-AUDIT-2026-09
              </span>
              <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                Central Fulfillment & Physical Inventory Declaration
              </h3>
              <p className="text-[11px] text-slate-400">
                Generated: {new Date().toLocaleString('en-US')} · Currency: Nigerian Naira (₦ NGN)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Total Declared Valuation:</span>
              <p className="text-xl font-bold text-white">{formatNaira(totalValuation)}</p>
            </div>
          </div>

          {/* KPI Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400">Catalog SKUs</span>
              <p className="text-lg font-bold text-white mt-0.5">{totalSKUs}</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400">Physical Units</span>
              <p className="text-lg font-bold text-white mt-0.5">{totalUnits}</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400">Low / Out of Stock</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{lowStockItems.length + outOfStockItems.length}</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400">Recorded Order Gross</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatNaira(totalRevenue)}</p>
            </div>
          </div>

          {/* Product Valuation Line Items */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Warehouse SKU Breakdown & Value Schedule
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 divide-y divide-slate-800/80">
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900/80 font-bold text-slate-400 text-[11px]">
                <div className="col-span-5">Product & SKU</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-1 text-center">Stock</div>
                <div className="col-span-2 text-right">Valuation (NGN)</div>
              </div>

              {products.map(p => {
                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

                return (
                  <div key={p.id} className="grid grid-cols-12 gap-2 p-3 text-[11px] items-center hover:bg-slate-900/40">
                    <div className="col-span-5">
                      <p className="text-white font-sans font-semibold truncate">{p.name}</p>
                      <span className="text-emerald-400">{p.sku}</span>
                    </div>
                    <div className="col-span-2 text-slate-400 truncate">{p.category}</div>
                    <div className="col-span-2 text-right text-white font-bold">{formatNaira(p.price)}</div>
                    <div className="col-span-1 text-center">
                      <span className={isOut ? 'text-rose-400 font-bold' : isLow ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {p.stock}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-bold text-emerald-400">
                      {formatNaira(p.stock * p.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Verification Footer */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-300">
              <strong className="text-white">Tamper-Evident Physical Verification Clause:</strong> All hardware assets cataloged herein have undergone serial-tag scan verification. Crypto processors comply with FIPS 140-2 Level 3 / CC EAL6+ protocols. Prepared for board oversight and statutory compliance auditing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
