import React, { useState } from 'react';
import { Star, MessageSquare, Plus, Minus, Check, Flame, Clock, Lock, Sparkles, ChefHat, Crown, Quote } from 'lucide-react';
import { Dish, DishRating } from '../types/restaurant';

interface DishCardProps {
  dish: Dish;
  cartQuantity: number;
  onAddToCart: (dish: Dish) => void;
  onRemoveFromCart: (dishId: string) => void;
  guestRating?: { stars: number; comment?: string };
  onRateDish: (dishId: string, stars: number, comment?: string) => void;
  discountPerRating: number;
  isConsumed?: boolean;
  consumptionStatus?: 'not_ordered' | 'preparing' | 'served';
  tableNumber?: string | number;
  onSimulateServe?: () => void;
  isTopCategoryDish?: boolean;
  dishRatings?: DishRating[];
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
  guestRating,
  onRateDish,
  discountPerRating,
  isConsumed = false,
  consumptionStatus = 'not_ordered',
  tableNumber = 4,
  onSimulateServe,
  isTopCategoryDish = false,
  dishRatings = [],
}) => {
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState(guestRating?.comment || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLockInfo, setShowLockInfo] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const activeStars = guestRating?.stars || 0;
  const isRated = activeStars > 0;
  const isUnrated = dish.ratingCount === 0;

  const handleStarClick = (stars: number) => {
    if (!isConsumed) {
      setShowLockInfo(true);
      return;
    }
    onRateDish(dish.id, stars, commentText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleSaveComment = () => {
    if (!isConsumed) {
      setShowLockInfo(true);
      return;
    }
    if (activeStars > 0) {
      onRateDish(dish.id, activeStars, commentText);
      setIsCommentOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2200);
    } else {
      onRateDish(dish.id, 5, commentText);
      setIsCommentOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2200);
    }
  };

  // Culinary category visual accents
  const renderCategoryIcon = () => {
    switch (dish.cuisineCategory) {
      case 'pasta':
        return '🍝';
      case 'meat':
        return '🥩';
      case 'burger':
        return '🍔';
      case 'dessert':
        return '🍨';
      case 'drink':
        return '🍷';
      case 'starter':
        return '🥗';
      default:
        return '🍽️';
    }
  };

  return (
    <article className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      {/* Visual Header / Showcase */}
      <div className="relative h-48 bg-stone-100 overflow-hidden border-b border-stone-100">
        {dish.imageUrl && !imageError ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 flex items-center justify-center p-4">
            <div className="text-center">
              <span className="text-5xl drop-shadow-sm select-none" role="img" aria-label={dish.name}>
                {renderCategoryIcon()}
              </span>
              <p className="mt-2 text-xs font-serif-display italic text-stone-500">
                {dish.category}
              </p>
            </div>
          </div>
        )}

        {dish.chefRecommendation && (
          <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-xs text-amber-200 text-xs px-2.5 py-1 rounded-md font-medium tracking-wide flex items-center gap-1 shadow-xs z-10">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Empfehlung</span>
          </div>
        )}

        {isTopCategoryDish && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 text-xs px-2.5 py-1 rounded-md font-bold tracking-wide flex items-center gap-1 shadow-md z-10 border border-amber-300">
            <Crown className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
            <span>Top-Gericht #{dish.category}</span>
          </div>
        )}

        {/* Rating Stats Badge on Image */}
        {isUnrated ? (
          <div className="absolute bottom-3 right-3 bg-emerald-900/90 backdrop-blur-xs text-emerald-100 text-[11px] px-2.5 py-1 rounded-md border border-emerald-600/70 flex items-center gap-1 shadow-2xs z-10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold">Neu · Unbewertet</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowReviewsModal(true)}
            className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-xs px-2.5 py-1 rounded-md border border-stone-200/80 flex items-center gap-1.5 shadow-2xs z-10 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Gäste-Bewertungen ansehen"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold tabular-nums">{dish.ratingAverage.toFixed(1)}</span>
            <span className="text-stone-500 text-[11px]">({dish.ratingCount})</span>
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-stone-900 leading-snug">
              {dish.name}
            </h3>
            <span className="text-base sm:text-lg font-bold text-stone-900 tabular-nums shrink-0 font-serif-display">
              {dish.price.toFixed(2)} €
            </span>
          </div>

          {/* Prominent Rating & Popularity Row */}
          {!isUnrated ? (
            <div className="flex items-center justify-between gap-2 my-2 py-1.5 px-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(dish.ratingAverage)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900 tabular-nums">
                  {dish.ratingAverage.toFixed(1)}
                </span>
                <span className="text-[11px] text-stone-600">
                  ({dish.ratingCount} {dish.ratingCount === 1 ? 'Bewertung' : 'Bewertungen'})
                </span>
              </div>

              {dishRatings && dishRatings.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowReviewsModal(true)}
                  className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-amber-700" />
                  <span>Gästestimmen ({dishRatings.length})</span>
                </button>
              ) : (
                <span className="text-[10px] text-stone-400 font-medium">Top bewertet</span>
              )}
            </div>
          ) : (
            <div className="my-2 p-2.5 bg-emerald-50/90 border border-emerald-300/80 rounded-lg text-xs text-emerald-950 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block text-emerald-900">
                  ✨ Neuheit auf der Speisekarte · Noch unbewertet
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                  Lust auf etwas Neues? Probiere diese frische Kreation aus und werde der erste Gast, der sie bewertet (+0,50 € Belohnung nach dem Essen)!
                </p>
              </div>
            </div>
          )}

          {/* Authentic Guest Quote Preview snippet */}
          {dishRatings && dishRatings.length > 0 && dishRatings[0].comment && (
            <div className="mb-2.5 px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200/70 text-[11px] text-stone-700 flex items-start gap-1.5">
              <Quote className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic text-[11px]">
                "{dishRatings[0].comment}"
                {dishRatings[0].guestName && (
                  <span className="not-italic text-stone-500 font-medium ml-1">
                    — {dishRatings[0].guestName}
                  </span>
                )}
              </p>
            </div>
          )}

          <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 mb-3 leading-relaxed">
            {dish.description}
          </p>

          {/* Unboxed Metadata: Allergens & Prep time with typographic separator */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-4">
            {dish.prepTimeMinutes && (
              <span className="inline-flex items-center gap-1 text-stone-600">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>ca. {dish.prepTimeMinutes} Min</span>
              </span>
            )}
            {dish.prepTimeMinutes && dish.allergens && dish.allergens.length > 0 && (
              <span aria-hidden="true" className="text-stone-300">·</span>
            )}
            {dish.allergens && dish.allergens.length > 0 && (
              <span className="text-stone-500 truncate max-w-full">
                Allergene: {dish.allergens.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Guest Rating & Reward Box with Anti-Cheat Consumption Verification */}
        <div className="pt-3 border-t border-stone-100 mt-2">
          {isConsumed ? (
            /* STATE 1: Dish WAS SERVED and CONSUMED -> Rating & Discount UNLOCKED */
            <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-300/80 mb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verzehrt an Tisch {tableNumber}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded text-right tabular-nums">
                  {isRated ? `-${discountPerRating.toFixed(2)} € Rabatt aktiv` : `-${discountPerRating.toFixed(2)} € Rabatt möglich`}
                </span>
              </div>

              <p className="text-[11px] text-emerald-900/80 mb-2">
                {isRated
                  ? 'Deine Bewertung ist aktiv und wird von der Rechnung abgezogen!'
                  : 'Wie hat es geschmeckt? Jetzt 1–5 Sterne bewerten für 0,50 € Rabatt:'}
              </p>

              {/* Interactive Stars 1-5 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoveredStars !== null ? hoveredStars >= star : activeStars >= star);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredStars(star)}
                        onMouseLeave={() => setHoveredStars(null)}
                        className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                        title={`${star} von 5 Sternen`}
                        aria-label={`${star} Sterne für ${dish.name}`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFilled
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-stone-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Optional Comment Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setIsCommentOpen(!isCommentOpen)}
                  className="text-xs font-medium text-emerald-900 hover:text-emerald-950 flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{guestRating?.comment ? 'Kommentar ändern' : '+ Feedback'}</span>
                </button>
              </div>

              {/* Saved Notification */}
              {savedSuccess && (
                <p className="mt-1.5 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Rabatt von {discountPerRating.toFixed(2)} € wird bei Tisch-Abrechnung abgezogen!</span>
                </p>
              )}

              {/* Inline Comment Input Drawer */}
              {isCommentOpen && (
                <div className="mt-2.5 pt-2.5 border-t border-emerald-200">
                  <label className="block text-[11px] text-emerald-950 mb-1 font-medium">
                    Dein Feedback an Koch & Restaurantleitung (optional):
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="z.B. Fantastische Trüffelnote, Garpunkt auf den Punkt..."
                    rows={2}
                    className="w-full text-xs p-2 rounded border border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none text-stone-800 placeholder:text-stone-400 resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCommentOpen(false)}
                      className="text-[11px] px-2 py-1 text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Schließen
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveComment}
                      className="text-[11px] font-medium px-2.5 py-1 bg-emerald-800 text-white rounded hover:bg-emerald-900 cursor-pointer transition-colors"
                    >
                      Speichern & 0,50 € sichern
                    </button>
                  </div>
                </div>
              )}

              {/* Shown if already has comment */}
              {guestRating?.comment && !isCommentOpen && (
                <p className="mt-2 text-[11px] italic text-emerald-950 bg-white/80 p-1.5 rounded border border-emerald-200">
                  "{guestRating.comment}"
                </p>
              )}
            </div>
          ) : consumptionStatus === 'preparing' ? (
            /* STATE 2: In Preparation in Kitchen -> Locked until served */
            <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-300/80 mb-3 text-xs">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Küche kocht für Tisch {tableNumber}</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                  Zubereitung
                </span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Dieses Gericht wird zubereitet. Die 1–5 Sterne Bewertung und der <strong>0,50 € Rabatt</strong> werden freigeschaltet, sobald der Service es serviert hat.
              </p>
              {onSimulateServe && (
                <button
                  type="button"
                  onClick={onSimulateServe}
                  className="mt-2 text-[10px] font-semibold text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3 h-3 text-emerald-800" />
                  <span>Demo: Als serviert markieren & Bewertung freischalten</span>
                </button>
              )}
            </div>
          ) : (
            /* STATE 3: NOT YET CONSUMED -> Protected Anti-Fraud Locked State */
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/90 mb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Bewertung erst nach Verzehr</span>
                </span>
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
                  +0,50 € Belohnung
                </span>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed mb-2">
                Anti-Missbrauch: Gerichte können erst bewertet werden, nachdem du sie bestellt & gegessen hast.
              </p>

              {/* Read-Only Public Rating Stars */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setShowLockInfo(!showLockInfo)}
                  className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  title="Klicken für Sicherheits-Details"
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(dish.ratingAverage)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-stone-800 ml-1">
                    {dish.ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    ({dish.ratingCount})
                  </span>
                </button>

                {onSimulateServe ? (
                  <button
                    type="button"
                    onClick={onSimulateServe}
                    className="text-[10px] font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    title="Für Entwicklungs- & Testzwecke"
                  >
                    ⚡ Demo: Als verzehrt testen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLockInfo(!showLockInfo)}
                    className="text-[10px] text-amber-800 font-medium hover:underline cursor-pointer"
                  >
                    Warum gesperrt?
                  </button>
                )}
              </div>

              {/* Informative Security Popover */}
              {showLockInfo && (
                <div className="mt-2 p-2 bg-amber-50/90 border border-amber-200 rounded text-[11px] text-amber-950 leading-normal animate-fadeIn">
                  <p className="font-semibold mb-0.5">🛡️ Verzehr-Sicherheitsgarantie:</p>
                  <p>
                    Damit Bewertungen authentisch bleiben und der Rabatt nicht vorab erschlichen wird, wird die Bewertungsfunktion erst nach dem Servieren an Tisch {tableNumber} freigeschaltet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLockInfo(false)}
                    className="mt-1 text-[10px] text-amber-800 underline font-semibold cursor-pointer"
                  >
                    Verstanden
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add to Cart Stepper */}
          <div className="flex items-center justify-between gap-3">
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1 w-full justify-between">
                <button
                  type="button"
                  onClick={() => onRemoveFromCart(dish.id)}
                  className="w-8 h-8 rounded-md bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 cursor-pointer shadow-2xs font-bold"
                  aria-label="Eine Portion entfernen"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-semibold text-stone-900 tabular-nums px-2">
                  {cartQuantity} im Warenkorb
                </span>
                <button
                  type="button"
                  onClick={() => onAddToCart(dish)}
                  className="w-8 h-8 rounded-md bg-amber-800 text-white flex items-center justify-center hover:bg-amber-900 cursor-pointer shadow-2xs font-bold"
                  aria-label="Noch eine Portion hinzufügen"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(dish)}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Bestellen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Modal for curious guests wanting to read feedback */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-5 sm:p-6 max-h-[85vh] flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  GÄSTE-BEWERTUNGEN & MEINUNGEN
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  {dish.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewsModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm cursor-pointer transition-colors"
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            {/* Average score header */}
            <div className="flex items-center gap-3 py-3 px-3.5 bg-amber-50/90 rounded-xl my-3 border border-amber-200/80">
              <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                {dish.ratingAverage.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(dish.ratingAverage)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-stone-600 font-medium">
                  {dish.ratingCount} verifizierte Gäste-Bewertungen
                </span>
              </div>
            </div>

            {/* Reviews list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-stone-100">
              {dishRatings && dishRatings.length > 0 ? (
                dishRatings.map((review) => (
                  <div key={review.id} className="pt-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{review.guestName || 'Gast'}</span>
                        <span className="text-[10px] text-stone-400">· Tisch {review.tableNumber}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-600 font-semibold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{review.stars}★</span>
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="text-stone-700 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 text-xs leading-relaxed">
                        "{review.comment}"
                      </p>
                    ) : (
                      <span className="text-stone-400 text-[10px]">Kein Textkommentar hinterlassen</span>
                    )}
                    <span className="text-[10px] text-stone-400 block mt-1">{review.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-stone-500 italic">
                    Für dieses Gericht liegen noch keine Textkommentare vor.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 mt-2">
              <button
                type="button"
                onClick={() => setShowReviewsModal(false)}
                className="w-full py-2.5 bg-stone-900 text-white font-semibold text-xs rounded-xl hover:bg-stone-800 cursor-pointer transition-colors"
              >
                Zurück zur Speisekarte
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
