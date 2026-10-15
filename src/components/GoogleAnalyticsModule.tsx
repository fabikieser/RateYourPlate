import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Star,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Globe,
  RefreshCw,
  QrCode,
  Flame,
  Check,
  Sliders,
  Play,
  Share2,
  Download
} from 'lucide-react';
import { Restaurant, Order, DishRating } from '../types/restaurant';
import { subscribeToAnalytics, emitAnalyticsEvent, AnalyticsEvent } from '../utils/analytics';
import { useLanguage } from '../context/LanguageContext';

interface GoogleAnalyticsModuleProps {
  restaurant: Restaurant;
  orders: Order[];
  ratings: DishRating[];
  onSaveAnalyticsConfig?: (measurementId: string, gtmId: string, dsgvoMode: boolean) => void;
}

interface SimulatedEvent {
  id: string;
  timeAgo: string;
  type: 'qr_scan' | 'dish_view' | 'cart_add' | 'dish_rated' | 'checkout' | 'google_review' | 'lang_switch';
  tableText: string;
  description: string;
  gaEventName: string;
  device: string;
  category: string;
}

const INITIAL_EVENTS: SimulatedEvent[] = [
  {
    id: 'evt_1',
    timeAgo: 'Vor 12 Sek.',
    type: 'dish_view',
    tableText: 'Tisch 4',
    description: 'Tagliatelle al Tartufo Fresco im Detail aufgerufen',
    gaEventName: 'view_item (dish_pasta_tartufo)',
    device: 'iOS Safari',
    category: 'menu'
  },
  {
    id: 'evt_2',
    timeAgo: 'Vor 28 Sek.',
    type: 'cart_add',
    tableText: 'Tisch 2',
    description: '2x Tiramisù Tradizionale della Casa in den Warenkorb gelegt',
    gaEventName: 'add_to_cart (dish_tiramisu_tradizionale)',
    device: 'Android Chrome',
    category: 'cart'
  },
  {
    id: 'evt_3',
    timeAgo: 'Vor 45 Sek.',
    type: 'qr_scan',
    tableText: 'Tisch 7',
    description: 'QR-Code Tischaufsteller gescannt & Speisekarte geladen',
    gaEventName: 'page_view (/menu?table=7)',
    device: 'iOS Safari',
    category: 'navigation'
  },
  {
    id: 'evt_4',
    timeAgo: 'Vor 1 Min.',
    type: 'dish_rated',
    tableText: 'Tisch 4',
    description: '5★ Bewertung für Tagliatelle al Tartufo abgegeben (+0,50 € Rabatt)',
    gaEventName: 'rate_dish_review (5_stars)',
    device: 'iOS Safari',
    category: 'review'
  },
  {
    id: 'evt_5',
    timeAgo: 'Vor 2 Min.',
    type: 'checkout',
    tableText: 'Tisch 4',
    description: 'Bestellung via PayPal bezahlt (102,00 €) • TSE Quittung generiert',
    gaEventName: 'purchase (val: 102.00 EUR)',
    device: 'iOS Safari',
    category: 'conversion'
  },
  {
    id: 'evt_6',
    timeAgo: 'Vor 3 Min.',
    type: 'google_review',
    tableText: 'Tisch 1',
    description: 'Google Maps Rezension mit 5★ generiert & zu Maps weitergeleitet',
    gaEventName: 'google_maps_referral',
    device: 'Android Chrome',
    category: 'review'
  },
  {
    id: 'evt_7',
    timeAgo: 'Vor 4 Min.',
    type: 'lang_switch',
    tableText: 'Terrasse 2',
    description: 'Gast hat Menüsprache auf English gewechselt',
    gaEventName: 'language_change (de -> en)',
    device: 'iOS Safari',
    category: 'system'
  }
];

export const GoogleAnalyticsModule: React.FC<GoogleAnalyticsModuleProps> = ({
  restaurant,
  orders,
  ratings,
  onSaveAnalyticsConfig,
}) => {
  const { t } = useLanguage();

  // Settings State
  const [measurementId, setMeasurementId] = useState(restaurant.googleAnalyticsId || 'G-RATE7821PLATE');
  const [gtmId, setGtmId] = useState(restaurant.googleTagManagerId || 'GTM-RYP8942');
  const [isDsgvoMode, setIsDsgvoMode] = useState(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);
  const [saveToast, setSaveToast] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Real-time dynamic visitor count & stream
  const [activeDinersCount, setActiveDinersCount] = useState(14);
  const [eventsFeed, setEventsFeed] = useState<SimulatedEvent[]>(INITIAL_EVENTS);
  const [todayViews, setTodayViews] = useState(842);
  const [todayCartAdds, setTodayCartAdds] = useState(99);

  // Subscribe to live internal events emitted in this session
  useEffect(() => {
    const unsubscribe = subscribeToAnalytics((liveEvt: AnalyticsEvent) => {
      const newSimulated: SimulatedEvent = {
        id: liveEvt.id,
        timeAgo: 'Gerade eben',
        type: liveEvt.eventName === 'purchase'
          ? 'checkout'
          : liveEvt.eventName === 'rate_dish_review'
          ? 'dish_rated'
          : liveEvt.eventName === 'add_to_cart'
          ? 'cart_add'
          : liveEvt.eventName === 'google_maps_referral'
          ? 'google_review'
          : liveEvt.eventName === 'language_change'
          ? 'lang_switch'
          : 'dish_view',
        tableText: liveEvt.tableNumber ? `Tisch ${liveEvt.tableNumber}` : 'Online',
        description: liveEvt.label,
        gaEventName: liveEvt.eventName,
        device: liveEvt.device,
        category: liveEvt.category
      };

      setEventsFeed(prev => [newSimulated, ...prev.slice(0, 19)]);
      setTodayViews(prev => prev + 1);
      if (liveEvt.eventName === 'add_to_cart') {
        setTodayCartAdds(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  // Periodic heartbeat animation to simulate organic live menu traffic
  useEffect(() => {
    if (!isRealtimeActive) return;
    const interval = setInterval(() => {
      // randomly adjust active visitors between 11 and 18
      setActiveDinersCount(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
        return Math.max(8, Math.min(22, prev + delta));
      });
    }, 9000);
    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  const handleSimulateLiveEvent = () => {
    const randomTables = [1, 2, 3, 4, 5, 6, 7, 'Terrasse 1', 'Terrasse 2'];
    const randomTable = randomTables[Math.floor(Math.random() * randomTables.length)];
    const sampleDishes = restaurant.dishes;
    const randomDish = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];

    const possibleActions: SimulatedEvent[] = [
      {
        id: 'sim_' + Date.now(),
        timeAgo: 'Gerade eben',
        type: 'dish_view',
        tableText: `Tisch ${randomTable}`,
        description: `${randomDish.name} im Detail aufgerufen`,
        gaEventName: `view_item (${randomDish.id})`,
        device: Math.random() > 0.4 ? 'iOS Safari' : 'Android Chrome',
        category: 'menu'
      },
      {
        id: 'sim_' + Date.now(),
        timeAgo: 'Gerade eben',
        type: 'cart_add',
        tableText: `Tisch ${randomTable}`,
        description: `1x ${randomDish.name} (${randomDish.price.toFixed(2)} €) in den Warenkorb gelegt`,
        gaEventName: `add_to_cart (${randomDish.id})`,
        device: 'iOS Safari',
        category: 'cart'
      },
      {
        id: 'sim_' + Date.now(),
        timeAgo: 'Gerade eben',
        type: 'dish_rated',
        tableText: `Tisch ${randomTable}`,
        description: `5★ Bewertung für ${randomDish.name} abgegeben (+0,50 € Rabatt aktiv)`,
        gaEventName: `rate_dish_review (${randomDish.id})`,
        device: 'Android Chrome',
        category: 'review'
      },
      {
        id: 'sim_' + Date.now(),
        timeAgo: 'Gerade eben',
        type: 'qr_scan',
        tableText: `Tisch ${randomTable}`,
        description: `Neuer QR-Tischscan registriert via Smartphone`,
        gaEventName: 'page_view (qr_table_scan)',
        device: 'iOS Safari',
        category: 'navigation'
      }
    ];

    const chosen = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    setEventsFeed(prev => [chosen, ...prev.slice(0, 19)]);
    setTodayViews(prev => prev + 1);
    emitAnalyticsEvent(chosen.gaEventName, chosen.category as any, chosen.description, {}, randomTable);
  };

  const handleSaveSettings = () => {
    if (onSaveAnalyticsConfig) {
      onSaveAnalyticsConfig(measurementId, gtmId, isDsgvoMode);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const trackingCodeSnippet = `<!-- Google tag (gtag.js) - RateYourPlate Menu -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${measurementId}', {
    'anonymize_ip': ${isDsgvoMode ? 'true' : 'false'},
    'cookie_flags': 'SameSite=None;Secure',
    'app_name': 'RateYourPlate',
    'restaurant_name': '${restaurant.name}'
  });
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Zeit,Event_Typ,Tisch,Beschreibung,GA4_Event,Geraet\n"
      + eventsFeed.map(e => `"${e.timeAgo}","${e.type}","${e.tableText}","${e.description}","${e.gaEventName}","${e.device}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RateYourPlate_GA4_Live_Report_${restaurant.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = eventsFeed.filter(e => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'views') return e.type === 'dish_view' || e.type === 'qr_scan';
    if (eventFilter === 'cart') return e.type === 'cart_add' || e.type === 'checkout';
    if (eventFilter === 'reviews') return e.type === 'dish_rated' || e.type === 'google_review';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Google Analytics & Live Telemetry Status */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-amber-400 text-stone-950 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Google Analytics 4</span>
              </span>

              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Live-Traffic Aktiv</span>
              </span>

              <span className="text-stone-400 text-xs font-mono bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700">
                ID: {measurementId}
              </span>

              {isDsgvoMode && (
                <span className="text-[11px] bg-sky-950/80 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  <span>DSGVO Konform (Cookieless)</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold font-serif-display text-stone-100">
              Echtzeit-Speisekarten-Monitor & Besucheraktivitäten
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Verfolgen Sie jeden QR-Code-Scan, Gerichtaufrufe, Warenkorb-Interaktionen,
              Bewertungen und Bezahlvorgänge sekundengenau in Echtzeit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSimulateLiveEvent}
              className="px-3.5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              title="Neues Besucher-Event in den Live-Stream einspeisen"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Gast-Aktivität simulieren</span>
            </button>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="px-3 py-2 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              <span>GA4 Setup & Script</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Daten als CSV herunterladen"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>CSV Export</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicator Bar */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-serif-display text-white tabular-nums">
                  {activeDinersCount}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </div>
              <span className="text-[11px] text-stone-400 block leading-tight">
                Aktive Gäste jetzt online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-serif-display text-white tabular-nums">
                {todayViews}
              </span>
              <span className="text-[11px] text-stone-400 block leading-tight">
                Seitenbesuche heute (+18%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-serif-display text-white tabular-nums">
                {todayCartAdds}
              </span>
              <span className="text-[11px] text-stone-400 block leading-tight">
                Warenkorb-Klicks heute
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-serif-display text-white tabular-nums">
                {ratings.length}
              </span>
              <span className="text-[11px] text-stone-400 block leading-tight">
                Gericht-Bewertungen heute
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GA4 Setup & HTML Integration Drawer (Togglable) */}
      {showConfigDrawer && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-800" />
              <h3 className="font-bold text-stone-900 font-serif-display text-lg">
                Google Analytics 4 Konfiguration & Tracking-Code
              </h3>
            </div>
            <button
              onClick={() => setShowConfigDrawer(false)}
              className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Schließen ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Analytics Mess-ID (GA4 Measurement ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value.trim().toUpperCase())}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-sans">
                    Format: G-XXXXXXXXXX
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Finden Sie in Ihrem Google Analytics Konto unter Verwaltung → Datenstreams → Web-Stream.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Tag Manager Container-ID (Optional)
                </label>
                <input
                  type="text"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value.trim().toUpperCase())}
                  placeholder="GTM-XXXXXXX"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDsgvoMode}
                    onChange={(e) => setIsDsgvoMode(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">
                      DSGVO / GDPR Cookieless Mode aktivieren
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Anonymisiert IP-Adressen und sendet keine personenbezogenen Daten an Google.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRealtimeActive}
                    onChange={(e) => setIsRealtimeActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">
                      Echtzeit-Telemetrie & WebSocket-Events streamen
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Hält die Aktivitätsanzeige sekundengenau synchron.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Einstellungen speichern</span>
                </button>

                {saveToast && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Erfolgreich gespeichert!</span>
                  </span>
                )}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <span>Tracking-Code für Website & Menü (gtag.js)</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Code kopieren</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-3.5 bg-stone-900 text-amber-200/90 text-[11px] font-mono rounded-xl overflow-x-auto border border-stone-800 leading-relaxed max-h-56">
                  {trackingCodeSnippet}
                </pre>
              </div>
              <p className="text-[11px] text-stone-500">
                Dieser Code ist in Ihrer digitalen RateYourPlate Speisekarte bereits automatisch aktiv und sendet alle E-Commerce & Menü-Events direkt an Ihr GA4-Dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Real-Time Stream (Left) + Funnel & Top Dishes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="font-bold text-stone-900 font-serif-display text-base sm:text-lg">
                  Echtzeit-Aktivitäten Stream
                </h3>
                <span className="text-[11px] text-stone-500">
                  Live-Events von QR-Tischen und mobilen Gästen
                </span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setEventFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  eventFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Alle ({eventsFeed.length})
              </button>
              <button
                onClick={() => setEventFilter('views')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  eventFilter === 'views' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Aufrufe
              </button>
              <button
                onClick={() => setEventFilter('cart')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  eventFilter === 'cart' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Warenkorb & Kauf
              </button>
              <button
                onClick={() => setEventFilter('reviews')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  eventFilter === 'reviews' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bewertungen
              </button>
            </div>
          </div>

          {/* Event Stream List */}
          <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto pr-1 space-y-1">
            {filteredEvents.map((evt) => {
              const getBadgeColor = () => {
                switch (evt.type) {
                  case 'dish_view':
                    return 'bg-blue-50 text-blue-800 border-blue-200';
                  case 'cart_add':
                    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  case 'dish_rated':
                    return 'bg-amber-50 text-amber-900 border-amber-200';
                  case 'checkout':
                    return 'bg-purple-50 text-purple-900 border-purple-200';
                  case 'google_review':
                    return 'bg-rose-50 text-rose-900 border-rose-200';
                  case 'qr_scan':
                    return 'bg-stone-100 text-stone-800 border-stone-200';
                  default:
                    return 'bg-stone-50 text-stone-700 border-stone-200';
                }
              };

              const getIcon = () => {
                switch (evt.type) {
                  case 'dish_view':
                    return <Eye className="w-3.5 h-3.5 text-blue-600" />;
                  case 'cart_add':
                    return <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />;
                  case 'dish_rated':
                    return <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />;
                  case 'checkout':
                    return <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />;
                  case 'google_review':
                    return <Globe className="w-3.5 h-3.5 text-rose-600" />;
                  case 'qr_scan':
                    return <QrCode className="w-3.5 h-3.5 text-stone-700" />;
                  default:
                    return <Activity className="w-3.5 h-3.5 text-stone-500" />;
                }
              };

              return (
                <div
                  key={evt.id}
                  className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-stone-50/80 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.2 rounded-full border ${getBadgeColor()}`}>
                          {evt.tableText}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {evt.device}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-stone-900 mt-1">
                        {evt.description}
                      </p>
                      <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                        GA4 Event: <span className="text-amber-800">{evt.gaEventName}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400 whitespace-nowrap shrink-0 font-medium">
                    {evt.timeAgo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Funnel & Conversion Rates */}
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 font-serif-display text-base">
                Echtzeit-Konversions-Trichter
              </h3>
              <p className="text-[11px] text-stone-500">
                Vom QR-Code-Scan zur Gericht- & Google-Bewertung
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>1. QR-Scan / Besuch</span>
                  <span className="font-mono text-stone-500">215 Gäste (100%)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>2. Gericht im Detail betrachtet</span>
                  <span className="font-mono text-stone-500">159 Gäste (74%)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[74%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>3. In den Warenkorb gelegt</span>
                  <span className="font-mono text-stone-500">99 Gäste (46%)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full w-[46%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>4. Bestellung bezahlt</span>
                  <span className="font-mono text-stone-500">82 Bestellungen (38%)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-[38%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>5. Gericht-Bewertung abgegeben</span>
                  <span className="font-mono text-stone-500">56 Bewertungen (68% der Besteller)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full w-[26%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>6. Zu Google Maps weitergeleitet</span>
                  <span className="font-mono text-stone-500">30 Rezensionen (36%)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[14%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources & Devices */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs space-y-4">
            <h4 className="font-bold text-stone-900 font-serif-display text-sm">
              Traffic-Quellen & Gast-Geräte
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 border-r border-stone-100 pr-3">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Quellen
                </span>
                <div className="flex justify-between">
                  <span className="text-stone-700">QR-Tischaufsteller</span>
                  <span className="font-bold text-stone-900">76%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Google Maps Link</span>
                  <span className="font-bold text-stone-900">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Instagram / Social</span>
                  <span className="font-bold text-stone-900">6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Direktaufruf</span>
                  <span className="font-bold text-stone-900">3%</span>
                </div>
              </div>

              <div className="space-y-2 pl-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Geräte & OS
                </span>
                <div className="flex justify-between">
                  <span className="text-stone-700">Apple iPhone (iOS)</span>
                  <span className="font-bold text-stone-900">64%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Android Smartphone</span>
                  <span className="font-bold text-stone-900">31%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Desktop / iPad</span>
                  <span className="font-bold text-stone-900">5%</span>
                </div>
              </div>
            </div>

            {/* International Guest Languages */}
            <div className="pt-3 border-t border-stone-100">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                Sprachen der Gäste heute
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  🇩🇪 Deutsch (62%)
                </span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  🇬🇧 English (18%)
                </span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  🇫🇷 Français (7%)
                </span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  🇮🇹 Italiano (6%)
                </span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  🇪🇸 Español (4%)
                </span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                  Andere (3%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Top Viewed Dishes Ranking Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-bold text-stone-900 font-serif-display text-lg">
              Gerichte-Performance in Echtzeit (Top Views & Interaktionen)
            </h3>
            <span className="text-xs text-stone-500">
              Ermittelt durch Google Analytics E-Commerce Tracking heute
            </span>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Live sortiert nach Aufrufen & Konversion
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200/80">
              <tr>
                <th className="py-2.5 px-3">Rang</th>
                <th className="py-2.5 px-3">Gericht</th>
                <th className="py-2.5 px-3">Kategorie</th>
                <th className="py-2.5 px-3">Preis</th>
                <th className="py-2.5 px-3">Views heute</th>
                <th className="py-2.5 px-3">In den Warenkorb</th>
                <th className="py-2.5 px-3">Konversionsrate</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {restaurant.dishes.slice(0, 6).map((dish, idx) => {
                const simulatedViews = Math.floor(120 - idx * 16 + (dish.ratingCount * 1.5));
                const simulatedCartAdds = Math.floor(simulatedViews * (0.35 + idx * 0.02));
                const convRate = ((simulatedCartAdds / simulatedViews) * 100).toFixed(1);

                return (
                  <tr key={dish.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-900">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 text-sm">
                        {dish.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate max-w-xs">
                        {dish.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-medium">
                      {dish.category}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 font-mono">
                      {dish.price.toFixed(2)} €
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700 font-semibold">
                      {simulatedViews}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                      {simulatedCartAdds}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        {convRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-amber-700 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{dish.ratingAverage.toFixed(1)}</span>
                        <span className="text-stone-400 font-normal">({dish.ratingCount})</span>
                      </div>
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
