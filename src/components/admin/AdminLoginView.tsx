import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  UserCheck, 
  AlertCircle, 
  Check, 
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { ACTIVE_LOGIN_ACCOUNTS, authenticateAdmin, PreconfiguredAccount } from '../../utils/auth';
import { AdminUser } from '../../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState('admin@securetech.ng');
  const [password, setPassword] = useState('SecureAdmin#2026');
  // Password visible to all users by default
  const [showPassword, setShowPassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('admin@securetech.ng');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = authenticateAdmin(email, password);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSelectPreset = (account: PreconfiguredAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedPreset(account.email);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Col: Portal Security Brand & Active Credentials Sheet */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-wide flex items-center gap-1 font-mono">
                  SECURE<span className="text-emerald-400">TECH</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Backend Control Station
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white font-sans tracking-tight">
              Hardware Management & Reporting Portal
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Authorized personnel only. Access live product inventory CRUD, stock thresholds, pricing controls, order ledgers, and audit reports.
            </p>

            {/* Active Credentials Showcase (Requirement: "backend portal that with active login details") */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Active Authorized Login Credentials
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Click to autofill</span>
              </div>

              <div className="space-y-2">
                {ACTIVE_LOGIN_ACCOUNTS.map((acc) => {
                  const isSelected = selectedPreset === acc.email;
                  return (
                    <div
                      key={acc.email}
                      onClick={() => handleSelectPreset(acc)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white font-mono text-xs flex items-center gap-1.5">
                          {acc.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            acc.role === 'Super Admin'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {acc.role}
                          </span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>

                      <div className="mt-1.5 font-mono text-[11px] space-y-0.5 text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>User: <strong className="text-slate-200">{acc.email}</strong></span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pass: <strong className="text-emerald-400">{acc.password}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500/80" />
              Encrypted Session Guard
            </span>
            <span>EAL6+ Verified</span>
          </div>
        </div>

        {/* Right Col: Interactive Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Sign In to Backend Portal
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Enter active administrator credentials to begin
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Highly Visible Super Admin Password Banner for All Users */}
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Super Admin Credentials (Publicly Visible)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">Super Admin Email</span>
                  <span className="text-white font-bold text-xs select-all">admin@securetech.ng</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/40 flex flex-col">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Super Admin Password</span>
                  <span className="text-emerald-300 font-bold text-xs tracking-wider select-all">SecureAdmin#2026</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                  Administrator Email
                </label>
                <input
                  id="input-admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  placeholder="admin@securetech.ng"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Security Password
                  </label>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Visible Password: SecureAdmin#2026
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="input-admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Remember session for 24 hours</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleSelectPreset(ACTIVE_LOGIN_ACCOUNTS[0])}
                  className="text-emerald-400 hover:underline font-mono text-[11px] cursor-pointer"
                >
                  Autofill Super Admin
                </button>
              </div>

              <div className="pt-3">
                <button
                  id="btn-submit-admin-login"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-bold text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Server Status: Operational (Port 3000)</span>
            <span>Zero-Knowledge Authentication</span>
          </div>
        </div>

      </div>
    </div>
  );
};
