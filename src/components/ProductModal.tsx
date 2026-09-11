import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MessageCircle, 
  ShoppingCart, 
  Layers, 
  Award, 
  ShieldAlert 
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/currency';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNowWhatsApp: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNowWhatsApp,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-product-details"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              SKU: {product.sku}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Category: {product.category}
            </span>
          </div>
          <button
            id="btn-close-product-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Certification:</span>
                <span className="text-emerald-400 font-semibold">{product.certification}</span>
              </div>
            </div>

            {/* Core Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {formatNaira(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through font-mono">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Verified Authentic
                  </span>
                </div>

                {/* Inventory Status Bar */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Inventory Status:</span>
                    {isOutOfStock ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock: {product.stock} units
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock: {product.stock} units
                      </span>
                    )}
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOutOfStock 
                          ? 'w-0' 
                          : isLowStock 
                            ? 'bg-amber-500 w-[20%]' 
                            : 'bg-emerald-500 w-[75%]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Threshold: {product.lowStockThreshold} units</span>
                    <span>Reorder alert configured</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Warranty & Seal */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Warranty: <strong className="text-slate-200">{product.warranty}</strong></span>
                <span>Rating: <strong className="text-amber-400">★ {product.rating}</strong> ({product.reviewsCount})</span>
              </div>
            </div>
          </div>

          {/* Security Specifications Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Hardware Security Protocols
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.securitySpecs.map((spec, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 font-mono"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Qty:</span>
            <div className="flex items-center border border-slate-700 bg-slate-900 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="px-3 py-1 font-mono text-xs font-semibold text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => isOutOfStock ? q + 1 : Math.min(product.stock, q + 1))}
                disabled={!isOutOfStock && quantity >= product.stock}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {formatNaira(product.price * quantity)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-modal-add-cart"
              type="button"
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              disabled={isOutOfStock}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              id="btn-modal-buy-whatsapp"
              type="button"
              onClick={() => {
                onClose();
                onBuyNowWhatsApp(product, quantity);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-[0_2px_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Buy Now on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
