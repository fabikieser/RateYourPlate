import React, { useState } from 'react';
import { ChefHat, Star, MessageSquare, TrendingUp, DollarSign, CheckCircle, Clock, Plus, Filter, ShieldCheck, Flame, Utensils, RefreshCw, Calendar, Camera, Upload, Trash2, Check, Bike, ShoppingBag, Table, Phone, Mail, User, Sparkles, Printer, MapPin, ExternalLink, QrCode, Award, BarChart3, Activity } from 'lucide-react';
import { Restaurant, DishRating, Order, Dish, Reservation, RestaurantGoogleReview } from '../types/restaurant';
import { GoogleAnalyticsModule } from './GoogleAnalyticsModule';
import { LieferandoModule } from './LieferandoModule';

interface OperatorChefDashboardProps {
  restaurant: Restaurant;
  ratings: DishRating[];
  orders: Order[];
  reservations: Reservation[];
  googleReviews?: RestaurantGoogleReview[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['kitchenStatus']) => void;
  onUpdateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  onAddNewDish: (dish: Dish) => void;
  onToggleDishAvailability: (dishId: string) => void;
  onUpdateDishImage: (dishId: string, imageUrl: string) => void;
  onDeleteDish: (dishId: string) => void;
  onUpdateRestaurantLogo: (logoUrl: string) => void;
  onUpdateGoogleSettings?: (placeId: string, googleMapsUrl?: string) => void;
  onOpenAiScanner: () => void;
  onOpenPrintMenu: () => void;
  activeTab?: 'kitchen' | 'ratings' | 'menu' | 'pos' | 'reservations' | 'google' | 'analytics' | 'lieferando';
  onSimulateLieferandoOrder?: () => void;
  onSyncLieferandoDishes?: (markup: number) => void;
  onSaveAnalyticsConfig?: (measurementId: string, gtmId: string, dsgvoMode: boolean) => void;
}

// Curated high quality food photo presets for operators
const DISH_IMAGE_PRESETS = [
  {
    name: 'Handgemachte Pasta',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    category: 'pasta'
  },
  {
    name: 'Dry-Aged Steak',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    category: 'meat'
  },
  {
    name: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category: 'burger'
  },
  {
    name: 'Burrata & Salat',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
    category: 'starter'
  },
  {
    name: 'Tiramisu & Dessert',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
    category: 'dessert'
  },
  {
    name: 'Schnitzel & Pommes',
    url: 'https://images.unsplash.com/photo-1599921841143-8190253a93bb?auto=format&fit=crop&w=600&q=80',
    category: 'meat'
  },
  {
    name: 'Wein & Drinks',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    category: 'drink'
  }
];

export const OperatorChefDashboard: React.FC<OperatorChefDashboardProps> = ({
  restaurant,
  ratings,
  orders,
  reservations,
  googleReviews = [],
  onUpdateOrderStatus,
  onUpdateReservationStatus,
  onAddNewDish,
  onToggleDishAvailability,
  onUpdateDishImage,
  onDeleteDish,
  onUpdateRestaurantLogo,
  onUpdateGoogleSettings,
  onOpenAiScanner,
  onOpenPrintMenu,
  activeTab = 'kitchen',
  onSimulateLieferandoOrder,
  onSyncLieferandoDishes,
  onSaveAnalyticsConfig,
}) => {
  const [currentTab, setCurrentTab] = useState<'kitchen' | 'ratings' | 'menu' | 'pos' | 'reservations' | 'google' | 'analytics' | 'lieferando'>(activeTab);
  const [selectedDishFilter, setSelectedDishFilter] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [menuRatingFilter, setMenuRatingFilter] = useState<'all' | 'low' | 'top'>('all');

  // Google Place Settings State
  const [googlePlaceIdInput, setGooglePlaceIdInput] = useState(restaurant.googlePlaceId || 'ChIJywePjNu8sEcRhZ0vQ8xS288');
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState(restaurant.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(restaurant.name + ' ' + restaurant.city)}`);
  const [googleSaveNotice, setGoogleSaveNotice] = useState(false);
  const [googleQrStandPreview, setGoogleQrStandPreview] = useState(false);

  // Dish Image Editor State
  const [selectedDishForImage, setSelectedDishForImage] = useState<Dish | null>(null);
  const [imageInputUrl, setImageInputUrl] = useState('');

  // New Dish Modal / Drawer State
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState(restaurant.categories[0] || 'Hauptgerichte');
  const [newDishPrice, setNewDishPrice] = useState('16.50');
  const [newDishDescription, setNewDishDescription] = useState('');
  const [newDishPrepTime, setNewDishPrepTime] = useState('15');
  const [newDishAllergens, setNewDishAllergens] = useState('');
  const [newDishImageUrl, setNewDishImageUrl] = useState('');

  // Metrics calculation
  const restaurantRatings = ratings.filter(r => r.restaurantId === restaurant.id);
  const totalReviewsCount = restaurantRatings.length;
  const avgRating = totalReviewsCount > 0
    ? (restaurantRatings.reduce((sum, r) => sum + r.stars, 0) / totalReviewsCount).toFixed(2)
    : '5.00';

  const totalDiscountsGranted = totalReviewsCount * restaurant.discountPerRating;
  const totalRevenue = orders
    .filter(o => o.restaurantId === restaurant.id)
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // Dishes with sorted rating averages
  const dishesWithStats = [...restaurant.dishes].sort((a, b) => b.ratingAverage - a.ratingAverage);

  // Filtered ratings for comments view
  const filteredRatings = restaurantRatings.filter(r => {
    const matchDish = selectedDishFilter === 'all' || r.dishId === selectedDishFilter;
    const matchStars = starFilter === 'all' || r.stars === starFilter;
    return matchDish && matchStars;
  });

  // Filter reservations for current restaurant
  const currentReservations = reservations.filter(r => r.restaurantId === restaurant.id);

  // Handle file upload for dish image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'new') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'edit') {
            setImageInputUrl(reader.result);
          } else {
            setNewDishImageUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDishImage = () => {
    if (selectedDishForImage) {
      onUpdateDishImage(selectedDishForImage.id, imageInputUrl);
      setSelectedDishForImage(null);
      setImageInputUrl('');
    }
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const createdDish: Dish = {
      id: 'dish_' + Date.now(),
      restaurantId: restaurant.id,
      name: newDishName,
      category: newDishCategory,
      price: parseFloat(newDishPrice) || 12.00,
      description: newDishDescription || 'Frisch und mit Liebe vom Küchenchef zubereitet.',
      available: true,
      allergens: newDishAllergens ? newDishAllergens.split(',').map(s => s.trim()) : [],
      prepTimeMinutes: parseInt(newDishPrepTime) || 12,
      ratingAverage: 5.0,
      ratingCount: 1,
      imageUrl: newDishImageUrl || undefined,
      cuisineCategory: 'pasta'
    };

    onAddNewDish(createdDish);
    setIsAddDishOpen(false);
    setNewDishName('');
    setNewDishDescription('');
    setNewDishImageUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-amber-800 tracking-wider">
            BETREIBER- & KÜCHEN-PORTAL · {restaurant.city}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900 mt-1">
            {restaurant.name} – Küchenmonitor & Qualitätsmanagement
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Echtzeit-Feedback deiner Gäste, Bilder verwalten, Tischreservierungen & Kassen-Synchronisation.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-xl self-start md:self-center overflow-x-auto">
          <button
            onClick={() => setCurrentTab('kitchen')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'kitchen'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Küchen-Monitor ({orders.filter(o => o.kitchenStatus !== 'serviert').length})
          </button>

          <button
            onClick={() => setCurrentTab('reservations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'reservations'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Reservierungen ({currentReservations.filter(r => r.status === 'bestätigt').length})
          </button>

          <button
            onClick={() => setCurrentTab('ratings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'ratings'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Ratings & Feedback
          </button>

          <button
            onClick={() => setCurrentTab('menu')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'menu'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Speisekarte & Fotos ({restaurant.dishes.length})
          </button>

          <button
            onClick={() => setCurrentTab('pos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'pos'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Kassen-Kopplung
          </button>

          <button
            onClick={() => setCurrentTab('google')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'google'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-amber-900 hover:text-amber-950 bg-amber-50/70 border border-amber-200/80'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Google Maps ({restaurant.googleMapsRating || 4.8}★)</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Google Analytics & Live</span>
          </button>

          <button
            onClick={() => setCurrentTab('lieferando')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'lieferando'
                ? 'bg-[#FF8000] text-white shadow-xs'
                : 'text-orange-900 hover:text-orange-950 bg-orange-50/90 border border-orange-200/90'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-orange-600" />
            <span>Lieferando Connect</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-500 block">Durchschnittsbewertung</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif-display text-stone-900 tabular-nums">
              {avgRating} ★
            </span>
            <span className="text-xs text-stone-500">von 5 Sternen</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            Hohe Gäste-Zufriedenheit
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-500 block">Aktive Tischreservierungen</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif-display text-amber-900 tabular-nums">
              {currentReservations.length}
            </span>
            <span className="text-xs text-stone-500">Buchungen</span>
          </div>
          <span className="text-[11px] text-stone-500 block mt-1">
            Online bestätigt
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-500 block">Gewährte Bewertungs-Rabatte</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif-display text-emerald-800 tabular-nums">
              {totalDiscountsGranted.toFixed(2)} €
            </span>
          </div>
          <span className="text-[11px] text-stone-500 block mt-1">
            0,50 € pro bewertetes Gericht
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-500 block">Digital abgewickelter Umsatz</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif-display text-stone-900 tabular-nums">
              {totalRevenue.toFixed(2)} €
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            Dine-In, Lieferung & Abholung
          </span>
        </div>
      </div>

      {/* TAB 1: KÜCHEN-MONITOR (FÜR DEN KOCH) */}
      {currentTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif-display text-stone-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-700" />
              <span>Live Küchen-Monitor & Bon-Übersicht</span>
            </h2>
            <span className="text-xs text-stone-500">
              Echtzeit-Tickets für Dine-In, Lieferung & Selbstabholung
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
              <p className="text-stone-500 text-sm">Aktuell keine offenen Bestellungen in der Küche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => {
                const isInPrep = order.kitchenStatus === 'in_zubereitung';

                return (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between ${
                      isInPrep ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200'
                    }`}
                  >
                    {/* Bon Header with Fulfillment Mode */}
                    <div className="bg-stone-900 text-white p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-amber-300 font-mono">#{order.receiptNumber}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {order.orderSource === 'lieferando' || order.lieferandoOrderId ? (
                            <span className="font-bold text-xs bg-[#FF8000] text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                              <Bike className="w-3.5 h-3.5" />
                              LIEFERANDO ({order.lieferandoOrderId || 'App'})
                            </span>
                          ) : order.fulfillmentType === 'dine_in' ? (
                            <span className="font-bold text-base flex items-center gap-1">
                              <Table className="w-4 h-4 text-amber-400" />
                              Tisch {order.tableNumber}
                            </span>
                          ) : order.fulfillmentType === 'delivery' ? (
                            <span className="font-bold text-sm text-amber-300 flex items-center gap-1">
                              <Bike className="w-4 h-4" />
                              LIEFERUNG
                            </span>
                          ) : (
                            <span className="font-bold text-sm text-sky-300 flex items-center gap-1">
                              <ShoppingBag className="w-4 h-4" />
                              ABHOLUNG
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-stone-300">{order.timestamp}</span>
                        <div className="text-[11px] text-emerald-400 font-medium">Bezahlt via {order.paymentMethod}</div>
                      </div>
                    </div>

                    {/* Delivery / Pickup address notes on ticket */}
                    {order.deliveryDetails && (
                      <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/80 text-xs text-amber-950">
                        <span className="font-bold block">Lieferadresse:</span>
                        <span>{order.deliveryDetails.street}, {order.deliveryDetails.postalCode} {order.deliveryDetails.city}</span>
                        {order.deliveryDetails.deliveryNotes && (
                          <span className="block text-[11px] text-amber-900/80 italic mt-0.5">
                            Notiz: {order.deliveryDetails.deliveryNotes}
                          </span>
                        )}
                        {order.customerPhone && (
                          <span className="block text-[11px] text-stone-600 mt-0.5">
                            Tel: {order.customerPhone} ({order.customerName || 'Kunde'})
                          </span>
                        )}
                      </div>
                    )}

                    {order.fulfillmentType === 'pickup' && order.pickupTime && (
                      <div className="bg-sky-50 px-3.5 py-2 border-b border-sky-200/80 text-xs text-sky-950">
                        <span className="font-bold">Abholung: </span>
                        <span>{order.pickupTime}</span>
                        {order.customerName && <span className="block text-[11px]">Kunde: {order.customerName}</span>}
                      </div>
                    )}

                    {/* Ordered Dishes List */}
                    <div className="p-4 flex-1">
                      <div className="divide-y divide-stone-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-sm text-stone-900">
                                <span className="tabular-nums font-mono text-amber-800 mr-1.5">
                                  {item.quantity}x
                                </span>
                                {item.dish.name}
                              </div>
                              {item.dish.prepTimeMinutes && (
                                <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  ca. {item.dish.prepTimeMinutes} Min.
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-stone-600 tabular-nums">
                              {(item.dish.price * item.quantity).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Guest ratings submitted with this order */}
                      {Object.keys(order.ratedDishes).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dashed border-stone-200">
                          <span className="text-[11px] font-semibold text-amber-900 block mb-1">
                            Gäste-Bewertung & Küchen-Notiz:
                          </span>
                          {Object.entries(order.ratedDishes).map(([dishId, r]) => (
                            <div key={dishId} className="text-xs bg-amber-50/70 p-2 rounded border border-amber-200/60 mb-1">
                              <div className="flex items-center gap-1 text-amber-700 font-medium">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{r.stars} von 5 Sternen</span>
                              </div>
                              {r.comment && (
                                <p className="text-[11px] text-stone-700 italic mt-0.5">
                                  "{r.comment}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium capitalize text-stone-600">
                        Status: <strong className="text-stone-900">{order.kitchenStatus.replace('_', ' ')}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {order.kitchenStatus === 'eingegangen' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'in_zubereitung')}
                            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                          >
                            Zubereitung starten
                          </button>
                        )}
                        {order.kitchenStatus === 'in_zubereitung' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'fertig')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                          >
                            Fertig ✓
                          </button>
                        )}
                        {order.kitchenStatus === 'fertig' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'serviert')}
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
                          >
                            Serviert ✓ (Bewertung freischalten)
                          </button>
                        )}
                        {order.kitchenStatus === 'serviert' && (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200">
                            ✓ Beim Gast serviert (Bewertung aktiv)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: TISCHRESERVIERUNGEN */}
      {currentTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-serif-display text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-700" />
                <span>Tischreservierungen für {restaurant.name}</span>
              </h2>
              <p className="text-xs text-stone-500">
                Übersicht aller online und telefonisch eingegangenen Buchungen
              </p>
            </div>
          </div>

          {currentReservations.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
              <p className="text-stone-500 text-sm">Aktuell keine Reservierungen vorhanden.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-semibold">
                    <tr>
                      <th className="p-3.5">Gast & Kontakt</th>
                      <th className="p-3.5">Datum & Uhrzeit</th>
                      <th className="p-3.5 text-center">Personen</th>
                      <th className="p-3.5">Bereich / Wünsche</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {currentReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5">
                          <div>
                            <span className="font-semibold text-stone-900 block">{res.guestName}</span>
                            <div className="flex items-center gap-2 text-stone-500 text-[11px] mt-0.5">
                              <span>{res.guestPhone}</span>
                              <span aria-hidden="true">·</span>
                              <span>{res.guestEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-stone-900 block">{res.date}</span>
                          <span className="text-stone-500 font-mono text-[11px]">{res.time} Uhr</span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-stone-900 tabular-nums">
                          {res.partySize} Pers.
                        </td>
                        <td className="p-3.5 text-stone-600">
                          <span className="font-medium block text-stone-800">{res.tablePreference || 'Innenbereich'}</span>
                          {res.specialRequests && (
                            <span className="text-[11px] italic text-stone-500 line-clamp-1">"{res.specialRequests}"</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              res.status === 'bestätigt'
                                ? 'bg-amber-100 text-amber-900'
                                : res.status === 'eingecheckt'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.status === 'bestätigt' && (
                              <button
                                type="button"
                                onClick={() => onUpdateReservationStatus(res.id, 'eingecheckt')}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium cursor-pointer"
                              >
                                Eingecheckt ✓
                              </button>
                            )}
                            {res.status !== 'storniert' && (
                              <button
                                type="button"
                                onClick={() => onUpdateReservationStatus(res.id, 'storniert')}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[11px] cursor-pointer"
                              >
                                Stornieren
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GERICHTE-RATINGS & GÄSTE-FEEDBACK */}
      {currentTab === 'ratings' && (
        <div className="space-y-8">
          {/* Top Rankings Table */}
          <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold font-serif-display text-stone-900">
                  Qualitäts-Ranking aller Gerichte
                </h2>
                <p className="text-xs text-stone-500">
                  Übersicht der beliebtesten und am besten bewerteten Speisen für Koch und Küchenleitung
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Rang & Gericht</th>
                    <th className="p-3.5">Kategorie</th>
                    <th className="p-3.5 text-center">Bewertung</th>
                    <th className="p-3.5 text-center">Anzahl Feedback</th>
                    <th className="p-3.5 text-right">Preis</th>
                    <th className="p-3.5 text-right">Vergebene Rabatte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {dishesWithStats.map((dish, index) => {
                    const dishReviews = restaurantRatings.filter(r => r.dishId === dish.id);
                    const discountsForDish = dishReviews.length * restaurant.discountPerRating;

                    return (
                      <tr key={dish.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-stone-400 font-semibold w-4">
                              #{index + 1}
                            </span>
                            <div>
                              <span className="font-semibold text-stone-900 block">{dish.name}</span>
                              {dish.chefRecommendation && (
                                <span className="text-[10px] text-amber-700 font-medium">
                                  Küchenchef-Empfehlung
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-stone-600">{dish.category}</td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-stone-900">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="tabular-nums">{dish.ratingAverage.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center tabular-nums text-stone-600">
                          {dish.ratingCount} Bewertungen
                        </td>
                        <td className="p-3.5 text-right font-medium text-stone-900 tabular-nums">
                          {dish.price.toFixed(2)} €
                        </td>
                        <td className="p-3.5 text-right text-emerald-800 font-medium tabular-nums">
                          -{discountsForDish.toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Comments Feed */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif-display text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>Detailliertes Gäste-Feedback & Kommentare</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Echte Kommentare der Restaurantbesucher für jedes einzelne Gericht
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedDishFilter}
                  onChange={(e) => setSelectedDishFilter(e.target.value)}
                  className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="all">Alle Gerichte</option>
                  {restaurant.dishes.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <select
                  value={starFilter}
                  onChange={(e) => setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="all">Alle Sterne</option>
                  <option value="5">Nur 5 Sterne ★</option>
                  <option value="4">Nur 4 Sterne ★</option>
                  <option value="3">3 Sterne oder weniger</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRatings.map((rating) => (
                <div
                  key={rating.id}
                  className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900">
                        {rating.dishName}
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {rating.guestName || 'Gast'} · Tisch {rating.tableNumber} · {rating.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rating.stars ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rating.comment ? (
                    <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-100 italic leading-relaxed">
                      "{rating.comment}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">
                      (Ohne Textkommentar bewertet - 0,50 € Rabatt verrechnet)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPEISEKARTEN-VERWALTUNG & BILDER EINSTELLEN */}
      {currentTab === 'menu' && (
        <div className="space-y-6">
          {/* Top Bar with Logo Management and Quick Actions */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Restaurant Logo Settings */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-stone-300 bg-stone-100 shrink-0 flex items-center justify-center">
                {restaurant.logoUrl ? (
                  <img
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif-display font-bold text-2xl text-stone-700">
                    {restaurant.name.charAt(0)}
                  </span>
                )}
                <label
                  htmlFor="restaurant-logo-upload"
                  className="absolute inset-0 bg-stone-900/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                  title="Logo ändern"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  type="file"
                  id="restaurant-logo-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          onUpdateRestaurantLogo(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span>Restaurant-Logo</span>
                  {restaurant.logoUrl && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Hinterlegt
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Wird auf der Speisekarte, im Tischaufsteller, Quittungen und PDF-Druck angezeigt.
                </p>
                <label
                  htmlFor="restaurant-logo-upload"
                  className="text-xs text-amber-800 font-semibold hover:underline cursor-pointer mt-1 inline-block"
                >
                  Logo hochladen (PNG / JPG)
                </label>
              </div>
            </div>

            {/* Quick Actions: AI Scanner & Print Export */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenAiScanner}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>KI-Speisekarten Scanner</span>
              </button>

              <button
                type="button"
                onClick={onOpenPrintMenu}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>PDF Druck-Export (A4/A5)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddDishOpen(true)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-stone-700" />
                <span>Gericht hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Header & Quality Filter for Dishes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-serif-display text-stone-900">
                Speisekarte ({restaurant.dishes.length} Gerichte)
              </h2>
              <p className="text-xs text-stone-500">
                Gering bewertete Speisen einfach herausnehmen, Bestseller fördern oder Bilder austauschen
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMenuRatingFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  menuRatingFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Alle ({restaurant.dishes.length})
              </button>

              <button
                type="button"
                onClick={() => setMenuRatingFilter('low')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  menuRatingFilter === 'low'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>⚠️ Prüfen / Wenig Sterne (&lt; 4.7★)</span>
              </button>

              <button
                type="button"
                onClick={() => setMenuRatingFilter('top')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  menuRatingFilter === 'top'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🌟 Bestseller (≥ 4.8★)</span>
              </button>
            </div>
          </div>

          {/* Dishes Table with Photo Thumbnails, Image Edit & Delete */}
          <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="divide-y divide-stone-100">
              {restaurant.dishes
                .filter(d => {
                  if (menuRatingFilter === 'low') return d.ratingAverage < 4.7;
                  if (menuRatingFilter === 'top') return d.ratingAverage >= 4.8;
                  return true;
                })
                .map((dish) => {
                  const isLowRated = dish.ratingAverage < 4.7;

                  return (
                    <div key={dish.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/40 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Dish Photo Thumbnail with hover change trigger */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 group">
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl bg-stone-100 text-stone-400">
                              🍽️
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDishForImage(dish);
                              setImageInputUrl(dish.imageUrl || '');
                            }}
                            className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                            title="Bild ändern"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-stone-900">{dish.name}</h3>
                            <span className="text-xs text-stone-400 font-mono">({dish.category})</span>
                            {isLowRated && (
                              <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                                Weniger gefragt
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">{dish.description}</p>
                          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                            <span>Preis: <strong className="text-stone-900">{dish.price.toFixed(2)} €</strong></span>
                            <span>Rating: <strong className="text-amber-700">{dish.ratingAverage.toFixed(1)} ★</strong> ({dish.ratingCount})</span>
                            {dish.allergens && dish.allergens.length > 0 && (
                              <span>Allergene: {dish.allergens.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDishForImage(dish);
                            setImageInputUrl(dish.imageUrl || '');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          title="Foto austauschen"
                        >
                          <Camera className="w-3.5 h-3.5 text-stone-600" />
                          <span>Bild</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleDishAvailability(dish.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                            dish.available
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {dish.available ? 'Aktiv' : 'Pausiert'}
                        </button>

                        {/* Remove / Delete dish button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Möchten Sie „${dish.name}“ wirklich aus der Speisekarte entfernen?`)) {
                              onDeleteDish(dish.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Gericht aus der Speisekarte entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Image Editor Modal for Existing Dish */}
          {selectedDishForImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-800">BILD EINSTELLEN</span>
                    <h3 className="text-base font-bold font-serif-display text-stone-900">
                      Foto für „{selectedDishForImage.name}“
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedDishForImage(null)}
                    className="text-stone-400 hover:text-stone-800 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Preview */}
                <div className="h-44 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center">
                  {imageInputUrl ? (
                    <img
                      src={imageInputUrl}
                      alt="Vorschau"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-stone-400 text-xs">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>Noch kein Bild hinterlegt</span>
                    </div>
                  )}
                </div>

                {/* Upload or URL input */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Eigenes Foto von Festplatte/Smartphone hochladen:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'edit')}
                      className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Oder Bild-Webadresse (URL) eingeben:
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageInputUrl}
                      onChange={(e) => setImageInputUrl(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* Curated Presets */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1.5">
                      Oder Foto-Vorlage wählen:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {DISH_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setImageInputUrl(preset.url)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-700 text-left transition-colors cursor-pointer group"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-12 object-cover rounded mb-1"
                          />
                          <span className="text-[10px] text-stone-700 block truncate font-medium">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setImageInputUrl('');
                      onUpdateDishImage(selectedDishForImage.id, '');
                      setSelectedDishForImage(null);
                    }}
                    className="px-3 py-1.5 text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                  >
                    Bild löschen
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDishForImage(null)}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-xs cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDishImage}
                      className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Bild speichern
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Dish Modal */}
          {isAddDishOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl my-6">
                <h3 className="text-base font-bold font-serif-display text-stone-900 mb-1">
                  Neues Gericht zur Speisekarte hinzufügen
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Erscheint sofort in der Speisekarte und kann via QR-Code bestellt werden.
                </p>

                <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Name des Gerichts</label>
                    <input
                      type="text"
                      required
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      placeholder="z.B. Tagliolini al Tartufo"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Kategorie</label>
                      <select
                        value={newDishCategory}
                        onChange={(e) => setNewDishCategory(e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      >
                        {restaurant.categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Preis (€)</label>
                      <input
                        type="number"
                        step="0.10"
                        required
                        value={newDishPrice}
                        onChange={(e) => setNewDishPrice(e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Beschreibung & Zutaten</label>
                    <textarea
                      rows={2}
                      value={newDishDescription}
                      onChange={(e) => setNewDishDescription(e.target.value)}
                      placeholder="Hausgemachte Nudeln, Butter, schwarzer Trüffel..."
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* Photo for new dish */}
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Gerichtsfoto (Upload oder URL)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'new')}
                      className="w-full text-xs text-stone-500 mb-1.5"
                    />
                    <input
                      type="url"
                      placeholder="Oder Bild-URL einfügen..."
                      value={newDishImageUrl}
                      onChange={(e) => setNewDishImageUrl(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Zubereitungszeit (Min)</label>
                      <input
                        type="number"
                        value={newDishPrepTime}
                        onChange={(e) => setNewDishPrepTime(e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Allergene</label>
                      <input
                        type="text"
                        value={newDishAllergens}
                        onChange={(e) => setNewDishAllergens(e.target.value)}
                        placeholder="Gluten, Laktose"
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddDishOpen(false)}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Gericht speichern
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: KASSEN-KOPPLUNG & TSE */}
      {currentTab === 'pos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  POS
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif-display text-stone-900">
                    Kassensystem-Kopplung (KassenSichV & TSE)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Automatische Bon-Übermittlung ohne separates Kellner-Terminal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aktiv & Verbunden</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block">Kassensystem-Anbieter:</span>
                <span className="font-semibold text-stone-900 text-sm">{restaurant.posSystemName}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block">TSE-Seriennummer (BSI-zertifiziert):</span>
                <span className="font-mono text-stone-900 text-xs">{restaurant.tseSerial}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block">Steuernummer & Finanzamt:</span>
                <span className="font-semibold text-stone-900">{restaurant.taxNumber} (USt-ID: {restaurant.vatId})</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block">Digitale Quittungs-Zustellung:</span>
                <span className="font-semibold text-emerald-800">E-Mail Gateway SMTP aktiv</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-lg border border-amber-200/60">
              💡 <strong>Vorteil für den Gastronomen:</strong> Gäste bezahlen direkt via PayPal, Kreditkarte oder Apple Pay in der digitalen Speisekarte. Der Betrag wird automatisch mit dem internen Kassenbuch verbucht und ein TSE-Datensatz signiert. Der Kellner muss kein mobiles Kartenterminal mehr zum Tisch tragen!
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE MAPS REPUTATION & BEWERTUNGEN */}
      {currentTab === 'google' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 text-white p-6 rounded-2xl border border-stone-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full">
                      Google Maps Integration
                    </span>
                    <span className="text-xs text-stone-300">
                      RateYourPlate Reputation Booster
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-serif-display text-white mt-1">
                    Google Maps Bewertungen & 5-Sterne Sichtbarkeit
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                    Zufriedene Gäste wandeln ihre Speisen-Bewertungen direkt bei der Bezahlung in offizielle Google Maps Rezensionen um.
                  </p>
                </div>
              </div>

              {/* Direct Link to Google Maps */}
              <div className="flex items-center gap-2">
                <a
                  href={restaurant.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(restaurant.name + ' ' + restaurant.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Google Profil öffnen</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Google Gesamt-Score</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-amber-400">
                  <span className="text-2xl font-bold font-mono text-white">
                    {restaurant.googleMapsRating || 4.8}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Gesamte Rezensionen</span>
                <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                  {restaurant.googleMapsReviewCount || 428}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Konvertierungsrate nach Zahlung</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                  84%
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Einfluss der Speisen-Noten</span>
                <span className="text-2xl font-bold font-mono text-amber-300 mt-0.5 block">
                  100%
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Category Performance (Speisen, Service, Ambiente, etc.) */}
          <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs">
            <h3 className="text-sm font-bold font-serif-display text-stone-900 mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Kategorie-Noten der Gäste (Einfluss auf Google Maps)</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Die Note für 'Speisen & Kulinarik' wird direkt aus den Feedback-Noten der einzelnen verzehrten Gerichte aggregiert.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Speisen */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-amber-900 font-bold block mb-1">
                  1. Speisen & Kulinarik
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 font-mono">4.9</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                  Aus {restaurantRatings.length} Gerichte-Ratings
                </span>
              </div>

              {/* 2. Service */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-700 font-bold block mb-1">
                  2. Service & Freundlichkeit
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 font-mono">4.8</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  Gäste loben Aufmerksamkeiten
                </span>
              </div>

              {/* 3. Ambiente */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-700 font-bold block mb-1">
                  3. Ambiente & Flair
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 font-mono">4.9</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  Terrasse & Beleuchtung top
                </span>
              </div>

              {/* 4. Schnelligkeit */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-700 font-bold block mb-1">
                  4. Wartezeit & Schnelligkeit
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 font-mono">4.7</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  Ø 14 Min. Zubereitungszeit
                </span>
              </div>

              {/* 5. Preis-Leistung */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-700 font-bold block mb-1">
                  5. Preis-Leistungs-Verhältnis
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 font-mono">4.6</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  Fair dank 0,50 € Rabatte
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Form & Google Place ID */}
          <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs">
            <h3 className="text-sm font-bold font-serif-display text-stone-900 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Google Unternehmensprofil Verknüpfung konfigurieren</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Hinterlege hier die offizielle Google Place ID oder deinen direkten Bewertungs-Link, damit Gäste mit einem Klick das Google Bewertungsformular öffnen können.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Google Place ID:
                </label>
                <input
                  type="text"
                  value={googlePlaceIdInput}
                  onChange={(e) => setGooglePlaceIdInput(e.target.value)}
                  placeholder="z.B. ChIJywePjNu8sEcRhZ0vQ8xS288"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Findbar im Google Place ID Finder oder Google Unternehmensprofil
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Google Maps URL / Rezensions-Direktlink:
                </label>
                <input
                  type="text"
                  value={googleMapsUrlInput}
                  onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Wird beim 1-Klick Review nach der Zahlung geöffnet
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateGoogleSettings?.(googlePlaceIdInput, googleMapsUrlInput);
                    setGoogleSaveNotice(true);
                    setTimeout(() => setGoogleSaveNotice(false), 3000);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Einstellungen speichern</span>
                </button>

                {googleSaveNotice && (
                  <span className="text-xs text-emerald-700 font-semibold animate-fadeIn">
                    ✓ Gespeichert! Verknüpfung ist sofort aktiv.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setGoogleQrStandPreview(!googleQrStandPreview)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-800" />
                <span>{googleQrStandPreview ? 'Aufsteller schließen' : 'Tisch-Aufsteller QR-Code anzeigen'}</span>
              </button>
            </div>

            {/* Table Stand QR Code Preview */}
            {googleQrStandPreview && (
              <div className="mt-4 p-5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-6 animate-fadeIn">
                <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-md shrink-0 text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(googleMapsUrlInput)}`}
                    alt="Google Maps Stand QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                  <span className="text-[10px] font-bold text-stone-700 block mt-2">
                    5★ Google Maps
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-stone-900">
                    Druckfertiger Tisch-Aufsteller für Ihr Restaurant
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Stellen Sie diesen QR-Code auf die Tische oder an den Tresen. Gäste können direkt mit ihrem Smartphone scannen, werden zu Google Maps weitergeleitet und geben ihre 5-Sterne Bewertung ab.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-stone-800"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Aufsteller drucken</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List of Incoming Google Reviews */}
          <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-serif-display text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>Über RateYourPlate eingereichte Google Maps Rezensionen</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Hier siehst du den genauen Wortlaut und die verknüpften Speisen, die Gäste nach dem Bezahlvorgang zu Google Maps exportiert haben.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                {(googleReviews || []).length} Rezensionen
              </span>
            </div>

            <div className="space-y-3">
              {(googleReviews && googleReviews.length > 0) ? (
                googleReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/90 hover:border-amber-400/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">
                          {rev.customerName || 'Gast'}
                        </span>
                        {rev.tableNumber && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium">
                            Tisch {rev.tableNumber}
                          </span>
                        )}
                        <span className="text-[11px] text-stone-400">· {rev.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.overallStars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-stone-800">
                          {rev.overallStars}.0★
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                          ✓ Bei Google eingereicht
                        </span>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-sans italic">
                      "{rev.reviewText}"
                    </p>

                    {/* Mentioned dishes & Sub-scores */}
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      {rev.dishesMentioned && rev.dishesMentioned.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 font-semibold">Verzehrte Speisen:</span>
                          {rev.dishesMentioned.map((dishName, i) => (
                            <span key={i} className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-medium text-[10px]">
                              🍽️ {dishName}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-stone-500 text-[10px]">
                        <span>Speisen: {rev.foodStars}★</span>
                        <span>Service: {rev.serviceStars}★</span>
                        <span>Ambiente: {rev.ambienceStars}★</span>
                        <span>Tempo: {rev.speedStars}★</span>
                        <span>Preise: {rev.valueStars}★</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
                  Noch keine Google Maps Rezensionen erfasst. Nach dem nächsten Bezahlvorgang erscheint die erste Rezension hier!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: GOOGLE ANALYTICS & ECHTZEIT-TRAFFIC */}
      {currentTab === 'analytics' && (
        <GoogleAnalyticsModule
          restaurant={restaurant}
          orders={orders}
          ratings={ratings}
          onSaveAnalyticsConfig={onSaveAnalyticsConfig}
        />
      )}

      {/* TAB 8: LIEFERANDO INTEGRATION */}
      {currentTab === 'lieferando' && (
        <LieferandoModule
          restaurant={restaurant}
          onSyncAllDishes={onSyncLieferandoDishes}
          onSimulateLieferandoOrder={onSimulateLieferandoOrder}
        />
      )}
    </div>
  );
};
