import React, { useState } from 'react';
import { Smartphone, Utensils, QrCode, CheckCircle2, Plus, Minus, Send, ArrowRight, ShieldCheck, User, Table, Star, Sparkles, RefreshCw } from 'lucide-react';
import { Restaurant, Dish, CartItem, Order } from '../types/restaurant';
import { generateQrSvg } from '../utils/qrCode';

interface WaiterTerminalProps {
  restaurant: Restaurant;
  orders: Order[];
  onSendOrderToKitchen: (order: Order) => void;
  onOpenGuestCheckoutForTable: (table: string | number, items: CartItem[]) => void;
  onMarkTableServed?: (tableNumber: string | number) => void;
}

export const WaiterTerminal: React.FC<WaiterTerminalProps> = ({
  restaurant,
  orders,
  onSendOrderToKitchen,
  onOpenGuestCheckoutForTable,
  onMarkTableServed,
}) => {
  const [waiterName, setWaiterName] = useState('Marco (Service)');
  const [selectedTable, setSelectedTable] = useState<string | number>(restaurant.tables[0] || 1);
  const [waiterCart, setWaiterCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [serveSuccess, setServeSuccess] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Cart calculations
  const cartSubtotal = waiterCart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const totalItemsCount = waiterCart.reduce((sum, item) => sum + item.quantity, 0);

  // Check if this table has an already paid order
  const latestOrderForTable = orders.find(o => o.tableNumber === selectedTable && o.restaurantId === restaurant.id);
  const isPaid = latestOrderForTable && latestOrderForTable.paymentStatus === 'kasse_synchronisiert';

  const handleAddDish = (dish: Dish) => {
    setWaiterCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id);
      if (existing) {
        return prev.map(i => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const handleRemoveDish = (dishId: string) => {
    setWaiterCart(prev => {
      const existing = prev.find(i => i.dish.id === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.dish.id === dishId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.dish.id !== dishId);
    });
  };

  // Send to kitchen
  const handleSendToKitchen = () => {
    if (waiterCart.length === 0) return;

    const newOrder: Order = {
      id: 'ord_waiter_' + Date.now(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      fulfillmentType: 'dine_in',
      tableNumber: selectedTable,
      takenByWaiter: true,
      waiterName: waiterName,
      items: [...waiterCart],
      subtotal: cartSubtotal,
      discountPerDishRating: restaurant.discountPerRating,
      ratedDishes: {},
      ratingDiscountTotal: 0,
      tipAmount: 0,
      finalTotal: cartSubtotal,
      paymentMethod: 'paypal',
      paymentStatus: 'in_bearbeitung',
      customerEmail: 'kellner.abrechnung@rateyourplate.app',
      timestamp: 'Heute, ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      receiptNumber: 'RE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      tseTransactionId: 'TSE-WAITER-' + Math.floor(100000 + Math.random() * 900000),
      vat7: (cartSubtotal * 0.75) * 0.07 / 1.07,
      vat19: (cartSubtotal * 0.25) * 0.19 / 1.19,
      kitchenStatus: 'eingegangen'
    };

    onSendOrderToKitchen(newOrder);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  // Generate Guest Payment QR code
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://rateyourplate.app';
  const paymentQrUrl = `${currentOrigin}/?restaurant=${restaurant.id}&table=${selectedTable}&mode=pay`;
  const qrSvg = generateQrSvg(paymentQrUrl, 240);

  const filteredDishes = restaurant.dishes.filter(d =>
    selectedCategory === 'Alle' || d.category === selectedCategory
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 mb-8 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
                KELLNER-SMARTPHONE TERMINAL
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-serif-display">
                Mobiles Kassensystem für den Service
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                Klassische Aufnahme durch Kellner · Kassenanbindung · Gast scannt QR-Code zum Bezahlen & Bewerten
              </p>
            </div>
          </div>

          {/* Waiter Profile & Table Selector */}
          <div className="flex items-center gap-3 bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80">
            <div className="flex items-center gap-1.5 text-xs text-stone-300">
              <User className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                className="bg-stone-900 text-white text-xs font-semibold px-2 py-1 rounded border border-stone-700 w-32 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-300">
              <Table className="w-4 h-4 text-amber-400" />
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-stone-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded border border-stone-700 focus:outline-none cursor-pointer"
              >
                {restaurant.tables.map(t => (
                  <option key={t} value={t}>Tisch {t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Dish Picker */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900">
                1. Speisen für Tisch {selectedTable} erfassen
              </h2>
              <span className="text-xs text-stone-400">1-Tap Schnellauswahl</span>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
              {['Alle', ...restaurant.categories].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dish grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredDishes.map(dish => {
                const countInCart = waiterCart.find(i => i.dish.id === dish.id)?.quantity || 0;

                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleAddDish(dish)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                      countInCart > 0
                        ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-700/20'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-stone-900 block truncate">
                        {dish.name}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {dish.price.toFixed(2)} €
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {countInCart > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[11px] font-bold flex items-center justify-center">
                          {countInCart}
                        </span>
                      )}
                      <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs hover:bg-amber-100">
                        +
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Bon / Order Summary & Payment QR Generator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs text-stone-400 block">Aktiver Kellner-Bon</span>
                <h3 className="font-bold text-base text-stone-900">
                  Tisch {selectedTable}
                </h3>
              </div>
              <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                Service: {waiterName}
              </span>
            </div>

            {waiterCart.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">
                Noch keine Gerichte für diesen Tisch ausgewählt. Tippen Sie links auf ein Gericht.
              </p>
            ) : (
              <div className="space-y-2 divide-y divide-stone-100">
                {waiterCart.map(item => (
                  <div key={item.dish.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-stone-900 truncate block">
                        {item.dish.name}
                      </span>
                      <span className="text-stone-400 text-[11px]">
                        {item.dish.price.toFixed(2)} € / Stk.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(item.dish.id)}
                        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-600 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-stone-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddDish(item.dish)}
                        className="w-5 h-5 rounded bg-amber-100 hover:bg-amber-200 flex items-center justify-center font-bold text-amber-900 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-stone-900 font-mono tabular-nums min-w-[50px] text-right">
                      {(item.dish.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Subtotal */}
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Zwischensumme ({totalItemsCount} Positionen):</span>
                <span className="font-bold text-stone-900 font-mono">{cartSubtotal.toFixed(2)} €</span>
              </div>
            </div>

            {/* Actions for Waiter */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={waiterCart.length === 0}
                onClick={handleSendToKitchen}
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>1. An Küche senden</span>
              </button>

              {sentSuccess && (
                <p className="text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Erfolgreich an Küchen-Monitor übermittelt!</span>
                </p>
              )}

              {/* Step 2: Mark as served to unlock guest rating */}
              <button
                type="button"
                onClick={() => {
                  onMarkTableServed?.(selectedTable);
                  setServeSuccess(true);
                  setTimeout(() => setServeSuccess(false), 3000);
                }}
                className="w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>2. Speisen an Tisch {selectedTable} serviert ✓ (Bewertung freischalten)</span>
              </button>

              {serveSuccess && (
                <p className="text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verzehr bestätigt! Gast-Bewertung & Rabatt sind für Tisch {selectedTable} freigeschaltet.</span>
                </p>
              )}

              {/* Generate Payment QR Code for Guest */}
              <button
                type="button"
                disabled={waiterCart.length === 0}
                onClick={() => setIsQrModalOpen(true)}
                className="w-full py-3 px-3 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <QrCode className="w-4 h-4" />
                <span>3. Tisch abrechnen → QR-Code für Gast erzeugen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Presentation Modal for Guest Checkout & Rating */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border-2 border-stone-900 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-semibold text-amber-800">
                GAST-BEZAHLUNG & BEWERTUNG
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="font-bold text-lg font-serif-display text-stone-900">
              Tisch {selectedTable} abrechnen
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed">
              Halten Sie dem Gast diesen QR-Code hin. Der Gast scannt ihn, bewertet die Speisen für <strong>0,50 € Rabatt pro Gericht</strong> und zahlt direkt via PayPal oder Karte.
            </p>

            {/* Render Crisp QR code */}
            <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-xs inline-block mx-auto">
              <div
                className="w-44 h-44 mx-auto"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200/80 text-xs text-amber-950">
              <span className="font-bold block">Rechnungsbetrag: {cartSubtotal.toFixed(2)} €</span>
              <span className="text-[11px] text-stone-600">
                Rabatt wird dem Gast bei Bewertung sofort abgezogen
              </span>
            </div>

            {/* Test action directly */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsQrModalOpen(false);
                  onOpenGuestCheckoutForTable(selectedTable, waiterCart);
                }}
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Als Gast öffnen & Bezahlvorgang mit Rabatt testen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
