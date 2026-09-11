import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  MessageCircle, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Truck, 
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { CartItem, CustomerDetails } from '../types';
import { formatNaira } from '../utils/currency';
import { buildCartWhatsAppMessage, createWhatsAppUrl } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  whatsAppNumber: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCartCheckoutWhatsApp: (items: CartItem[], customer: CustomerDetails) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  whatsAppNumber,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCartCheckoutWhatsApp,
}) => {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    deliveryNotes: '',
  });
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const formattedMessage = useMemo(() => {
    return buildCartWhatsAppMessage(cartItems, customer);
  }, [cartItems, customer]);

  const whatsAppUrl = useMemo(() => {
    return createWhatsAppUrl(whatsAppNumber, formattedMessage);
  }, [whatsAppNumber, formattedMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    onCartCheckoutWhatsApp(cartItems, customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Hardware Cart ({totalUnits})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-sm font-mono">Your secure electronics cart is empty.</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Explore Store Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const isOutOfStock = item.product.stock <= 0;
                const exceedsStock = item.quantity > item.product.stock && !isOutOfStock;

                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex gap-3 items-center"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] font-mono text-emerald-400">
                        SKU: {item.product.sku}
                      </p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">
                        {formatNaira(item.product.price * item.quantity)}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({formatNaira(item.product.price)} ea)
                        </span>
                      </p>

                      {exceedsStock && (
                        <p className="text-[10px] font-mono text-amber-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> Max available: {item.product.stock}
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center border border-slate-700 bg-slate-900 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 font-mono text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Customer Information (Optional before WhatsApp Order) */}
            {cartItems.length > 0 && (
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    Delivery Details (Optional)
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500"
                />

                <input
                  type="text"
                  placeholder="Delivery Address & City"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500"
                />

                {/* Message preview toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>{showPreview ? 'Hide WhatsApp Message Preview' : 'Preview WhatsApp Order Message'}</span>
                </button>

                {showPreview && (
                  <div className="relative">
                    <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {formattedMessage}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({totalUnits} items):</span>
                  <span className="text-white">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tamper-Proof Packaging:</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span className="text-emerald-400 font-mono">{formatNaira(subtotal)} NGN</span>
                </div>
              </div>

              {/* Primary Buy on WhatsApp Action */}
              <button
                id="btn-cart-checkout-whatsapp"
                type="button"
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Buy All via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <p className="text-[10px] text-center text-slate-500 font-mono">
                WhatsApp connects directly to SecureTech Dispatch (+{whatsAppNumber}). Stock is reserved upon order dispatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
