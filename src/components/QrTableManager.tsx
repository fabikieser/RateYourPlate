import React, { useState } from 'react';
import { QrCode, Printer, ExternalLink, Sparkles, Utensils, Download, Check } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { generateQrSvg } from '../utils/qrCode';
import { RateYourPlateLogo } from './RateYourPlateLogo';

interface QrTableManagerProps {
  restaurant: Restaurant;
  onOpenTableAsGuest: (tableNumber: string | number) => void;
}

export const QrTableManager: React.FC<QrTableManagerProps> = ({
  restaurant,
  onOpenTableAsGuest,
}) => {
  const [selectedTable, setSelectedTable] = useState<string | number>(restaurant.tables[0] || 1);
  const [copiedLink, setCopiedLink] = useState(false);

  // URL link encoded in the QR code
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://rateyourplate.app';
  const tableUrl = `${currentOrigin}/?restaurant=${restaurant.id}&table=${selectedTable}`;
  const qrSvgString = generateQrSvg(tableUrl, 260);

  const handlePrintStand = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-amber-800 tracking-wider">
            TISCH-AUFSTELLER & QR-CODE GENERATOR
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900 mt-1">
            QR-Codes für {restaurant.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Druckfertige Tischkarten mit individuellem QR-Code. Gäste scannen, bestellen und erhalten 0,50 € Rabatt für Bewertungen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintStand}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Tischaufsteller drucken</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-start">
        {/* Left Column: Table Selection & Configuration */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-900 mb-3">
              1. Tisch auswählen
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {restaurant.tables.map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setSelectedTable(tbl)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    selectedTable === tbl
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Tisch {tbl}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div>
                <span className="text-xs text-stone-500 block mb-1">
                  Direkter Link für Tisch {selectedTable}:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tableUrl}
                    className="w-full text-xs font-mono p-2 bg-stone-50 border border-stone-200 rounded text-stone-700 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : 'Kopieren'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => onOpenTableAsGuest(selectedTable)}
                className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-amber-800" />
                <span>Als Gast an Tisch {selectedTable} testen & öffnen</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs space-y-2">
            <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Gastro-Vorteil für den Betrieb</span>
            </h3>
            <p className="text-stone-700 leading-relaxed">
              Durch den aufgedruckten <strong>0,50 € Rabatt-Hinweis</strong> scannen über 78% der Gäste den QR-Code und geben direktes Sterne-Feedback für die Küche ab. Gleichzeitig werden Wartezeiten bei der Bezahlung komplett eliminiert!
            </p>
          </div>
        </div>

        {/* Right Column: High-End Printable Table Stand Card Preview */}
        <div className="md:col-span-7 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-stone-800 shadow-2xl p-6 sm:p-8 text-center text-stone-900 relative">
            {/* Stand Header Accent with RateYourPlate Logo */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <RateYourPlateLogo size="xs" showTagline={false} />
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 font-serif-display">
                Tisch-Zahlung
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-bold font-serif-display tracking-tight text-stone-900">
                {restaurant.name}
              </h2>
              <div className="inline-block mt-2 bg-stone-900 text-white font-mono font-bold text-sm px-4 py-1 rounded-full">
                TISCH {selectedTable}
              </div>
            </div>

            {/* Generated Crisp SVG QR Code */}
            <div className="my-5 p-3 bg-white border border-stone-200 rounded-xl shadow-xs inline-block max-w-[210px] mx-auto">
              <div
                className="w-44 h-44 mx-auto"
                dangerouslySetInnerHTML={{ __html: qrSvgString }}
              />
            </div>

            {/* Call to action & instructions */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-stone-900 text-sm">
                1. Smartphone-Kamera öffnen & scannen
              </p>
              <p className="text-stone-600 text-[11px] leading-snug">
                Speisekarte öffnen · Direkt am Tisch bestellen · Keine Wartezeit beim Bezahlen
              </p>
            </div>

            {/* Feedback reward promo tag on stand */}
            <div className="mt-4 pt-3 border-t border-stone-200 bg-amber-50/80 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950">
                <span>🌟 0,50 € Rabatt pro Gerichtsbewertung!</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Direkt mit PayPal, Apple Pay oder Kreditkarte bezahlen · Beleg per E-Mail
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
