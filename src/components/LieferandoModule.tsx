import React, { useState } from 'react';
import {
  Bike,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Sliders,
  DollarSign,
  AlertCircle,
  Copy,
  Download,
  Power,
  Clock,
  Sparkles,
  ShoppingBag,
  Store,
  Check,
  Send,
  Flame,
  Utensils
} from 'lucide-react';
import { Restaurant, Dish, Order } from '../types/restaurant';

interface LieferandoModuleProps {
  restaurant: Restaurant;
  onSyncAllDishes?: (markupPercent: number) => void;
  onSimulateLieferandoOrder?: () => void;
  onToggleLieferandoStatus?: (online: boolean) => void;
  onUpdateLieferandoSettings?: (storeId: string, apiKey: string, markup: number, autoSync: boolean) => void;
}

export const LieferandoModule: React.FC<LieferandoModuleProps> = ({
  restaurant,
  onSyncAllDishes,
  onSimulateLieferandoOrder,
  onToggleLieferandoStatus,
  onUpdateLieferandoSettings,
}) => {
  // Connection and shop state
  const [isStoreOnline, setIsStoreOnline] = useState(restaurant.lieferandoConnected ?? true);
  const [storeId, setStoreId] = useState(restaurant.lieferandoStoreId || 'LIF-FRA-68201');
  const [apiKey, setApiKey] = useState(restaurant.lieferandoApiKey || 'live_sec_lfd_99214_bv_frankfurt');
  const [markupPercent, setMarkupPercent] = useState<number>(restaurant.lieferandoMarkupPercent || 0);
  const [autoSync, setAutoSync] = useState(restaurant.lieferandoAutoSync ?? true);

  // Sync animation state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(restaurant.lieferandoLastSync || 'Heute, 17:42 Uhr');

  // Dish availability overrides for Lieferando
  const [disabledDishIds, setDisabledDishIds] = useState<Set<string>>(new Set());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [testOrderNotice, setTestOrderNotice] = useState(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);

  const lieferandoUrl = restaurant.lieferandoUrl || `https://www.lieferando.de/speisekarte/${encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'))}`;
  const feedEndpointUrl = `https://rateyourplate.app/api/v1/lieferando/menu/${restaurant.id}/feed.json`;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncProgress(15);

    setTimeout(() => setSyncProgress(45), 350);
    setTimeout(() => setSyncProgress(80), 750);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      const nowStr = 'Gerade eben (' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr)';
      setLastSyncTime(nowStr);
      setSyncSuccessToast(true);
      if (onSyncAllDishes) {
        onSyncAllDishes(markupPercent);
      }
      setTimeout(() => setSyncSuccessToast(false), 3500);
    }, 1100);
  };

  const handleToggleStoreStatus = () => {
    const next = !isStoreOnline;
    setIsStoreOnline(next);
    if (onToggleLieferandoStatus) {
      onToggleLieferandoStatus(next);
    }
  };

  const handleToggleDishLieferando = (dishId: string) => {
    setDisabledDishIds(prev => {
      const next = new Set(prev);
      if (next.has(dishId)) {
        next.delete(dishId);
      } else {
        next.add(dishId);
      }
      return next;
    });
  };

  const handleSimulateOrder = () => {
    if (onSimulateLieferandoOrder) {
      onSimulateLieferandoOrder();
    }
    setTestOrderNotice(true);
    setTimeout(() => setTestOrderNotice(false), 3500);
  };

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(feedEndpointUrl);
    setCopiedFeedUrl(true);
    setTimeout(() => setCopiedFeedUrl(false), 2200);
  };

  const handleDownloadLieferandoJson = () => {
    const payload = {
      restaurantId: restaurant.id,
      storeName: restaurant.name,
      lieferandoStoreId: storeId,
      exportedAt: new Date().toISOString(),
      markupPercent,
      categories: restaurant.categories.map(cat => ({
        name: cat,
        dishes: restaurant.dishes
          .filter(d => d.category === cat && !disabledDishIds.has(d.id))
          .map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            price: Number((d.price * (1 + markupPercent / 100)).toFixed(2)),
            basePrice: d.price,
            allergens: d.allergens || [],
            prepTimeMinutes: d.prepTimeMinutes || 15,
            available: d.available,
            imageUrl: d.imageUrl || null
          }))
      }))
    };

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `Lieferando_Speisekarte_${restaurant.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDishes = restaurant.dishes.filter(d => {
    if (selectedCategoryFilter === 'all') return true;
    return d.category === selectedCategoryFilter;
  });

  const activeOnLieferandoCount = restaurant.dishes.length - disabledDishIds.size;

  return (
    <div className="space-y-6">
      {/* Lieferando Brand Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-[#FF8000] to-amber-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white text-orange-600 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Bike className="w-4 h-4" />
                <span>Lieferando Partner Connect</span>
              </span>

              {isStoreOnline ? (
                <span className="bg-emerald-950/40 text-emerald-100 border border-emerald-300/40 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online & Bestellbereit</span>
                </span>
              ) : (
                <span className="bg-stone-900/60 text-stone-200 border border-stone-500/50 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span>Lieferando Pausiert</span>
                </span>
              )}

              <span className="text-white/80 text-xs font-mono bg-black/20 px-2 py-0.5 rounded border border-white/20">
                Store: {storeId}
              </span>
            </div>

            <h2 className="text-2xl font-bold font-serif-display text-white">
              Lieferando Live-Synchronisation & Menü-Export
            </h2>
            <p className="text-xs sm:text-sm text-orange-50 max-w-2xl leading-relaxed">
              Veröffentlichen Sie alle Gerichte, Preise, Fotos und Allergene mit einem Klick
              direkt auf Lieferando. Eingehende Lieferando-Bestellungen fließen automatisch in Ihren Küchen-Monitor!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2.5 text-xs font-bold bg-white text-orange-600 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-98 disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 text-orange-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing ? `Synchronisiere (${syncProgress}%)...` : 'Jetzt alle Gerichte synchronisieren'}
              </span>
            </button>

            <a
              href={lieferandoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 text-xs font-medium bg-black/20 hover:bg-black/30 text-white border border-white/30 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>Lieferando Shop ansehen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleToggleStoreStatus}
              className={`px-3 py-2.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isStoreOnline
                  ? 'bg-orange-800/50 text-white border-white/30 hover:bg-orange-800/80'
                  : 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isStoreOnline ? 'Pause (Küche voll)' : 'Shop reaktivieren'}</span>
            </button>
          </div>
        </div>

        {/* Sync Progress Bar if syncing */}
        {isSyncing && (
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-orange-100 mt-1 block">
              Übertrage {restaurant.dishes.length} Gerichte, Allergen-Deklarationen und Fotos an Lieferando API...
            </span>
          </div>
        )}

        {/* Feedback notices */}
        {syncSuccessToast && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center gap-2 text-xs font-semibold text-white animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Erfolgreich synchronisiert! Alle {activeOnLieferandoCount} Gerichte sind jetzt live auf Lieferando.de verfügbar.</span>
          </div>
        )}

        {testOrderNotice && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center gap-2 text-xs font-semibold text-white animate-in fade-in">
            <Bike className="w-4 h-4 text-white shrink-0" />
            <span>Neue Lieferando-Bestellung (#LIF-99412) generiert! Schauen Sie jetzt im Küchen-Monitor nach.</span>
          </div>
        )}

        {/* Footer info in banner */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-orange-100 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Letzte Synchronisation: <strong className="text-white">{lastSyncTime}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>Aktive Gerichte auf Lieferando: <strong className="text-white">{activeOnLieferandoCount} von {restaurant.dishes.length}</strong></span>
            {markupPercent > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded font-mono text-[11px]">
                +{markupPercent}% Lieferando-Aufschlag aktiv
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Settings & Pricing Rule (Left) + Test Simulation & Feed (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Platform Pricing & API Config */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 font-serif-display text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-600" />
              <span>Lieferando Preis-Regeln & API-Verbindung</span>
            </h3>
            <p className="text-xs text-stone-500">
              Steuern Sie, ob Gerichte bei Lieferando 1:1 oder mit Plattform-Aufschlag synchronisiert werden.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Markup option */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  Lieferando-Preisaufschlag
                </span>
                <span className="text-xs font-mono font-bold text-orange-600">
                  +{markupPercent}%
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Gleicht Lieferando-Plattformprovisionen (13-15%) automatisch aus.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[0, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMarkupPercent(val)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      markupPercent === val
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {val === 0 ? '0% (1:1)' : `+${val}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Sync Toggle */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                Echtzeit-Synchronisation
              </span>
              <p className="text-[11px] text-stone-500">
                Sobald Sie ein Gericht im Betreiber-Dashboard bearbeiten, wird Lieferando sofort per Webhook aktualisiert.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-800">
                  Automatische Synchronisation aktiv
                </span>
              </label>
            </div>
          </div>

          {/* API Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Lieferando Restaurant Store-ID
              </label>
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value.trim())}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Lieferando Partner API Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Test Order & Export */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 font-serif-display text-base flex items-center gap-2">
              <Bike className="w-5 h-5 text-orange-600" />
              <span>Lieferando Test & Export</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Testen Sie den Bestelleingang und laden Sie den Speisekarten-Katalog herunter.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSimulateOrder}
              className="w-full py-2.5 px-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Lieferando-Bestellung simulieren</span>
            </button>
            <p className="text-[11px] text-stone-500 leading-tight">
              Erzeugt eine simulierte Lieferando-Bestellung mit Fahrer-Abholzeit und überträgt sie direkt in den Küchen-Monitor.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              Lieferando Menü JSON-Feed
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedEndpointUrl}
                className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-stone-50 border border-stone-200 rounded-lg text-stone-600 truncate"
              />
              <button
                onClick={handleCopyFeedUrl}
                className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg border border-stone-200 shrink-0 cursor-pointer"
                title="Feed URL kopieren"
              >
                {copiedFeedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleDownloadLieferandoJson}
              className="w-full py-2 px-3 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Menü-JSON herunterladen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dish-by-Dish Lieferando Catalog & Status */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-bold text-stone-900 font-serif-display text-lg">
              Gerichte auf Lieferando verwalten
            </h3>
            <span className="text-xs text-stone-500">
              Aktivieren oder deaktivieren Sie einzelne Gerichte gezielt für den Lieferservice.
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Alle ({restaurant.dishes.length})
            </button>
            {restaurant.categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200/80">
              <tr>
                <th className="py-2.5 px-3">Gericht</th>
                <th className="py-2.5 px-3">Kategorie</th>
                <th className="py-2.5 px-3">Restaurant-Preis</th>
                <th className="py-2.5 px-3">Lieferando-Preis</th>
                <th className="py-2.5 px-3">Allergene & Zutaten</th>
                <th className="py-2.5 px-3">Lieferando Status</th>
                <th className="py-2.5 px-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDishes.map((dish) => {
                const isExcluded = disabledDishIds.has(dish.id);
                const lieferandoPrice = markupPercent > 0
                  ? (dish.price * (1 + markupPercent / 100)).toFixed(2)
                  : dish.price.toFixed(2);

                return (
                  <tr key={dish.id} className={`hover:bg-stone-50/70 transition-colors ${isExcluded ? 'opacity-55' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                        <span>{dish.name}</span>
                        {dish.chefRecommendation && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                            Chef
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 max-w-sm">
                        {dish.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-medium">
                      {dish.category}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 font-mono">
                      {dish.price.toFixed(2)} €
                    </td>
                    <td className="py-3 px-3 font-bold text-orange-600 font-mono">
                      {lieferandoPrice} €
                      {markupPercent > 0 && (
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          (+{markupPercent}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {dish.allergens && dish.allergens.length > 0 ? (
                        <span className="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                          {dish.allergens.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Keine Allergene</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {!isExcluded ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Online auf Lieferando</span>
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-600 text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span>Pausiert</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleDishLieferando(dish.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                          !isExcluded
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            : 'bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold'
                        }`}
                      >
                        {!isExcluded ? 'Pausieren' : 'Aktivieren'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
