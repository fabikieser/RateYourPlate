export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // in EUR (e.g. 18.50)
  category: string;
  available: boolean;
  allergens?: string[];
  chefRecommendation?: boolean;
  prepTimeMinutes?: number;
  ratingAverage: number;
  ratingCount: number;
  imageUrl?: string;
  cuisineCategory?: 'pasta' | 'meat' | 'burger' | 'salad' | 'dessert' | 'drink' | 'starter';
  lieferandoAvailable?: boolean;
  lieferandoPrice?: number;
}

export interface DishRating {
  id: string;
  dishId: string;
  dishName: string;
  restaurantId: string;
  orderId?: string;
  stars: number; // 1 to 5
  comment?: string;
  guestName?: string;
  tableNumber: string | number;
  timestamp: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  guestNotes?: string;
}

export type PaymentMethod = 'paypal' | 'credit_card' | 'apple_pay' | 'klarna';

export type FulfillmentType = 'dine_in' | 'delivery' | 'pickup';

export interface DeliveryDetails {
  street: string;
  postalCode: string;
  city: string;
  deliveryNotes?: string;
  desiredTime?: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  time: string;
  partySize: number;
  tablePreference?: string;
  specialRequests?: string;
  status: 'bestätigt' | 'eingecheckt' | 'storniert';
  createdAt: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  fulfillmentType: FulfillmentType;
  tableNumber?: string | number;
  deliveryDetails?: DeliveryDetails;
  deliveryFee?: number;
  pickupTime?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discountPerDishRating: number; // e.g. 0.50 EUR
  ratedDishes: Record<string, { stars: number; comment?: string }>;
  ratingDiscountTotal: number;
  tipAmount: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'bezahlt' | 'in_bearbeitung' | 'kasse_synchronisiert';
  customerEmail: string;
  timestamp: string;
  receiptNumber: string;
  tseTransactionId: string;
  vat7: number;
  vat19: number;
  kitchenStatus: 'eingegangen' | 'in_zubereitung' | 'fertig' | 'serviert';
  takenByWaiter?: boolean;
  waiterName?: string;
  orderSource?: 'qr_table' | 'website' | 'lieferando' | 'waiter';
  lieferandoOrderId?: string;
}

export interface RestaurantGoogleReview {
  id: string;
  orderId?: string;
  restaurantId: string;
  customerName?: string;
  tableNumber?: string | number;
  overallStars: number; // 1 to 5
  foodStars: number; // derived from dish ratings or selected
  serviceStars: number;
  ambienceStars: number;
  speedStars: number;
  valueStars: number;
  reviewText: string;
  tags?: string[];
  dishesMentioned?: string[];
  copiedToClipboard?: boolean;
  openedGoogleMaps?: boolean;
  timestamp: string;
}

export interface StaffAccount {
  id: string;
  restaurantId: string;
  name: string;
  role: 'waiter' | 'operator';
  pin: string; // e.g. "1234" or password
  email?: string;
  active: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  postalCode: string;
  logoUrl?: string;
  taxNumber: string; // z.B. 14/234/56789
  vatId: string; // DE123456789
  tseSerial: string; // TSE KassenSichV Seriennummer
  posSystemName: string; // z.B. "Vectron / Orderbird / Gastronovi"
  posConnected: boolean;
  currency: string; // '€'
  discountPerRating: number; // default 0.50 €
  welcomeMessage: string;
  tables: (string | number)[];
  categories: string[];
  dishes: Dish[];
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  minOrderDelivery?: number;
  pickupAvailable?: boolean;
  reservationsAvailable?: boolean;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  googleMapsRating?: number;
  googleMapsReviewCount?: number;
  // Google Analytics & Realtime
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  analyticsEnabled?: boolean;
  // Lieferando Integration
  lieferandoConnected?: boolean;
  lieferandoStoreId?: string;
  lieferandoApiKey?: string;
  lieferandoUrl?: string;
  lieferandoSyncStatus?: 'synced' | 'pending' | 'offline';
  lieferandoLastSync?: string;
  lieferandoMarkupPercent?: number;
  lieferandoAutoSync?: boolean;
  lieferandoDeliveryEnabled?: boolean;
  // Staff & Operator Authentication
  operatorPassword?: string;
  defaultWaiterPin?: string;
  staffAccounts?: StaffAccount[];
}
