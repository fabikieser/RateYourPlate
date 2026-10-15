import React from 'react';
import { Utensils, QrCode, ChefHat, BarChart3, Store, Calendar, Smartphone, Printer, Lock, Crown, LogOut, User } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { RateYourPlateLogo } from './RateYourPlateLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print';
  onSelectView: (view: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print') => void;
  restaurant: Restaurant;
  onOpenRestaurantPicker: () => void;
  onOpenReservation: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuthModal?: (targetView?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  restaurant,
  onOpenRestaurantPicker,
  onOpenReservation,
  cartCount,
  onOpenCart,
  onOpenAuthModal,
}) => {
  const { t } = useLanguage();
  const { currentUser, canAccessView, logout } = useAuth();

  const handleNavClick = (view: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print') => {
    if (view === 'guest') {
      onSelectView('guest');
      return;
    }
    if (canAccessView(view)) {
      onSelectView(view);
    } else {
      if (onOpenAuthModal) {
        onOpenAuthModal(view === 'waiter' ? 'Kellner-Terminal' : view === 'chef' ? 'Küchen-Monitor' : view === 'analytics' ? 'Betreiber-Dashboard' : 'Druck-Export');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand Wordmark with Food Plate & Rating Stars Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('guest');
          }}
          className="shrink-0 hover:opacity-95 transition-opacity"
          title="RateYourPlate - Digitale Speisekarte & Bewertungen"
        >
          <RateYourPlateLogo size="sm" showTagline={false} />
        </a>

        {/* Zone 2: Nav links with localized labels and permission check */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium text-stone-600">
          <button
            onClick={() => handleNavClick('guest')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'guest'
                ? 'text-amber-900 font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-700" />
            <span>{t('menu')}</span>
          </button>

          <button
            onClick={() => handleNavClick('waiter')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'waiter'
                ? 'text-amber-900 font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span>{t('waiterTerminal')}</span>
            {!canAccessView('waiter') && <Lock className="w-3 h-3 text-stone-400" />}
          </button>

          <button
            onClick={() => handleNavClick('chef')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'chef'
                ? 'text-amber-900 font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>{t('kitchenMonitor')}</span>
            {!canAccessView('chef') && <Lock className="w-3 h-3 text-stone-400" />}
          </button>

          <button
            onClick={() => handleNavClick('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'analytics'
                ? 'text-amber-900 font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <span>{t('operatorDashboard')}</span>
            {!canAccessView('analytics') && <Lock className="w-3 h-3 text-stone-400" />}
          </button>

          <button
            onClick={() => handleNavClick('print')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'print'
                ? 'text-amber-900 font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-700" />
            <span>{t('printExport')}</span>
            {!canAccessView('print') && <Lock className="w-3 h-3 text-stone-400" />}
          </button>
        </nav>

        {/* Zone 3: Language Selector, Auth Badge, Restaurant Context & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector Dropdown */}
          <LanguageSelector variant="header" />

          {/* User Auth Status / Login Button */}
          {currentUser.role === 'guest' ? (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('Personal-Bereich')}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Personal- & Betreiber-Login"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Personal-Login</span>
            </button>
          ) : currentUser.role === 'operator' ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-950 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <button
                onClick={logout}
                className="text-[10px] text-amber-800 hover:text-amber-950 underline ml-1 cursor-pointer"
                title="Abmelden"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-300 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-950 shadow-2xs">
              <Smartphone className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <button
                onClick={logout}
                className="text-[10px] text-sky-800 hover:text-sky-950 underline ml-1 cursor-pointer"
                title="Abmelden"
              >
                Abmelden
              </button>
            </div>
          )}

          <button
            onClick={onOpenRestaurantPicker}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs"
            title="Restaurant wechseln oder Logo ansehen"
          >
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                referrerPolicy="no-referrer"
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : (
              <Store className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            )}
            <span className="max-w-[90px] sm:max-w-[150px] truncate">{restaurant.name}</span>
          </button>

          {cartCount > 0 && currentView === 'guest' && (
            <button
              onClick={onOpenCart}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{t('cart')}</span>
              <span className="bg-amber-950 text-amber-100 text-[11px] font-mono px-1.5 py-0.2 rounded-full tabular-nums">
                {cartCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-stone-200 bg-stone-50 px-2 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => handleNavClick('guest')}
          className={`flex flex-col items-center gap-0.5 ${
            currentView === 'guest' ? 'text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>{t('menu')}</span>
        </button>
        <button
          onClick={() => handleNavClick('waiter')}
          className={`flex flex-col items-center gap-0.5 ${
            currentView === 'waiter' ? 'text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Kellner</span>
        </button>
        <button
          onClick={() => handleNavClick('chef')}
          className={`flex flex-col items-center gap-0.5 ${
            currentView === 'chef' ? 'text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Küche</span>
        </button>
        <button
          onClick={() => handleNavClick('analytics')}
          className={`flex flex-col items-center gap-0.5 ${
            currentView === 'analytics' ? 'text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('operatorDashboard')}</span>
        </button>
        <button
          onClick={() => handleNavClick('print')}
          className={`flex flex-col items-center gap-0.5 ${
            currentView === 'print' ? 'text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Druck</span>
        </button>
      </div>
    </header>
  );
};


