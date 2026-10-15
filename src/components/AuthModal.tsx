import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Check,
  AlertCircle,
  User,
  Users,
  Store,
  Crown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Restaurant } from '../types/restaurant';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  targetViewName?: string;
  onSuccessRedirect?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  targetViewName = 'Geschützter Bereich',
  onSuccessRedirect,
}) => {
  const { login, loginAsDemo, getStaffForRestaurant } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'operator' | 'waiter'>('operator');
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const staffList = getStaffForRestaurant(restaurant.id);
  const waiters = staffList.filter(s => s.role === 'waiter');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(
      restaurant.id,
      selectedRole,
      pinOrPassword.trim(),
      selectedRole === 'waiter' ? selectedStaffId : undefined
    );

    if (result.success) {
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } else {
      setErrorMessage(result.error || 'Ungültige Anmeldedaten');
    }
  };

  const handleQuickDemo = (role: 'operator' | 'waiter') => {
    const staffName = role === 'operator'
      ? `${restaurant.name} Inhaber (Admin)`
      : 'Kellner Marco (Service)';
    loginAsDemo(role, restaurant.id, staffName);
    onClose();
    if (onSuccessRedirect) {
      onSuccessRedirect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Geschützter Bereich • {restaurant.name}</span>
          </div>

          <h2 className="text-xl font-bold font-serif-display text-white">
            Personal- & Betreiber-Login
          </h2>

          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
            Für <strong>{targetViewName}</strong> ist eine Autorisierung erforderlich.
          </p>
        </div>

        {/* Public Note */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-5 py-2.5 flex items-center gap-2 text-[11px] text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Wichtig:</strong> Die Speisekarte, Tisch-Bestellungen und Gästebewertungen sind für alle Besucher <strong>öffentlich</strong> und benötigen keinen Login.
          </span>
        </div>

        {/* Role Switcher */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('operator');
                setErrorMessage(null);
                setPinOrPassword('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'operator'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-700" />
              <span>Betreiber (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('waiter');
                setErrorMessage(null);
                setPinOrPassword('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'waiter'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
              <span>Kellner / Service</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {selectedRole === 'operator' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-stone-700">
                    Betreiber-Passwort
                  </label>
                  <span className="text-stone-400 font-mono text-[11px]">
                    Demo: admin123
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={pinOrPassword}
                    onChange={(e) => setPinOrPassword(e.target.value)}
                    placeholder="Passwort eingeben (admin123)"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-stone-500">
                  Voller Administrator-Zugriff auf Dashboard, Google Analytics, Lieferando, TSE-Kasse und Menü-Preise.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waiters.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mitarbeiter auswählen (Optional)
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="">Allgemeiner Service-Zugang (PIN: 1234)</option>
                      {waiters.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} (PIN: {w.pin})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-stone-700">
                      Kellner-PIN eingeben
                    </label>
                    <span className="text-stone-400 font-mono text-[11px]">
                      Standard-PIN: 1234
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={8}
                      value={pinOrPassword}
                      onChange={(e) => setPinOrPassword(e.target.value)}
                      placeholder="4-stelliger PIN (1234)"
                      autoFocus
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <Smartphone className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Zugriff auf Kellner-Terminal, Tisch-Abrechnung und Bon-Verwaltung.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Anmelden</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="pt-4 border-t border-stone-200 space-y-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block text-center">
              Schnell-Login für Präsentation
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('operator')}
                className="py-2 px-2.5 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-200/80 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Crown className="w-3 h-3 text-amber-700" />
                <span>Betreiber Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('waiter')}
                className="py-2 px-2.5 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-200/80 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3 text-amber-700" />
                <span>Kellner Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
