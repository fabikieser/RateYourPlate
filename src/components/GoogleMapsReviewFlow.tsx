import React, { useState, useMemo, useEffect } from 'react';
import { Star, MapPin, Copy, Check, ExternalLink, Sparkles, QrCode, ThumbsUp, Heart, ChevronDown, ChevronUp, Share2, Award, MessageSquare } from 'lucide-react';
import { Restaurant, Order, RestaurantGoogleReview } from '../types/restaurant';

interface GoogleMapsReviewFlowProps {
  order: Order;
  restaurant: Restaurant;
  onReviewSubmitted?: (review: RestaurantGoogleReview) => void;
  className?: string;
}

const PRESET_TAGS = [
  'Hervorragende Speisen',
  'Aufmerksamer Service',
  'Tolles Ambiente',
  'Sehr schneller Service',
  'Faire Preise',
  'Frische Zutaten',
  'Modernes QR-Bestellen',
  'Absolut empfehlenswert'
];

export const GoogleMapsReviewFlow: React.FC<GoogleMapsReviewFlowProps> = ({
  order,
  restaurant,
  onReviewSubmitted,
  className = '',
}) => {
  // 1. Calculate food rating based on dishes rated by the guest
  const ratedDishesEntries = Object.entries(order.ratedDishes || {});
  const dishRatingsCount = ratedDishesEntries.length;

  const calculatedFoodStars = useMemo(() => {
    if (dishRatingsCount === 0) return 5;
    const sum = ratedDishesEntries.reduce((acc, [, val]) => acc + (val.stars || 5), 0);
    return Math.max(1, Math.min(5, Math.round(sum / dishRatingsCount)));
  }, [ratedDishesEntries, dishRatingsCount]);

  // Sub-category rating states
  const [foodStars, setFoodStars] = useState<number>(calculatedFoodStars);
  const [serviceStars, setServiceStars] = useState<number>(5);
  const [ambienceStars, setAmbienceStars] = useState<number>(5);
  const [speedStars, setSpeedStars] = useState<number>(5);
  const [valueStars, setValueStars] = useState<number>(5);

  // Manual overall stars (or auto-suggested)
  const [manualOverallStars, setManualOverallStars] = useState<number | null>(null);

  // Suggested overall calculation (weighted towards food)
  const suggestedOverallStars = useMemo(() => {
    const weightedAvg = (foodStars * 1.5 + serviceStars * 1.0 + ambienceStars * 0.8 + speedStars * 0.8 + valueStars * 0.9) / 5.0;
    return Math.max(1, Math.min(5, Math.round(weightedAvg)));
  }, [foodStars, serviceStars, ambienceStars, speedStars, valueStars]);

  const overallStars = manualOverallStars !== null ? manualOverallStars : suggestedOverallStars;

  // Selected sentiment tags
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Hervorragende Speisen',
    'Aufmerksamer Service',
    'Absolut empfehlenswert'
  ]);

  // Review text
  const [reviewText, setReviewText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [hasOpenedGoogle, setHasOpenedGoogle] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState<boolean>(true);

  // Discovered dish names from the order
  const ratedDishNames = useMemo(() => {
    return order.items
      .filter(item => order.ratedDishes[item.dish.id] && order.ratedDishes[item.dish.id].stars > 0)
      .map(item => ({
        name: item.dish.name,
        stars: order.ratedDishes[item.dish.id].stars
      }));
  }, [order]);

  // Generate review text based on stars and dish ratings
  const generateReviewDraft = () => {
    const dishPart = ratedDishNames.length > 0
      ? `Besonders begeistert waren wir von den Speisen: ${ratedDishNames.map(d => `${d.name} (${d.stars}/5★)`).join(', ')}.`
      : order.items.length > 0
      ? `Die Speisen (${order.items.slice(0, 2).map(i => i.dish.name).join(', ')}) waren frisch und hervorragend zubereitet.`
      : 'Das Essen war hervorragend zubereitet.';

    let servicePart = '';
    if (serviceStars >= 4) {
      servicePart = 'Der Service war ausgesprochen freundlich, zuvorkommend und aufmerksam.';
    } else if (serviceStars === 3) {
      servicePart = 'Der Service war in Ordnung.';
    } else {
      servicePart = 'Beim Service gibt es noch etwas Luft nach oben.';
    }

    let ambiencePart = '';
    if (ambienceStars >= 4) {
      ambiencePart = 'Das Ambiente ist sehr gemütlich und stilvoll.';
    }

    let speedPart = '';
    if (speedStars >= 4) {
      speedPart = 'Die Wartezeit war super kurz und das Essen kam heiß an den Tisch.';
    }

    const tagsPart = selectedTags.length > 0
      ? `Highlights: ${selectedTags.join(', ')}.`
      : '';

    const conclusion = overallStars >= 4
      ? 'Uneingeschränkte Empfehlung – wir kommen sehr gerne wieder!'
      : 'Vielen Dank für den Besuch.';

    const draft = [
      `Wunderbares Erlebnis im ${restaurant.name}!`,
      dishPart,
      servicePart,
      ambiencePart,
      speedPart,
      tagsPart,
      conclusion
    ].filter(Boolean).join(' ');

    setReviewText(draft);
  };

  // Initial review text generation
  useEffect(() => {
    generateReviewDraft();
  }, [foodStars, serviceStars, ambienceStars, speedStars, valueStars, overallStars, selectedTags.length]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Construct target Google Maps URL
  const googleMapsReviewUrl = useMemo(() => {
    if (restaurant.googlePlaceId) {
      return `https://search.google.com/local/writereview?placeid=${restaurant.googlePlaceId}`;
    }
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.city} ${restaurant.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [restaurant]);

  // Handle Copy & Open Google Maps
  const handleCopyAndOpenGoogle = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(reviewText);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000);
    } catch {
      // Fallback
    }

    setHasOpenedGoogle(true);

    // Save review record
    const newGoogleReview: RestaurantGoogleReview = {
      id: 'g_rev_' + Date.now(),
      orderId: order.id,
      restaurantId: restaurant.id,
      customerName: order.customerName || (order.tableNumber ? `Gast Tisch ${order.tableNumber}` : 'Gast'),
      tableNumber: order.tableNumber,
      overallStars,
      foodStars,
      serviceStars,
      ambienceStars,
      speedStars,
      valueStars,
      reviewText,
      tags: selectedTags,
      dishesMentioned: ratedDishNames.map(d => d.name),
      copiedToClipboard: true,
      openedGoogleMaps: true,
      timestamp: 'Gerade eben'
    };

    onReviewSubmitted?.(newGoogleReview);

    // Open Google Maps via safe anchor link
    try {
      const link = document.createElement('a');
      link.href = googleMapsReviewUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white via-amber-50/20 to-stone-50 border-2 border-amber-500/40 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 text-white p-5 sm:p-6 border-b border-amber-600/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider">
                  Google Maps Bewertung
                </span>
                <span className="text-xs text-stone-300">
                  {restaurant.name}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white mt-1">
                Deine Erfahrung direkt bei Google Maps teilen
              </h3>
              <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                Deine Speisen-Bewertungen fließen automatisch in die Gesamtnote ein. Unterstütze das Team mit einer Google Rezension!
              </p>
            </div>
          </div>

          {/* Current Google Reputation Badge */}
          <div className="bg-stone-800/90 border border-stone-700 rounded-xl p-3 text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5 text-amber-400">
              <span className="text-xl font-bold font-mono">
                {restaurant.googleMapsRating || 4.8}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Google Maps ({restaurant.googleMapsReviewCount || 428} Rezensionen)
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Dish Rating Influence & Suggested Overall Star Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-amber-900 block mb-0.5">
                Vorgeschlagene Google Gesamtbewertung
              </span>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>{overallStars} von 5 Sternen</span>
                {manualOverallStars === null && (
                  <span className="text-[11px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    ✨ Automatisch berechnet aus {dishRatingsCount > 0 ? `${dishRatingsCount} Speisen & Kategorien` : 'Kategorien'}
                  </span>
                )}
              </h4>
            </div>

            {/* Clickable Overall Stars */}
            <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setManualOverallStars(s)}
                  className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  title={`${s} Sterne für Google Maps`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      s <= overallStars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-stone-700 ml-1.5 tabular-nums">
                {overallStars}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Dishes that influenced the rating */}
          {ratedDishNames.length > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700 block mb-2">
                🍽️ Speisen-Einfluss auf die Google Bewertung:
              </span>
              <div className="flex flex-wrap gap-2">
                {ratedDishNames.map((d, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-medium"
                  >
                    <span>{d.name}</span>
                    <span className="flex items-center gap-0.5 font-bold text-amber-700">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {d.stars}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Rate Other Categories (Speisen, Service, Ambiente, Schnelligkeit, Preis-Leistung) */}
        <div className="bg-stone-50/70 p-4 sm:p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <span>Google Teilkategorien detailliert bewerten</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowCategoryDetails(!showCategoryDetails)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{showCategoryDetails ? 'Einklappen' : 'Details anpassen'}</span>
              {showCategoryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showCategoryDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {/* 1. Speisen & Essen (Derived from dishes!) */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">1. Speisen & Qualität</span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    {dishRatingsCount > 0 ? 'aus Gerichten' : 'Küche'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFoodStars(s)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= foodStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{foodStars}/5</span>
                </div>
              </div>

              {/* 2. Service & Freundlichkeit */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">2. Service & Team</span>
                  <span className="text-[10px] text-stone-500">Freundlichkeit</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServiceStars(s)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= serviceStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{serviceStars}/5</span>
                </div>
              </div>

              {/* 3. Ambiente & Atmosphäre */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">3. Ambiente & Flair</span>
                  <span className="text-[10px] text-stone-500">Atmosphäre</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAmbienceStars(s)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= ambienceStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{ambienceStars}/5</span>
                </div>
              </div>

              {/* 4. Wartezeit & Schnelligkeit */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">4. Schnelligkeit</span>
                  <span className="text-[10px] text-stone-500">Wartezeit</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeedStars(s)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= speedStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{speedStars}/5</span>
                </div>
              </div>

              {/* 5. Preis-Leistungs-Verhältnis */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">5. Preis-Leistung</span>
                  <span className="text-[10px] text-stone-500">Faire Preise</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setValueStars(s)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= valueStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{valueStars}/5</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Quick Keyword Tags */}
        <div>
          <span className="text-xs font-semibold text-stone-600 block mb-2">
            Stichwörter & Pluspunkte hinzufügen:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                    active
                      ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Review Text Editor */}
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="google-review-text" className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Vorgeschlagener Rezensionstext für Google Maps (editierbar):</span>
            </label>
            <button
              type="button"
              onClick={generateReviewDraft}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold cursor-pointer underline"
            >
              Neu generieren
            </button>
          </div>
          <textarea
            id="google-review-text"
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 leading-relaxed"
            placeholder="Schreibe deine persönliche Google Maps Bewertung..."
          />
          <div className="flex items-center justify-between mt-2 text-[11px] text-stone-500">
            <span>Tipp: Klicke auf 'Kopieren & Google öffnen' – der Text wird kopiert und kann bei Google mit 1 Klick eingefügt werden.</span>
            <span>{reviewText.length} Zeichen</span>
          </div>
        </div>

        {/* Step 5: Big Call to Action & 1-Click Google Maps Integration */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleCopyAndOpenGoogle}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all active:scale-98"
          >
            {isCopied ? (
              <>
                <Check className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Text kopiert! Google Maps öffnet sich...</span>
              </>
            ) : (
              <>
                <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span>Text kopieren & direkt auf Google Maps bewerten ({overallStars}★)</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowQrCode(!showQrCode)}
            className="px-4 py-3.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
            title="Mit Smartphone scannen"
          >
            <QrCode className="w-4 h-4 text-stone-700" />
            <span>{showQrCode ? 'QR schließen' : 'QR-Code für Begleitung'}</span>
          </button>
        </div>

        {/* QR Code Expansion for Smartphone Companions */}
        {showQrCode && (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
            <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(googleMapsReviewUrl)}`}
                alt="Google Maps QR Code"
                className="w-28 h-28"
              />
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900">
                Google Maps Bewertung für Freunde am Tisch
              </h5>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Deine Begleitung kann diesen QR-Code mit der Handy-Kamera scannen, um das Restaurant ebenfalls direkt in der Google Maps App mit 5 Sternen zu bewerten.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-900 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>{restaurant.name} · {restaurant.city}</span>
              </div>
            </div>
          </div>
        )}

        {hasOpenedGoogle && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Vielen Dank!</strong> Deine Bewertung unterstützt lokale Gastronomiebetriebe ungemein.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
