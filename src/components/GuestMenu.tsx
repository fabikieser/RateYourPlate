import React, { useState, useMemo } from 'react';
import { Search, Sparkles, MapPin, Receipt, ArrowRight, Table, Bike, ShoppingBag, Calendar, Lock, CheckCircle2, ShieldCheck, ChefHat, RefreshCw, Crown, Star } from 'lucide-react';
import { Restaurant, Dish, CartItem, FulfillmentType, Order, DishRating } from '../types/restaurant';
import { DishCard } from './DishCard';
import { RateYourPlateLogo } from './RateYourPlateLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

interface GuestMenuProps {
  restaurant: Restaurant;
  selectedTable: string | number;
  onChangeTable: (table: string | number) => void;
  fulfillmentType: FulfillmentType;
  onChangeFulfillmentType: (type: FulfillmentType) => void;
  cart: CartItem[];
  onAddToCart: (dish: Dish) => void;
  onRemoveFromCart: (dishId: string) => void;
  guestRatings: Record<string, { stars: number; comment?: string }>;
  onRateDish: (dishId: string, stars: number, comment?: string) => void;
  onOpenCheckout: () => void;
  onOpenReservation: () => void;
  consumedDishIds?: string[];
  preparingDishIds?: string[];
  activeTableOrders?: Order[];
  onMarkTableDishesServed?: (tableNumber: string | number) => void;
  onMarkTableDishesPreparing?: (tableNumber: string | number) => void;
  onResetTableOrders?: (tableNumber: string | number) => void;
  onSimulateServeDish?: (dishId: string) => void;
  ratings?: DishRating[];
}

export const GuestMenu: React.FC<GuestMenuProps> = ({
  restaurant,
  selectedTable,
  onChangeTable,
  fulfillmentType,
  onChangeFulfillmentType,
  cart,
  onAddToCart,
  onRemoveFromCart,
  guestRatings,
  onRateDish,
  onOpenCheckout,
  onOpenReservation,
  consumedDishIds = [],
  preparingDishIds = [],
  activeTableOrders = [],
  onMarkTableDishesServed,
  onMarkTableDishesPreparing,
  onResetTableOrders,
  onSimulateServeDish,
  ratings = [],
}) => {
  const { t, getLocalizedDish } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedFilterMode, setSelectedFilterMode] = useState<'all' | 'top_rated' | 'unrated' | 'chef'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate cart quantities and discounts
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  // Number of rated dishes that grant discounts
  const ratedDishCount = Object.keys(guestRatings).filter(dishId => (guestRatings[dishId]?.stars || 0) > 0).length;
  const potentialDiscount = ratedDishCount * restaurant.discountPerRating;
  const deliveryExtra = fulfillmentType === 'delivery' ? (restaurant.deliveryFee || 2.50) : 0;
  const estimatedTotal = Math.max(0, cartSubtotal - potentialDiscount + deliveryExtra);

  // Top dish per category calculation
  const topDishByCategory = useMemo(() => {
    const result: Record<string, Dish> = {};
    restaurant.categories.forEach(cat => {
      const dishesInCat = restaurant.dishes.filter(d => d.category === cat && d.ratingCount > 0);
      if (dishesInCat.length > 0) {
        const sorted = [...dishesInCat].sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount);
        result[cat] = sorted[0];
      }
    });
    return result;
  }, [restaurant.dishes, restaurant.categories]);

  // Counts for quick filter pills
  const unratedDishesCount = restaurant.dishes.filter(d => d.ratingCount === 0).length;
  const topRatedDishesCount = restaurant.dishes.filter(d => d.ratingCount > 0 && d.ratingAverage >= 4.7).length;
  const chefDishesCount = restaurant.dishes.filter(d => d.chefRecommendation).length;

  // Filter & sort dishes
  const filteredDishes = restaurant.dishes
    .filter(dish => {
      const matchesCategory = selectedCategory === 'Alle' || dish.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesMode = true;
      if (selectedFilterMode === 'top_rated') {
        matchesMode = dish.ratingCount > 0 && dish.ratingAverage >= 4.7;
      } else if (selectedFilterMode === 'unrated') {
        matchesMode = dish.ratingCount === 0;
      } else if (selectedFilterMode === 'chef') {
        matchesMode = Boolean(dish.chefRecommendation);
      }

      return matchesCategory && matchesSearch && matchesMode;
    })
    .sort((a, b) => {
      if (selectedFilterMode === 'top_rated') {
        return (b.ratingAverage * b.ratingCount) - (a.ratingAverage * a.ratingCount);
      }
      if (selectedFilterMode === 'unrated') {
        return a.ratingCount - b.ratingCount;
      }
      return 0;
    });

  const allCategories = ['Alle', ...restaurant.categories];

  return (
    <div className="pb-32">
      {/* Restaurant Hero Banner */}
      <section className="bg-stone-900 text-stone-100 py-10 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar inside banner: Mode Selector & Reservation Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-stone-800">
            {/* Fulfillment Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80">
              <button
                type="button"
                onClick={() => onChangeFulfillmentType('dine_in')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  fulfillmentType === 'dine_in'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{t('dineIn')}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeFulfillmentType('delivery')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  fulfillmentType === 'delivery'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>{t('delivery')}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeFulfillmentType('pickup')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  fulfillmentType === 'pickup'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('pickup')}</span>
              </button>
            </div>

            {/* Language Selector, Lieferando Badge & Reservation Trigger Button */}
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSelector variant="pill" />

              <button
                type="button"
                onClick={onOpenReservation}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('tableReservation')}</span>
              </button>

              {restaurant.lieferandoConnected && (
                <a
                  href={restaurant.lieferandoUrl || `https://www.lieferando.de/speisekarte/${encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-orange-600/90 hover:bg-orange-600 text-white border border-orange-400/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Auch bei Lieferando verfügbar"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auch bei</span> Lieferando
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <RateYourPlateLogo size="xs" variant="light" showTagline={false} />
                <span className="text-[11px] text-amber-300 font-medium tracking-wide">
                  · Verifizierte Speisen-Bewertungen & Google Maps Sync
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{restaurant.address}, {restaurant.postalCode}</span>
                <span aria-hidden="true">·</span>
                {fulfillmentType === 'dine_in' && <span>Direkt am Tisch bestellen & bezahlen</span>}
                {fulfillmentType === 'delivery' && <span>Lieferung ca. 30-45 Min · Liefergebühr {(restaurant.deliveryFee || 2.50).toFixed(2)} €</span>}
                {fulfillmentType === 'pickup' && <span>Abholbereit in ca. 20 Min · Keine Liefergebühr</span>}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif-display text-white">
                {restaurant.name}
              </h1>

              <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                {restaurant.welcomeMessage}
              </p>
            </div>

            {/* Mode-dependent Location Box */}
            <div className="bg-stone-800/80 backdrop-blur-xs p-4 rounded-xl border border-stone-700/80 flex flex-col gap-2 shrink-0 md:min-w-[260px]">
              {fulfillmentType === 'dine_in' ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-stone-300">
                      <Table className="w-4 h-4 text-amber-400" />
                      <span className="font-medium">Dein Tisch:</span>
                    </div>
                    <span className="text-xs text-stone-400">QR-Code Platz</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTable}
                      onChange={(e) => onChangeTable(e.target.value)}
                      className="bg-stone-900 text-white font-semibold text-sm px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full cursor-pointer"
                    >
                      {restaurant.tables.map((tbl) => (
                        <option key={tbl} value={tbl}>
                          Tisch {tbl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Bestellungen & Belege werden für Tisch {selectedTable} verbucht.
                  </p>
                </>
              ) : fulfillmentType === 'delivery' ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-stone-300">
                    <Bike className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Lieferung an deine Wunschadresse</span>
                  </div>
                  <div className="text-xs text-stone-300 bg-stone-900/80 p-2.5 rounded-lg border border-stone-700">
                    <p className="font-semibold text-amber-200">Lieferzeit: ca. 30–45 Min</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Adresse wird an der Kasse eingegeben.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-stone-300">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Selbstabholung vor Ort</span>
                  </div>
                  <div className="text-xs text-stone-300 bg-stone-900/80 p-2.5 rounded-lg border border-stone-700">
                    <p className="font-semibold text-amber-200">Abholbereit in ca. 20 Min</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">An der Restauranttheke abholen & genießen.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rating Reward Highlight Banner */}
          <div className="mt-8 bg-gradient-to-r from-amber-950/80 via-stone-800 to-amber-950/80 border border-amber-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-amber-100 flex items-center gap-2">
                  <span>Feedback-Rabatt: 0,50 € Gutschrift pro verzehrtes Gericht!</span>
                </h2>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  Echtheits-Garantie: Gerichte können nach dem Servieren mit 1–5 Sternen bewertet werden. Der Rabatt von 0,50 € wird beim Bezahlvorgang mit PayPal oder Karte sofort abgezogen!
                </p>
              </div>
            </div>

            <div className="bg-stone-900/90 px-4 py-2.5 rounded-lg border border-amber-500/20 text-right shrink-0">
              <span className="text-xs text-stone-400 block">Dein Spar-Status:</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                {ratedDishCount} {ratedDishCount === 1 ? 'Gericht' : 'Gerichte'} bewertet = -{potentialDiscount.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Anti-Cheat Consumption Status Banner for Current Table */}
        {fulfillmentType === 'dine_in' && (
          <div className={`mb-6 rounded-xl border p-4 transition-all shadow-2xs ${
            consumedDishIds.length > 0
              ? 'bg-emerald-50/90 border-emerald-300/80 text-emerald-950'
              : preparingDishIds.length > 0
              ? 'bg-amber-50/90 border-amber-300/80 text-amber-950'
              : 'bg-white border-stone-200 text-stone-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  consumedDishIds.length > 0
                    ? 'bg-emerald-200/80 text-emerald-800'
                    : preparingDishIds.length > 0
                    ? 'bg-amber-200/80 text-amber-800'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {consumedDishIds.length > 0 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : preparingDishIds.length > 0 ? (
                    <ChefHat className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {consumedDishIds.length > 0
                        ? `Tisch ${selectedTable}: ${consumedDishIds.length} Speisen serviert & verzehrt ✓`
                        : preparingDishIds.length > 0
                        ? `Tisch ${selectedTable}: Speisen werden in der Küche zubereitet...`
                        : `Tisch ${selectedTable}: Verzehr-Sicherheitskontrolle aktiv`}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      consumedDishIds.length > 0
                        ? 'bg-emerald-200 text-emerald-900'
                        : preparingDishIds.length > 0
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {consumedDishIds.length > 0 ? 'Bewertung freigeschaltet' : 'Vorab-Bewertung gesperrt'}
                    </span>
                  </div>

                  <p className="text-xs mt-0.5 leading-relaxed text-stone-600">
                    {consumedDishIds.length > 0
                      ? 'Echtheits-Nachweis erbracht: Du hast Speisen an diesem Tisch erhalten. Bewerte deine genossenen Gerichte unten für jeweils 0,50 € Rabatt!'
                      : preparingDishIds.length > 0
                      ? 'Die Küche bereitet deine Speisen zu. Um Rabatt-Betrug auszuschließen, wird die Bewertung erst freigeschaltet, sobald das Essen serviert wurde.'
                      : 'Gemäß Restaurant-Richtlinie können Gerichte erst nach Verzehr bewertet werden. Bestelle Speisen – nach dem Servieren öffnet sich die Rabatt-Bewertung.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons & Quick Demo Simulation Switcher */}
              <div className="flex flex-wrap items-center gap-2 lg:shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200">
                {consumedDishIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenCheckout}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Tisch {selectedTable} abrechnen</span>
                  </button>
                )}

                {/* Simulation controls for interactive testing */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-[11px]">
                  <span className="text-[10px] text-stone-500 font-semibold px-1 hidden sm:inline">Demo-Status:</span>
                  <button
                    type="button"
                    onClick={() => onMarkTableDishesServed?.(selectedTable)}
                    className={`px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                      consumedDishIds.length > 0
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-700 hover:bg-white'
                    }`}
                    title="Simuliert, dass der Kellner das Essen an Tisch serviert hat"
                  >
                    🍽️ Serviert
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkTableDishesPreparing?.(selectedTable)}
                    className={`px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                      preparingDishIds.length > 0 && consumedDishIds.length === 0
                        ? 'bg-amber-700 text-white shadow-2xs'
                        : 'text-stone-700 hover:bg-white'
                    }`}
                    title="Simuliert, dass die Küche gerade kocht"
                  >
                    🍳 Kochend
                  </button>
                  <button
                    type="button"
                    onClick={() => onResetTableOrders?.(selectedTable)}
                    className={`px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                      consumedDishIds.length === 0 && preparingDishIds.length === 0
                        ? 'bg-stone-800 text-white shadow-2xs'
                        : 'text-stone-700 hover:bg-white'
                    }`}
                    title="Simuliert einen neuen Gast, der noch nichts bestellt hat"
                  >
                    🔒 Neu / Gesperrt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Highlights: Top-Rated Dishes per Category */}
        <div className="mb-6 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="font-bold text-sm sm:text-base font-serif-display text-white">
                Gäste-Favoriten & Bestseller pro Kategorie
              </h3>
            </div>
            <span className="text-xs text-amber-300 font-medium">
              Von hunderten Gästen am besten bewertet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(topDishByCategory).map(([cat, topDish]) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedFilterMode('all');
                }}
                className="text-left bg-stone-800/80 hover:bg-stone-800 p-3 rounded-xl border border-stone-700/80 hover:border-amber-400/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate">
                    {cat}
                  </span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded">
                    #1 Top
                  </span>
                </div>
                <span className="font-bold text-xs text-white block truncate group-hover:text-amber-200">
                  {topDish.name}
                </span>
                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums font-bold">{topDish.ratingAverage.toFixed(1)}</span>
                    <span className="text-stone-400 text-[10px]">({topDish.ratingCount})</span>
                  </span>
                  <span className="font-mono text-stone-200 text-xs font-semibold">
                    {topDish.price.toFixed(2)} €
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Discovery Filter Modes (Bestseller vs. Neue Geheimtipps vs. Alle) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilterMode === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            Alle Speisen ({restaurant.dishes.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilterMode('top_rated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedFilterMode === 'top_rated'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Top-Bewertet & Bestseller ({topRatedDishesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilterMode('unrated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedFilterMode === 'unrated'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Neuheiten entdecken · Noch unbewertet ({unratedDishesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilterMode('chef')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedFilterMode === 'chef'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-700" />
            <span>Küchenchef-Tipp ({chefDishesCount})</span>
          </button>
        </div>

        {/* Notice Banner when filtering for unrated / new dishes */}
        {selectedFilterMode === 'unrated' && (
          <div className="mb-6 p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl text-emerald-950 flex items-start gap-3 shadow-2xs">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                🌱 Neue Geheimtipps & unveröffentlichte Favoriten entdecken!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Diese köstlichen Gerichte sind frisch auf der Speisekarte und haben noch keine Gäste-Bewertung. Probiere etwas Neues aus und werde der erste Restaurant-Kritiker, der nach dem Essen 0,50 € Rabatt-Belohnung einlöst!
              </p>
            </div>
          </div>
        )}

        {/* Controls: Search & Functional Category Segmented Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Gericht oder Zutat suchen..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDishes.map((dish) => {
              const cartItem = cart.find(ci => ci.dish.id === dish.id);
              const quantity = cartItem ? cartItem.quantity : 0;
              const guestRating = guestRatings[dish.id];

              const isDishConsumed = consumedDishIds.includes(dish.id);
              const isDishPreparing = preparingDishIds.includes(dish.id);
              const consumptionStatus = isDishConsumed ? 'served' : isDishPreparing ? 'preparing' : 'not_ordered';
              const isTop = topDishByCategory[dish.category]?.id === dish.id;
              const dishReviews = ratings.filter(r => r.dishId === dish.id);

              return (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  cartQuantity={quantity}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  guestRating={guestRating}
                  onRateDish={onRateDish}
                  discountPerRating={restaurant.discountPerRating}
                  isConsumed={isDishConsumed}
                  consumptionStatus={consumptionStatus}
                  tableNumber={selectedTable}
                  onSimulateServe={() => onSimulateServeDish?.(dish.id)}
                  isTopCategoryDish={isTop}
                  dishRatings={dishReviews}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8 max-w-md mx-auto">
            <p className="text-stone-500 text-sm">
              Keine Gerichte für "{searchQuery}" in dieser Kategorie gefunden.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Alle');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-medium text-amber-800 hover:underline cursor-pointer"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <aside
          aria-label="Warenkorb Schnellzugriff"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl px-4 py-3"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm tabular-nums shrink-0">
                {totalCartCount}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">
                    {fulfillmentType === 'dine_in' ? `Tisch ${selectedTable}:` : fulfillmentType === 'delivery' ? 'Lieferung:' : 'Abholung:'}
                  </span>
                  <span className="text-sm font-semibold text-stone-900 tabular-nums">
                    {cartSubtotal.toFixed(2)} €
                  </span>
                  {potentialDiscount > 0 && (
                    <span className="text-xs font-semibold text-emerald-800 tabular-nums">
                      (-{potentialDiscount.toFixed(2)} € Rabatt)
                    </span>
                  )}
                  {fulfillmentType === 'delivery' && (
                    <span className="text-xs text-stone-500 tabular-nums">
                      (+{(restaurant.deliveryFee || 2.50).toFixed(2)} € Lieferung)
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-700">
                  <span>Endbetrag: </span>
                  <span className="font-bold text-stone-950 font-serif-display text-base tabular-nums">
                    {estimatedTotal.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Receipt className="w-4 h-4" />
              <span>Zur Kasse & Bezahlen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

