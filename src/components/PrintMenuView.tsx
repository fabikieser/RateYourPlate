import React, { useState } from 'react';
import { Printer, ArrowLeft, Download, FileText, Sparkles, Utensils } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { generateQrSvg } from '../utils/qrCode';
import { RateYourPlateLogo } from './RateYourPlateLogo';

interface PrintMenuViewProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export const PrintMenuView: React.FC<PrintMenuViewProps> = ({
  restaurant,
  onBack,
}) => {
  const [paperFormat, setPaperFormat] = useState<'a4' | 'a5'>('a4');

  // URL for the menu QR code
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://rateyourplate.app';
  const menuUrl = `${currentOrigin}/?restaurant=${restaurant.id}`;
  const qrSvgString = generateQrSvg(menuUrl, 160);

  const handlePrint = () => {
    window.print();
  };

  // Group dishes by category
  const categories = restaurant.categories;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Non-printed Control Bar */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
            title="Zurück"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-stone-900 text-sm">
              Speisekarte Druck- & PDF-Export ({paperFormat.toUpperCase()})
            </h1>
            <p className="text-xs text-stone-500">
              Format wählen und als PDF abspeichern oder direkt auf Papier drucken
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Format selector */}
          <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPaperFormat('a4')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                paperFormat === 'a4'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              DIN A4
            </button>
            <button
              type="button"
              onClick={() => setPaperFormat('a5')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                paperFormat === 'a5'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              DIN A5
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Jetzt drucken / als PDF exportieren</span>
          </button>
        </div>
      </div>

      {/* Printable Menu Canvas (styled for A4 / A5 printing) */}
      <div
        className={`mx-auto bg-white border border-stone-300 shadow-xl print:shadow-none print:border-none print:m-0 print:p-0 transition-all ${
          paperFormat === 'a4'
            ? 'max-w-[210mm] p-10 sm:p-14 min-h-[297mm]'
            : 'max-w-[148mm] p-6 sm:p-8 min-h-[210mm]'
        }`}
      >
        {/* Restaurant Header with Logo */}
        <header className="text-center pb-8 border-b-2 border-stone-900 mb-8">
          {restaurant.logoUrl ? (
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-stone-900 shadow-xs">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-stone-900 text-amber-200 flex items-center justify-center font-serif-display text-2xl font-bold shadow-xs">
              {restaurant.name.charAt(0)}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-display tracking-tight text-stone-900">
            {restaurant.name}
          </h1>

          <p className="text-xs text-stone-600 mt-1 uppercase tracking-widest font-sans">
            Speisekarte · {restaurant.city}
          </p>

          <p className="text-[11px] text-stone-400 mt-0.5">
            {restaurant.address} · {restaurant.postalCode} · Tel. {restaurant.phone}
          </p>
        </header>

        {/* Categories & Dishes */}
        <div className="space-y-8">
          {categories.map((category) => {
            const dishesInCategory = restaurant.dishes.filter(d => d.category === category && d.available);
            if (dishesInCategory.length === 0) return null;

            return (
              <section key={category} className="space-y-4 break-inside-avoid">
                <div className="text-center">
                  <h2 className="text-base sm:text-lg font-bold font-serif-display text-stone-900 tracking-wide inline-block border-b border-amber-800/40 pb-1">
                    {category}
                  </h2>
                </div>

                <div className="space-y-4 pt-1">
                  {dishesInCategory.map((dish) => (
                    <article key={dish.id} className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-bold text-xs sm:text-sm text-stone-900">
                          {dish.name}
                          {dish.chefRecommendation && (
                            <span className="ml-2 text-[10px] italic font-normal text-amber-900">
                              (Empfehlung)
                            </span>
                          )}
                        </h3>
                        <span className="font-bold text-xs sm:text-sm font-serif-display tabular-nums text-stone-900 shrink-0">
                          {dish.price.toFixed(2)} €
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {dish.description}
                      </p>

                      {dish.allergens && dish.allergens.length > 0 && (
                        <p className="text-[10px] text-stone-400">
                          Allergene: {dish.allergens.join(', ')}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer with QR Code & Discount Reward Note */}
        <footer className="mt-12 pt-6 border-t-2 border-stone-900 flex items-center justify-between gap-4 break-inside-avoid">
          <div className="text-left max-w-md">
            <span className="font-bold font-serif-display text-xs sm:text-sm text-stone-900 block">
              Digital bestellen, Feedback geben & sparen!
            </span>
            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
              Scannen Sie den QR-Code mit Ihrem Smartphone: Bezahlen Sie direkt am Tisch via PayPal oder Apple Pay und erhalten Sie <strong>0,50 € Rabatt pro bewertetes Gericht</strong> sofort auf Ihre Rechnung!
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              Alle Preise inkl. MwSt. und Bedienung. KassenSichV TSE-konform.
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200">
              <RateYourPlateLogo size="xs" showTagline={false} />
              <span className="text-[10px] text-stone-500 font-sans">
                · Speisekarte & Tisch-Bewertungssystem
              </span>
            </div>
          </div>

          <div className="shrink-0 p-2 border border-stone-300 rounded-lg bg-white text-center">
            <div
              className="w-20 h-20 mx-auto"
              dangerouslySetInnerHTML={{ __html: qrSvgString }}
            />
            <span className="text-[9px] text-stone-500 font-mono block mt-1">
              Hier scannen
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
