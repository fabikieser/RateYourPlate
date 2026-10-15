import React, { useState } from 'react';
import { CheckCircle2, Printer, Mail, Download, ArrowLeft, ShieldCheck, Utensils, Star, MapPin } from 'lucide-react';
import { Restaurant, Order, RestaurantGoogleReview } from '../types/restaurant';
import { GoogleMapsReviewFlow } from './GoogleMapsReviewFlow';
import { RateYourPlateLogo } from './RateYourPlateLogo';

interface ReceiptViewProps {
  order: Order;
  restaurant: Restaurant;
  onBackToMenu: () => void;
  onSubmitGoogleReview?: (review: RestaurantGoogleReview) => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  order,
  restaurant,
  onBackToMenu,
  onSubmitGoogleReview,
}) => {
  const [emailSentNotice, setEmailSentNotice] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Success Notification Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="text-sm font-bold text-emerald-900">
            Zahlung erfolgreich abgeschlossen & Kasse gebucht!
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            Die Bestellung wurde direkt an die Küche übermittelt. Deine digitale Quittung wurde automatisch an{' '}
            <strong className="underline">{order.customerEmail}</strong> gesendet.
          </p>
        </div>
      </div>

      {/* Google Maps Review Integration Module */}
      <GoogleMapsReviewFlow
        order={order}
        restaurant={restaurant}
        onReviewSubmitted={onSubmitGoogleReview}
      />

      {/* Printable Receipt Paper Container */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-lg p-6 sm:p-8 text-stone-800 relative font-sans">
        {/* Receipt Header */}
        <div className="text-center pb-6 border-b border-stone-200">
          <div className="inline-block p-2 bg-stone-100 rounded-full mb-2">
            <Utensils className="w-5 h-5 text-stone-700" />
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            {order.restaurantName}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {restaurant.address} · {restaurant.postalCode}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-500 mt-1">
            <span>St.-Nr.: {restaurant.taxNumber}</span>
            <span aria-hidden="true">·</span>
            <span>USt-IdNr.: {restaurant.vatId}</span>
          </div>
        </div>

        {/* Receipt Meta Details */}
        <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-stone-100">
          <div>
            <span className="text-stone-400 block">Rechnungsnummer:</span>
            <span className="font-semibold text-stone-900 font-mono">{order.receiptNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 block">Bestellart:</span>
            <span className="font-bold text-stone-900">
              {order.fulfillmentType === 'dine_in'
                ? `Tisch ${order.tableNumber}`
                : order.fulfillmentType === 'delivery'
                ? 'Lieferung'
                : 'Selbstabholung'}
            </span>
          </div>
          {order.deliveryDetails && (
            <div className="col-span-2 bg-stone-50 p-2 rounded text-stone-700">
              <span className="text-stone-400 block text-[10px]">Lieferadresse:</span>
              <span className="font-semibold">{order.deliveryDetails.street}, {order.deliveryDetails.postalCode} {order.deliveryDetails.city}</span>
              {order.deliveryDetails.deliveryNotes && (
                <span className="text-stone-500 block text-[11px] italic">Hinweis: {order.deliveryDetails.deliveryNotes}</span>
              )}
            </div>
          )}
          {order.fulfillmentType === 'pickup' && order.pickupTime && (
            <div className="col-span-2 bg-stone-50 p-2 rounded text-stone-700">
              <span className="text-stone-400 block text-[10px]">Abholung:</span>
              <span className="font-semibold">{order.pickupTime}</span>
            </div>
          )}
          <div>
            <span className="text-stone-400 block">Datum & Uhrzeit:</span>
            <span className="text-stone-800">{order.timestamp}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 block">Zahlart:</span>
            <span className="font-medium capitalize text-stone-800">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-4 border-b border-stone-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-stone-400 font-semibold border-b border-stone-100 pb-2">
                <th className="text-left font-normal pb-2">Position</th>
                <th className="text-center font-normal pb-2">Menge</th>
                <th className="text-right font-normal pb-2">Einzel</th>
                <th className="text-right font-normal pb-2">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2 font-medium text-stone-800">
                    <div>{item.dish.name}</div>
                    {order.ratedDishes[item.dish.id] && (
                      <div className="text-[10px] text-amber-700 italic">
                        ★ {order.ratedDishes[item.dish.id].stars}/5 bewertet (-0,50 € Rabatt)
                      </div>
                    )}
                  </td>
                  <td className="py-2 text-center tabular-nums text-stone-600">{item.quantity}x</td>
                  <td className="py-2 text-right tabular-nums text-stone-600">{item.dish.price.toFixed(2)} €</td>
                  <td className="py-2 text-right tabular-nums font-medium text-stone-900">
                    {(item.dish.price * item.quantity).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Discount Section */}
        <div className="py-4 space-y-1.5 text-xs border-b border-stone-200">
          <div className="flex justify-between text-stone-600">
            <span>Zwischensumme netto / brutto</span>
            <span className="tabular-nums">{order.subtotal.toFixed(2)} €</span>
          </div>

          {order.ratingDiscountTotal > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Feedback-Gutschrift ({Object.keys(order.ratedDishes).length} x 0,50 €)</span>
              <span className="tabular-nums">-{order.ratingDiscountTotal.toFixed(2)} €</span>
            </div>
          )}

          {order.tipAmount > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Trinkgeld Service</span>
              <span className="tabular-nums">+{order.tipAmount.toFixed(2)} €</span>
            </div>
          )}

          {order.deliveryFee && order.deliveryFee > 0 ? (
            <div className="flex justify-between text-stone-600">
              <span>Liefergebühr</span>
              <span className="tabular-nums">+{order.deliveryFee.toFixed(2)} €</span>
            </div>
          ) : null}

          <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-100 font-serif-display">
            <span>Gesamtbetrag (inkl. MwSt.)</span>
            <span className="tabular-nums text-amber-900">{order.finalTotal.toFixed(2)} €</span>
          </div>
        </div>

        {/* KassenSichV TSE & VAT Block */}
        <div className="pt-4 text-[11px] text-stone-500 space-y-1.5 bg-stone-50/80 p-3 rounded-lg border border-stone-200/60 mt-4">
          <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KassenSichV TSE-Prüfzertifikat</span>
          </div>
          <div className="flex justify-between">
            <span>MwSt. 7% (Speisen): {order.vat7.toFixed(2)} €</span>
            <span>MwSt. 19% (Getränke): {order.vat19.toFixed(2)} €</span>
          </div>
          <div className="text-[10px] font-mono break-all text-stone-400">
            TSE-Signatur: {order.tseTransactionId}
          </div>
          <div className="text-[10px] text-stone-400">
            Kassensystem: {restaurant.posSystemName} · TSE-Seriennr.: {restaurant.tseSerial}
          </div>
        </div>

        {/* Email receipt footer stamp */}
        <div className="mt-6 pt-4 border-t border-dashed border-stone-300 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            <Mail className="w-3.5 h-3.5 text-amber-800" />
            <span>Digitaler Beleg zugestellt an {order.customerEmail}</span>
          </div>
          <div className="flex justify-center mt-3">
            <RateYourPlateLogo size="xs" showTagline={false} />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Vielen Dank für Ihren Besuch und Ihr wertvolles Feedback für unseren Küchenchef!
          </p>
        </div>
      </div>

      {/* Action Buttons Below Receipt */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Speisekarte</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Beleg drucken</span>
          </button>
        </div>
      </div>
    </div>
  );
};
