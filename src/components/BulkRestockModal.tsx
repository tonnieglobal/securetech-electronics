import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageCircle, 
  Truck, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Boxes, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Trash2,
  PackagePlus,
  Building2
} from 'lucide-react';
import { Product } from '../types';
import { 
  buildSupplierRestockWhatsAppMessage, 
  createWhatsAppUrl,
  RestockItemRequest 
} from '../utils/whatsapp';

interface BulkRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  restockQuantities: Record<string, number>;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveProduct: (productId: string) => void;
  defaultSupplierNumber: string;
  onConfirmRestock: (
    items: RestockItemRequest[], 
    applyToInventory: boolean
  ) => void;
}

export const BulkRestockModal: React.FC<BulkRestockModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  restockQuantities,
  onUpdateQuantity,
  onRemoveProduct,
  defaultSupplierNumber,
  onConfirmRestock,
}) => {
  if (!isOpen || selectedProducts.length === 0) return null;

  const [supplierNumber, setSupplierNumber] = useState(defaultSupplierNumber);
  const [supplierDeskName, setSupplierDeskName] = useState('Hardware Supplier Logistics Desk');
  const [warehouseNote, setWarehouseNote] = useState('High priority replenishment - standard tamper-sealed packing required.');
  const [applyImmediately, setApplyImmediately] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Build items array
  const itemsRequest: RestockItemRequest[] = useMemo(() => {
    return selectedProducts.map(product => ({
      product,
      requestedQty: restockQuantities[product.id] || 20,
    }));
  }, [selectedProducts, restockQuantities]);

  const totalUnits = useMemo(() => {
    return itemsRequest.reduce((sum, item) => sum + item.requestedQty, 0);
  }, [itemsRequest]);

  const formattedMessage = useMemo(() => {
    return buildSupplierRestockWhatsAppMessage(itemsRequest, warehouseNote, supplierDeskName);
  }, [itemsRequest, warehouseNote, supplierDeskName]);

  const whatsAppUrl = useMemo(() => {
    return createWhatsAppUrl(supplierNumber, formattedMessage);
  }, [supplierNumber, formattedMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    // Open WhatsApp
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    // Call confirm handler
    onConfirmRestock(itemsRequest, applyImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-bulk-restock-supplier"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                Bulk Restock Request via WhatsApp
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Combined wholesale replenishment for <strong className="text-emerald-400">{selectedProducts.length}</strong> items ({totalUnits} total units)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Supplier Configuration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Supplier Recipient / Phone
              </label>
              <input
                id="input-supplier-whatsapp-number"
                type="text"
                value={supplierNumber}
                onChange={e => setSupplierNumber(e.target.value)}
                placeholder="e.g. 15557328732"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Destination WhatsApp business phone number</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Supplier Logistics Desk Name
              </label>
              <input
                type="text"
                value={supplierDeskName}
                onChange={e => setSupplierDeskName(e.target.value)}
                placeholder="e.g. Tier-1 Hardware Distributor"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Addressed supplier entity</span>
            </div>
          </div>

          {/* Selected Items Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                Selected Restock SKUs ({selectedProducts.length})
              </span>
              <span className="text-xs font-mono text-slate-400">
                Total Restock Volume: <strong className="text-emerald-400">{totalUnits} units</strong>
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
              {itemsRequest.map(({ product, requestedQty }) => {
                const isOut = product.stock <= 0;
                const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;

                return (
                  <div 
                    key={product.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md font-sans">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                          <span className="text-emerald-400">SKU: {product.sku}</span>
                          <span className="text-slate-500">|</span>
                          <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-400'}>
                            Current: {product.stock} units {isOut && '(Out)'} {isLow && '(Low)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Add:</span>
                        <div className="flex items-center border border-slate-700 bg-slate-900 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, Math.max(1, requestedQty - 5))}
                            className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
                            title="Decrease batch by 5"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={requestedQty}
                            onChange={(e) => onUpdateQuantity(product.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 bg-slate-950 text-center text-xs font-mono font-bold text-emerald-400 py-0.5 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, requestedQty + 5)}
                            className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
                            title="Increase batch by 5"
                          >
                            +5
                          </button>
                        </div>
                        <span className="text-xs font-mono text-slate-400">units</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveProduct(product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="Remove from restock batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Warehouse Note */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Internal Warehouse Dispatch Instructions (appended to WhatsApp message)
            </label>
            <input
              type="text"
              value={warehouseNote}
              onChange={e => setWarehouseNote(e.target.value)}
              placeholder="e.g. Expedited air shipment requested. Destination Depot 02."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Live Message Preview Accordion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Supplier WhatsApp Message Preview' : 'Show Supplier WhatsApp Message Preview'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Preview'}</span>
              </button>
            </div>

            {showPreview && (
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                {formattedMessage}
              </pre>
            )}
          </div>

          {/* Simulation Toggle Option */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <input
              id="checkbox-apply-restock"
              type="checkbox"
              checked={applyImmediately}
              onChange={e => setApplyImmediately(e.target.checked)}
              className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="checkbox-apply-restock" className="text-xs text-slate-300 font-mono cursor-pointer">
              <strong className="text-white block font-semibold">
                Simulate Warehouse Inbound Arrival (+{totalUnits} units)
              </strong>
              Immediately credit these requested units into the local store inventory upon sending the WhatsApp restock message.
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400">
            Batch Total: <strong className="text-white font-mono text-sm">{totalUnits} units</strong> across <strong className="text-emerald-400">{selectedProducts.length} SKUs</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="btn-send-bulk-restock-whatsapp"
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-[0_2px_15px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Send Supplier Restock via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
