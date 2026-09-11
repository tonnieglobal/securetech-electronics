import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Product, CustomerDetails } from '../types';
import { formatNaira } from '../utils/currency';
import { 
  buildSingleProductWhatsAppMessage, 
  createWhatsAppUrl 
} from '../utils/whatsapp';

interface WhatsAppBuyModalProps {
  product: Product | null;
  initialQuantity?: number;
  whatsAppNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (product: Product, quantity: number, customer: CustomerDetails) => void;
}

export const WhatsAppBuyModal: React.FC<WhatsAppBuyModalProps> = ({
  product,
  initialQuantity = 1,
  whatsAppNumber,
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(() => {
    if (product.stock <= 0) return 1;
    return Math.min(initialQuantity, product.stock);
  });
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    deliveryNotes: '',
  });
  const [copied, setCopied] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const maxAllowed = isOutOfStock ? 10 : product.stock;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (!isOutOfStock && next > maxAllowed) return maxAllowed;
      return next;
    });
  };

  const formattedMessage = useMemo(() => {
    return buildSingleProductWhatsAppMessage(product, quantity, customer);
  }, [product, quantity, customer]);

  const whatsAppUrl = useMemo(() => {
    return createWhatsAppUrl(whatsAppNumber, formattedMessage);
  }, [whatsAppNumber, formattedMessage]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedWhatsApp = () => {
    // Open WhatsApp in new tab
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    // Register order & reduce stock
    onOrderCompleted(product, quantity, customer);
    onClose();
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-whatsapp-buy"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5 fill-emerald-500/20" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Instant WhatsApp Buy Now
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Direct verified merchant dispatch to +{whatsAppNumber}
              </p>
            </div>
          </div>
          <button
            id="btn-close-whatsapp-buy-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Product Summary Row */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover border border-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  SKU: {product.sku}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Stock: {product.stock > 0 ? `${product.stock} units available` : 'Backorder / Pre-order'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white truncate">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatNaira(product.price)} NGN each · {product.warranty}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">Quantity:</span>
              <div className="flex items-center border border-slate-700 bg-slate-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1 font-mono text-xs font-semibold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isOutOfStock && quantity >= maxAllowed}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1">
                Total: {formatNaira(totalPrice)}
              </span>
            </div>
          </div>

          {/* Optional Delivery Details Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Customer & Delivery Details <span className="text-slate-500 font-normal normal-case">(Appended to WhatsApp message)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Your Name
                </label>
                <input
                  id="input-whatsapp-customer-name"
                  type="text"
                  placeholder="e.g. Alex Vance"
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Your Contact Phone (optional)
                </label>
                <input
                  id="input-whatsapp-customer-phone"
                  type="text"
                  placeholder="e.g. +1 555-0199"
                  value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Delivery Destination Address
                </label>
                <input
                  id="input-whatsapp-customer-address"
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Suite 400, Springfield"
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          {/* Real-time WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                Live WhatsApp Message Preview
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {formattedMessage}
            </pre>
          </div>

          {/* Security & Tamper Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-emerald-300 font-semibold">Verified Hardware Protocol:</strong> Clicking Buy Now launches WhatsApp directly with your pre-configured hardware order. Our logistics desk verifies inventory in real-time and issues an encrypted escrow payment invoice.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 text-center sm:text-left">
            <span>Order Value: </span>
            <strong className="text-white text-sm font-mono">{formatNaira(totalPrice)} NGN</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy Message'}
            </button>

            <button
              id="btn-confirm-whatsapp-order"
              type="button"
              onClick={handleProceedWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-[0_2px_15px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Launch WhatsApp & Place Order</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
