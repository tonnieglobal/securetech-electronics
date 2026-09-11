import React from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Eye,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNowWhatsApp: (product: Product, quantity: number) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNowWhatsApp,
  onViewDetails,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Product Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Security Certification Chip */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-950/80 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
            <Lock className="w-3 h-3" />
            {product.certification.split('&')[0].trim()}
          </span>
        </div>

        {/* Live Inventory Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span 
              id={`stock-badge-${product.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-800/80 text-rose-300 backdrop-blur-md"
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span 
              id={`stock-badge-${product.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-800/80 text-amber-300 backdrop-blur-md animate-pulse"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              Low Stock: {product.stock} left
            </span>
          ) : (
            <span 
              id={`stock-badge-${product.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-800/80 text-emerald-300 backdrop-blur-md"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {product.stock} in Stock
            </span>
          )}
        </div>

        {/* Quick View Overlay Button */}
        <button
          id={`btn-quick-view-${product.id}`}
          onClick={() => onViewDetails(product)}
          className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-950 border border-slate-700 text-xs font-medium text-slate-200 backdrop-blur-md cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Inspect Security Specs</span>
        </button>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>{product.category}</span>
            <span className="text-slate-500">SKU: {product.sku}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-base font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Primary security spec highlight */}
          <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300 font-mono line-clamp-1">
              {product.securitySpecs[0]}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white">
                {formatNaira(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  {formatNaira(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {product.warranty}
            </span>
          </div>

          {/* Action Buttons: Prominent WhatsApp Buy Now & Add to Cart */}
          <div className="grid grid-cols-5 gap-2">
            {/* Primary Buy Now via WhatsApp Button */}
            <button
              id={`btn-buy-whatsapp-${product.id}`}
              onClick={() => onBuyNowWhatsApp(product, 1)}
              className="col-span-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-semibold text-xs transition-all shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] cursor-pointer"
              title="Instant WhatsApp checkout with prefilled product order"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>{isOutOfStock ? 'Inquire on WhatsApp' : 'Buy Now on WhatsApp'}</span>
            </button>

            {/* Add to Cart Button */}
            <button
              id={`btn-add-cart-${product.id}`}
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`col-span-2 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
