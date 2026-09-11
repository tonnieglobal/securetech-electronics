import React, { useState } from 'react';
import { X, MessageCircle, Phone, Check, ShieldCheck } from 'lucide-react';
import { DEFAULT_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNumber: string;
  onSaveNumber: (newNumber: string) => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  isOpen,
  onClose,
  currentNumber,
  onSaveNumber,
}) => {
  if (!isOpen) return null;

  const [inputNumber, setInputNumber] = useState(currentNumber);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputNumber.replace(/[^0-9]/g, '');
    if (clean.length < 6) return;
    onSaveNumber(clean);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setInputNumber(DEFAULT_WHATSAPP_NUMBER);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-whatsapp-settings"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              WhatsApp Store Dispatch Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-mono">
          <p className="text-slate-400 leading-relaxed">
            All "Buy Now" and cart order requests route directly to this WhatsApp Business number with encrypted SKU line items and pre-calculated totals.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Recipient WhatsApp Number (with Country Code)
            </label>
            <input
              id="input-whatsapp-merchant-number"
              type="text"
              placeholder="e.g. 2348012345678 or 15557328732"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Include country code without "+" or special characters (e.g. 234 for Nigeria, 1 for US/CA, 44 for UK).
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300">
              You can test with your personal WhatsApp number to experience the customer purchase workflow firsthand.
            </span>
          </div>

          {savedAlert && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>WhatsApp recipient updated successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reset to Store Default
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-whatsapp-settings"
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer"
              >
                Save Number
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
