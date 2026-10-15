import React, { useState } from 'react';
import { X, Star, CreditCard, ShieldCheck, Mail, ArrowRight, CheckCircle2, Plus, Minus, Trash2, Smartphone, DollarSign, Bike, ShoppingBag, Table, MapPin, Phone, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Restaurant, CartItem, PaymentMethod, Order, FulfillmentType, DeliveryDetails } from '../types/restaurant';
import { RateYourPlateLogo } from './RateYourPlateLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  selectedTable: string | number;
  fulfillmentType: FulfillmentType;
  onChangeFulfillmentType: (type: FulfillmentType) => void;
  cart: CartItem[];
  onAddToCart: (dish: CartItem['dish']) => void;
  onRemoveFromCart: (dishId: string) => void;
  onClearCartItem: (dishId: string) => void;
  guestRatings: Record<string, { stars: number; comment?: string }>;
  onRateDish: (dishId: string, stars: number, comment?: string) => void;
  onPaymentComplete: (order: Order) => void;
  consumedDishIds?: string[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  selectedTable,
  fulfillmentType,
  onChangeFulfillmentType,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCartItem,
  guestRatings,
  onRateDish,
  onPaymentComplete,
  consumedDishIds = [],
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('paypal');
  const [customerEmail, setCustomerEmail] = useState('fabikieser@gmail.com');
  const [customerName, setCustomerName] = useState('Fabi Kieser');
  const [customerPhone, setCustomerPhone] = useState('+49 170 1234567');

  // Delivery details
  const [street, setStreet] = useState('Bockenheimer Anlage 15');
  const [postalCode, setPostalCode] = useState('60322');
  const [city, setCity] = useState(restaurant.city);
  const [deliveryNotes, setDeliveryNotes] = useState('3. OG, bitte bei Kieser klingeln');
  const [desiredTime, setDesiredTime] = useState('Schnellstmöglich (ca. 35 Min)');

  // Pickup details
  const [pickupTime, setPickupTime] = useState('In ca. 20 Minuten');

  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [cardHolder, setCardHolder] = useState('Fabi Kieser');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  // Anti-Cheat: Only dishes that are confirmed CONSUMED can earn the rating discount!
  const verifiedConsumedSet = new Set(consumedDishIds || []);

  // Total verified consumed dishes that were given a rating
  const eligibleRatedDishesCount = Object.keys(guestRatings).filter(
    id => verifiedConsumedSet.has(id) && (guestRatings[id]?.stars || 0) > 0
  ).length;
  const ratingDiscountTotal = eligibleRatedDishesCount * restaurant.discountPerRating;

  // Consumed dishes in cart that are not yet rated
  const consumedUnratedCartItems = cart.filter(
    item => verifiedConsumedSet.has(item.dish.id) && (!guestRatings[item.dish.id] || guestRatings[item.dish.id].stars === 0)
  );

  // Dishes in cart that have NOT been consumed yet (cannot be rated beforehand)
  const unconsumedCartItems = cart.filter(item => !verifiedConsumedSet.has(item.dish.id));

  // Tip calculation
  const calculatedTip = customTip !== ''
    ? Math.max(0, parseFloat(customTip) || 0)
    : (subtotal * (selectedTipPercent / 100));

  const deliveryFee = fulfillmentType === 'delivery' ? (restaurant.deliveryFee || 2.50) : 0;
  const finalTotal = Math.max(0, subtotal - ratingDiscountTotal + calculatedTip + deliveryFee);

  // German VAT calculation (7% on food items, 19% on drinks)
  const vat7 = (subtotal * 0.75) * 0.07 / 1.07;
  const vat19 = (subtotal * 0.25) * 0.19 / 1.19;

  const handleProcessPayment = () => {
    setValidationError(null);
    if (!customerEmail || !customerEmail.includes('@')) {
      setValidationError('Bitte geben Sie eine gültige E-Mail-Adresse für die digitale Quittung ein.');
      return;
    }

    if (fulfillmentType === 'delivery' && (!street || !city)) {
      setValidationError('Bitte geben Sie Ihre vollständige Lieferadresse ein.');
      return;
    }

    setIsProcessing(true);

    // Simulate payment gateway & POS TSE communication
    setTimeout(() => {
      const orderId = 'ord_' + Math.floor(1000 + Math.random() * 9000);
      const receiptNumber = 'RE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
      const tseSig = 'TSE-SIG-' + Math.floor(1000 + Math.random() * 9000) + '-POS-' + Math.floor(1000 + Math.random() * 9000);

      const deliveryDetails: DeliveryDetails | undefined = fulfillmentType === 'delivery' ? {
        street,
        postalCode,
        city,
        deliveryNotes,
        desiredTime,
      } : undefined;

      const newOrder: Order = {
        id: orderId,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        fulfillmentType,
        tableNumber: fulfillmentType === 'dine_in' ? selectedTable : undefined,
        deliveryDetails,
        deliveryFee: fulfillmentType === 'delivery' ? deliveryFee : 0,
        pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
        customerName,
        customerPhone,
        items: [...cart],
        subtotal: subtotal,
        discountPerDishRating: restaurant.discountPerRating,
        ratedDishes: { ...guestRatings },
        ratingDiscountTotal: ratingDiscountTotal,
        tipAmount: calculatedTip,
        finalTotal: finalTotal,
        paymentMethod: selectedPayment,
        paymentStatus: 'kasse_synchronisiert',
        customerEmail: customerEmail.trim(),
        timestamp: 'Heute, ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        receiptNumber: receiptNumber,
        tseTransactionId: tseSig,
        vat7: parseFloat(vat7.toFixed(2)),
        vat19: parseFloat(vat19.toFixed(2)),
        kitchenStatus: 'eingegangen'
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      setIsProcessing(false);
      onPaymentComplete(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <RateYourPlateLogo size="xs" variant="light" showTagline={false} />
            <div className="h-4 w-px bg-stone-700 hidden sm:block" />
            <div>
              <span className="text-xs text-amber-300 font-medium tracking-wide">
                {restaurant.name} · {fulfillmentType === 'dine_in' ? `Tisch ${selectedTable}` : fulfillmentType === 'delivery' ? 'Lieferung' : 'Abholung'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif-display">
                Bestellung abschließen & direkt bezahlen
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 font-semibold flex items-center justify-between">
              <span>⚠️ {validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {/* Fulfillment Type Selection at Checkout */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Bestell- & Lieferart
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeFulfillmentType('dine_in')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  fulfillmentType === 'dine_in'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Tisch {selectedTable}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeFulfillmentType('delivery')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  fulfillmentType === 'delivery'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Lieferung</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeFulfillmentType('pickup')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  fulfillmentType === 'pickup'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Selbstabholung</span>
              </button>
            </div>

            {/* Delivery Fields */}
            {fulfillmentType === 'delivery' && (
              <div className="mt-3 pt-3 border-t border-stone-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lieferadresse eingeben:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Straße & Hausnummer"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="PLZ"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Stadt"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Klingelname / Etage / Hinweise"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Wunsch-Lieferzeit"
                    value={desiredTime}
                    onChange={(e) => setDesiredTime(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Lieferzeit: ca. 30–45 Minuten</span>
                  <span className="font-semibold text-stone-800">Liefergebühr: {(restaurant.deliveryFee || 2.50).toFixed(2)} €</span>
                </div>
              </div>
            )}

            {/* Pickup Fields */}
            {fulfillmentType === 'pickup' && (
              <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Abholort:</span>
                  <span className="text-stone-600">{restaurant.name}, {restaurant.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name des Abholers"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Wunsch-Abholzeit"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 1. Itemized Positions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              1. Bestellte Positionen
            </h3>
            {cart.length === 0 ? (
              <p className="text-sm text-stone-500 italic py-3">Dein Warenkorb ist leer.</p>
            ) : (
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50">
                {cart.map((item) => (
                  <div key={item.dish.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 truncate">
                          {item.dish.name}
                        </span>
                        {guestRatings[item.dish.id]?.stars ? (
                          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{guestRatings[item.dish.id].stars}★ bewertet</span>
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-stone-500 tabular-nums">
                        {item.dish.price.toFixed(2)} € / Stk.
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(item.dish.id)}
                          className="w-6 h-6 rounded bg-white text-stone-600 hover:bg-stone-200 flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-semibold text-xs tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAddToCart(item.dish)}
                          className="w-6 h-6 rounded bg-white text-stone-600 hover:bg-stone-200 flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-stone-900 tabular-nums min-w-[55px] text-right">
                        {(item.dish.price * item.quantity).toFixed(2)} €
                      </span>
                      <button
                        type="button"
                        onClick={() => onClearCartItem(item.dish.id)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Position löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Feedback-Rabatt Belohnungs-Modul mit Verzehr-Sicherheitsprüfung */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Deine Feedback-Belohnung: 0,50 € pro verzehrtes Gericht</span>
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Für jede 1–5 Sterne-Bewertung eines <strong>tatsächlich servierten & verzehrten</strong> Gerichts erhältst du 50 Cent Rabatt!
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md tabular-nums block">
                  -{ratingDiscountTotal.toFixed(2)} € Rabatt
                </span>
                <span className="text-[11px] text-stone-500">
                  {eligibleRatedDishesCount} {eligibleRatedDishesCount === 1 ? 'verzehrte Bewertung' : 'verzehrte Bewertungen'} aktiv
                </span>
              </div>
            </div>

            {/* A. Rated Consumed Dishes list (active discounts) */}
            {eligibleRatedDishesCount > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-amber-200/60">
                <span className="text-[11px] font-semibold text-emerald-900 block mb-1.5">
                  ✓ Verzehr-Rabatt aktiv für folgende Speisen:
                </span>
                <div className="space-y-1">
                  {Object.entries(guestRatings)
                    .filter(([id, r]) => verifiedConsumedSet.has(id) && r.stars > 0)
                    .map(([dishId, r]) => {
                      const dishObj = restaurant.dishes.find(d => d.id === dishId);
                      return (
                        <div key={dishId} className="flex items-center justify-between text-xs bg-white/80 px-2.5 py-1.5 rounded border border-emerald-200/70">
                          <span className="font-medium text-stone-800">{dishObj?.name || 'Gericht'}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-600 font-semibold">{r.stars}★</span>
                            <span className="text-emerald-800 font-bold tabular-nums">-{restaurant.discountPerRating.toFixed(2)} €</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* B. Consumed dishes in cart ready to be rated */}
            {consumedUnratedCartItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <p className="text-xs font-semibold text-emerald-950 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>An Tisch {selectedTable} verzehrt — jetzt bewerten & jeweils 0,50 € sparen:</span>
                </p>
                <div className="space-y-2">
                  {consumedUnratedCartItems.map((item) => (
                    <div
                      key={item.dish.id}
                      className="bg-white p-2.5 rounded-lg border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <span className="text-xs font-semibold text-stone-900 block">
                          {item.dish.name}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-medium">
                          ✓ Verzehr an Tisch {selectedTable} bestätigt
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => onRateDish(item.dish.id, s, 'Bewertet bei Tisch-Abrechnung')}
                            className="p-1 hover:scale-120 transition-transform cursor-pointer"
                            title={`${s} Sterne vergeben`}
                          >
                            <Star className="w-4 h-4 text-stone-300 hover:text-amber-500" />
                          </button>
                        ))}
                        <span className="text-[11px] text-emerald-800 ml-1 font-bold">
                          (+0,50 € sparen)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. Unconsumed dishes in cart (Anti-Fraud Lock) */}
            {unconsumedCartItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <div className="flex items-start gap-2 bg-stone-100/90 p-2.5 rounded-lg border border-stone-200 text-xs text-stone-700">
                  <Lock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block mb-0.5">
                      🔒 Verzehr-Sperre für noch nicht servierte Positionen:
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed mb-1.5">
                      Gemäß Restaurant-Richtlinie können Gerichte erst nach dem Servieren bewertet werden. Vorab-Rabatt erschleichen ist ausgeschlossen.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {unconsumedCartItems.map((item) => (
                        <span key={item.dish.id} className="text-[10px] bg-white px-2 py-0.5 rounded border border-stone-300 text-stone-600 font-medium">
                          {item.dish.name} (wird erst zubereitet)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Trinkgeld / Tip Selector */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              2. Trinkgeld für das Service-Team
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setSelectedTipPercent(pct);
                    setCustomTip('');
                  }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                    selectedTipPercent === pct && customTip === ''
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {pct}%
                  <span className="block text-[10px] text-stone-400 tabular-nums">
                    {(subtotal * (pct / 100)).toFixed(2)} €
                  </span>
                </button>
              ))}
              <input
                type="number"
                step="0.50"
                placeholder="Frei (€)"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setSelectedTipPercent(-1);
                }}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                  customTip !== '' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white'
                }`}
              />
            </div>
          </div>

          {/* 4. Zahlungsarten */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              3. Bezahlmethode wählen (Direkt am Tisch zahlen)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* PayPal */}
              <button
                type="button"
                onClick={() => setSelectedPayment('paypal')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                  selectedPayment === 'paypal'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="font-bold text-blue-900 text-sm tracking-tight">
                  <span className="text-blue-700">Pay</span><span className="text-sky-500">Pal</span>
                </div>
                <span className="text-[11px] text-stone-600 font-medium">1-Klick Zahlung</span>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setSelectedPayment('credit_card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                  selectedPayment === 'credit_card'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-stone-700" />
                <span className="text-[11px] text-stone-600 font-medium">Visa / Mastercard</span>
              </button>

              {/* Apple Pay / Google Pay */}
              <button
                type="button"
                onClick={() => setSelectedPayment('apple_pay')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                  selectedPayment === 'apple_pay'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-stone-800" />
                <span className="text-[11px] text-stone-600 font-medium">Apple / Google Pay</span>
              </button>

              {/* Klarna / Sofort */}
              <button
                type="button"
                onClick={() => setSelectedPayment('klarna')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                  selectedPayment === 'klarna'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <span className="font-bold text-pink-600 text-xs">Klarna.</span>
                <span className="text-[11px] text-stone-600 font-medium">Sofortüberweisung</span>
              </button>
            </div>

            {/* Credit Card inputs if credit card is selected */}
            {selectedPayment === 'credit_card' && (
              <div className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">Kartennummer</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-0.5">Gültig bis (MM/JJ)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-0.5">CVC / Prüfziffer</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={4}
                      className="w-full text-xs font-mono p-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Digitale Quittung per E-Mail */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-amber-800" />
              <label htmlFor="customer-email-input" className="text-xs font-semibold text-stone-900">
                Automatische digitale Quittung per E-Mail
              </label>
            </div>
            <p className="text-xs text-stone-500 mb-2">
              Nach erfolgreicher Zahlung wird die steuerkonforme Kassenquittung (TSE-signiert) automatisch versendet.
            </p>
            <input
              id="customer-email-input"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="deine-email@beispiel.de"
              required
              className="w-full text-xs sm:text-sm p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-800 focus:outline-none text-stone-900"
            />
          </div>

          {/* 6. Kassensystem Kopplung Info */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold block">Direkte Kassensystem-Kopplung aktiv</span>
              <span className="text-emerald-800/80 text-[11px]">
                {restaurant.posSystemName} · TSE KassenSichV konform · Kein Kellner-Terminal nötig
              </span>
            </div>
          </div>

          {/* 7. Abrechnungs-Zusammenfassung */}
          <div className="border-t border-stone-200 pt-4 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Zwischensumme Speisen & Getränke</span>
              <span className="tabular-nums font-medium text-stone-900">{subtotal.toFixed(2)} €</span>
            </div>
            {ratingDiscountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Verzehr-Rabatt ({eligibleRatedDishesCount} x {restaurant.discountPerRating.toFixed(2)} €)</span>
                <span className="tabular-nums">-{ratingDiscountTotal.toFixed(2)} €</span>
              </div>
            )}
            {calculatedTip > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Trinkgeld Service</span>
                <span className="tabular-nums text-stone-900">+{calculatedTip.toFixed(2)} €</span>
              </div>
            )}
            {fulfillmentType === 'delivery' && (
              <div className="flex justify-between text-stone-600">
                <span>Liefergebühr</span>
                <span className="tabular-nums text-stone-900">+{(restaurant.deliveryFee || 2.50).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-base sm:text-lg font-bold text-stone-950 pt-2 border-t border-stone-200 font-serif-display">
              <span>Gesamtbetrag (inkl. MwSt.)</span>
              <span className="tabular-nums text-amber-900">{finalTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 pt-1">
              <span>Enthaltene MwSt.: 7% ({vat7.toFixed(2)} €) · 19% ({vat19.toFixed(2)} €)</span>
              <span>Rechnung sofort per E-Mail</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/90 p-2 rounded-lg border border-amber-200 mt-2">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span>Direkt nach Zahlung: Deine Speisen-Bewertungen fließen in die Google Maps Gesamtnote ein!</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Zurück zur Karte
          </button>

          <button
            type="button"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleProcessPayment}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              isProcessing
                ? 'bg-stone-500 cursor-not-allowed'
                : 'bg-amber-800 hover:bg-amber-900 active:scale-98'
            }`}
          >
            {isProcessing ? (
              <span>Zahlung wird autorisiert & verbucht...</span>
            ) : (
              <>
                <span>Jetzt {finalTotal.toFixed(2)} € bezahlen & Quittung erhalten</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
