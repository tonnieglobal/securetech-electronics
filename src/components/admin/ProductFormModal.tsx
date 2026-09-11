import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon,
  DollarSign,
  Boxes,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Product } from '../../types';
import { formatNaira, CURRENCY_SYMBOL } from '../../utils/currency';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  initialProduct?: Product | null;
}

const PRESET_HARDWARE_IMAGES = [
  { label: 'Encrypted NVMe SSD', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80' },
  { label: 'FIDO2 Security Key', url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hardened Gateway Router', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Air-Gapped Crypto Wallet', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hardened Privacy Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80' },
  { label: 'Encrypted Metal USB Key', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80' },
  { label: 'Shielded Briefcase / Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tamper-Proof CCTV Sensor', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  initialProduct,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [category, setCategory] = useState<Product['category']>(initialProduct?.category || 'Encrypted Storage');
  const [price, setPrice] = useState<number>(initialProduct?.price || 250000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(initialProduct?.originalPrice);
  const [stock, setStock] = useState<number>(initialProduct?.stock ?? 15);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(initialProduct?.lowStockThreshold ?? 4);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [certification, setCertification] = useState(initialProduct?.certification || 'FIPS 140-2 Validated & Common Criteria EAL5+');
  const [warranty, setWarranty] = useState(initialProduct?.warranty || '3-Year Tamper Replacement');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || PRESET_HARDWARE_IMAGES[0].url);
  const [featured, setFeatured] = useState<boolean>(initialProduct?.featured ?? false);
  const [securitySpecs, setSecuritySpecs] = useState<string[]>(
    initialProduct?.securitySpecs && initialProduct.securitySpecs.length > 0
      ? initialProduct.securitySpecs
      : [
          'XTS-AES 256-Bit Hardware Encryption Engine',
          'Tamper-Evident Physical Epoxy Core',
          'Zero Telemetry / Offline Verification'
        ]
  );
  const [newSpecInput, setNewSpecInput] = useState('');

  // Auto-generate SKU logic
  const handleGenerateSku = () => {
    const prefixes: Record<string, string> = {
      'Encrypted Storage': 'SEC-SSD',
      'Hardware Security': 'SEC-KEY',
      'Privacy Devices': 'SEC-PRV',
      'Secure Networking': 'SEC-NET',
      'Smart Surveillance': 'SEC-CAM',
    };
    const p = prefixes[category] || 'SEC-HW';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${p}-${rand}`);
  };

  const handleAddSpec = () => {
    if (!newSpecInput.trim()) return;
    setSecuritySpecs(prev => [...prev, newSpecInput.trim()]);
    setNewSpecInput('');
  };

  const handleRemoveSpec = (index: number) => {
    setSecuritySpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const productToSave: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      price: Number(price),
      originalPrice: originalPrice && originalPrice > 0 ? Number(originalPrice) : undefined,
      stock: Math.max(0, Number(stock)),
      lowStockThreshold: Math.max(1, Number(lowStockThreshold)),
      description: description.trim() || 'Military-grade certified security electronics device.',
      securitySpecs: securitySpecs.length > 0 ? securitySpecs : ['Hardware Verified Cryptographic Protection'],
      certification: certification.trim() || 'FIPS 140-2 Validated',
      warranty: warranty.trim() || '2-Year Direct Warranty',
      rating: initialProduct?.rating || 4.9,
      reviewsCount: initialProduct?.reviewsCount || 1,
      imageUrl: imageUrl.trim(),
      featured,
    };

    onSaveProduct(productToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-product-crud-form"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {isEditing ? `Edit Product: ${initialProduct.name}` : 'Add New Security Product'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {isEditing ? `Editing SKU ${initialProduct.sku}` : 'Provision a new certified electronics hardware SKU'}
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

        {/* Scrollable Form Body */}
        <form id="product-admin-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          
          {/* Row 1: Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Hardware Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. IronKey CyberShield NVMe SSD 4TB"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">SKU Identifier *</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. SEC-SSD-4096"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 uppercase font-mono font-bold"
              />
            </div>
          </div>

          {/* Row 2: Category & Pricing in Naira */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Product['category'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Encrypted Storage">Encrypted Storage</option>
                <option value="Hardware Security">Hardware Security</option>
                <option value="Privacy Devices">Privacy Devices</option>
                <option value="Secure Networking">Secure Networking</option>
                <option value="Smart Surveillance">Smart Surveillance</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Unit Selling Price (₦ NGN) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-emerald-400 font-bold">{CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Formatted: {formatNaira(price)}
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Original Price (optional slash price)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">{CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={originalPrice || ''}
                  onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 290000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Stock & Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Initial Warehouse Stock (units) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={e => setStock(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Low Stock Threshold Alert
              </label>
              <input
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span className="font-semibold text-white">Feature on Public Storefront</span>
              </label>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Product Overview & Technical Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the hardware architecture, physical tamper-proofing, and cryptographic properties..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Row 5: Security Specs Array */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Security Specifications & Defense Highlights
            </label>
            <div className="space-y-2">
              {securitySpecs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-800/90 rounded-lg px-3 py-1.5 text-slate-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSpecInput}
                  onChange={e => setNewSpecInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpec();
                    }
                  }}
                  placeholder="e.g. Hardware RNG True Random Number Generator"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Spec
                </button>
              </div>
            </div>
          </div>

          {/* Row 6: Image Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Product Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
              <img
                src={imageUrl}
                alt="Preview"
                className="w-9 h-9 rounded-lg object-cover border border-slate-800 shrink-0"
              />
            </div>

            <div className="mt-2">
              <span className="text-[10px] text-slate-400 mb-1 block">Or select standard verified hardware photography:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HARDWARE_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 7: Warranty & Certification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Certification Tag
              </label>
              <input
                type="text"
                value={certification}
                onChange={e => setCertification(e.target.value)}
                placeholder="e.g. FIPS 140-2 Level 3 Validated"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Warranty Coverage
              </label>
              <input
                type="text"
                value={warranty}
                onChange={e => setWarranty(e.target.value)}
                placeholder="e.g. 3-Year Tamper Replacement"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-product-record"
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-[0_2px_15px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update SKU' : 'Save New Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
