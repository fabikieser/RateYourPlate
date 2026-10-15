// Google Analytics 4 (GA4) & RateYourPlate Real-Time Telemetry Utility

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  timestamp: string;
  timeAgo: string;
  category: 'navigation' | 'menu' | 'cart' | 'review' | 'conversion' | 'system';
  tableNumber?: string | number;
  label: string;
  params: Record<string, any>;
  device: string;
  source: string;
}

// Window declaration for dataLayer & gtag
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Event listeners for internal real-time reactive feed
type AnalyticsListener = (event: AnalyticsEvent) => void;
const listeners: Set<AnalyticsListener> = new Set();

export const subscribeToAnalytics = (listener: AnalyticsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Initialize gtag stub safely in browser
export const initGoogleAnalytics = (measurementId: string = 'G-RATE7821PLATE') => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    app_name: 'RateYourPlate',
  });
};

// Internal emitter
export const emitAnalyticsEvent = (
  eventName: string,
  category: AnalyticsEvent['category'],
  label: string,
  params: Record<string, any> = {},
  tableNumber?: string | number
): AnalyticsEvent => {
  const event: AnalyticsEvent = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    eventName,
    category,
    label,
    timestamp: new Date().toISOString(),
    timeAgo: 'Gerade eben',
    tableNumber: tableNumber || params.tableNumber || 4,
    params,
    device: /iPhone|iPad/i.test(navigator.userAgent) ? 'iOS Safari' : /Android/i.test(navigator.userAgent) ? 'Android Chrome' : 'Desktop Browser',
    source: tableNumber ? `QR-Tisch ${tableNumber}` : 'Online Speisekarte'
  };

  // Push to dataLayer for Google Analytics / Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      event_category: category,
      event_label: label,
      table_number: event.tableNumber,
      ...params
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: category,
        event_label: label,
        ...params
      });
    }
  }

  // Notify active listeners
  listeners.forEach(fn => fn(event));

  return event;
};

// Specific typed event triggers for easy integration
export const trackPageView = (path: string, pageTitle: string, table?: string | number) => {
  return emitAnalyticsEvent('page_view', 'navigation', `Seitenaufruf: ${pageTitle}`, {
    page_path: path,
    page_title: pageTitle,
    table_number: table
  }, table);
};

export const trackDishView = (dishId: string, dishName: string, category: string, price: number, table?: string | number) => {
  return emitAnalyticsEvent('view_item', 'menu', `Gericht angesehen: ${dishName}`, {
    item_id: dishId,
    item_name: dishName,
    item_category: category,
    price: price,
    currency: 'EUR'
  }, table);
};

export const trackAddToCart = (dishId: string, dishName: string, quantity: number, price: number, table?: string | number) => {
  return emitAnalyticsEvent('add_to_cart', 'cart', `${quantity}x ${dishName} in Warenkorb`, {
    item_id: dishId,
    item_name: dishName,
    quantity,
    value: price * quantity,
    currency: 'EUR'
  }, table);
};

export const trackDishRated = (dishId: string, dishName: string, stars: number, discountAmount: number, table?: string | number) => {
  return emitAnalyticsEvent('rate_dish_review', 'review', `${stars}★ Bewertung für ${dishName} (${discountAmount.toFixed(2)}€ Rabatt)`, {
    item_id: dishId,
    item_name: dishName,
    rating_stars: stars,
    discount_granted: discountAmount,
    currency: 'EUR'
  }, table);
};

export const trackGoogleMapsReviewClick = (restaurantName: string, stars: number, table?: string | number) => {
  return emitAnalyticsEvent('google_maps_referral', 'review', `Google Maps Rezension gestartet (${stars}★ für ${restaurantName})`, {
    restaurant_name: restaurantName,
    overall_stars: stars
  }, table);
};

export const trackCheckoutSuccess = (orderId: string, total: number, paymentMethod: string, itemsCount: number, table?: string | number) => {
  return emitAnalyticsEvent('purchase', 'conversion', `Bestellung abgeschlossen (${total.toFixed(2)}€ via ${paymentMethod})`, {
    transaction_id: orderId,
    value: total,
    payment_type: paymentMethod,
    items_count: itemsCount,
    currency: 'EUR'
  }, table);
};

export const trackLanguageChange = (fromLang: string, toLang: string) => {
  return emitAnalyticsEvent('language_change', 'system', `Sprache gewechselt zu ${toLang.toUpperCase()}`, {
    previous_language: fromLang,
    selected_language: toLang
  });
};
