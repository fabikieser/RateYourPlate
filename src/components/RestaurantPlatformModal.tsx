import React, { useState } from 'react';
import { X, Store, Plus, MapPin, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { RateYourPlateLogo } from './RateYourPlateLogo';

interface RestaurantPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  currentRestaurantId: string;
  onSelectRestaurant: (restaurantId: string) => void;
  onAddRestaurant: (restaurant: Restaurant) => void;
}

export const RestaurantPlatformModal: React.FC<RestaurantPlatformModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  currentRestaurantId,
  onSelectRestaurant,
  onAddRestaurant,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'new'>('switch');

  // Form states for adding a new restaurant
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [posSystemName, setPosSystemName] = useState('Orderbird POS & TSE Cloud');
  const [discountPerRating, setDiscountPerRating] = useState('0.50');
  const [welcomeMessage, setWelcomeMessage] = useState('Herzlich Willkommen! Bei uns bestellen & bewerten für 0,50 € Rabatt.');

  if (!isOpen) return null;

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;

    const newId = 'rest_' + Date.now();
    const created: Restaurant = {
      id: newId,
      name: name.trim(),
      city: city.trim(),
      address: address.trim() || 'Hauptstraße 1',
      postalCode: postalCode.trim() || '10115 ' + city.trim(),
      phone: '+49 (0)30 123456',
      taxNumber: '21/890/' + Math.floor(10000 + Math.random() * 90000),
      vatId: 'DE ' + Math.floor(100000000 + Math.random() * 900000000),
      tseSerial: 'TSE-' + city.toUpperCase().slice(0, 3) + '-' + Math.floor(100000 + Math.random() * 900000),
      posSystemName: posSystemName,
      posConnected: true,
      currency: '€',
      discountPerRating: parseFloat(discountPerRating) || 0.50,
      welcomeMessage: welcomeMessage,
      tables: [1, 2, 3, 4, 5, 6, 7, 8, 'Terrasse 1', 'Terrasse 2'],
      categories: ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke'],
      dishes: [
        {
          id: 'dish_' + Date.now() + '_1',
          restaurantId: newId,
          name: 'Tagliolini mit Trüffelbutter',
          description: 'Hausgemachte feine Pasta in geschlagener Butter mit frisch gehobeltem Sommertrüffel.',
          price: 19.50,
          category: 'Hauptgerichte',
          available: true,
          allergens: ['Gluten', 'Milch/Laktose'],
          chefRecommendation: true,
          prepTimeMinutes: 12,
          ratingAverage: 5.0,
          ratingCount: 1,
          cuisineCategory: 'pasta'
        },
        {
          id: 'dish_' + Date.now() + '_2',
          restaurantId: newId,
          name: 'Panna Cotta mit Waldbeeren',
          description: 'Cremiges Vanilledessert mit fruchtigem Waldbeeren-Spiegel.',
          price: 7.50,
          category: 'Desserts',
          available: true,
          allergens: ['Milch/Laktose'],
          prepTimeMinutes: 5,
          ratingAverage: 4.8,
          ratingCount: 1,
          cuisineCategory: 'dessert'
        }
      ]
    };

    onAddRestaurant(created);
    onSelectRestaurant(created.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <RateYourPlateLogo size="xs" variant="light" showTagline={false} />
            <div className="h-4 w-px bg-stone-700 hidden sm:block" />
            <h2 className="text-base sm:text-lg font-bold font-serif-display text-stone-100">
              Restaurants & Betriebe verwalten
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'switch'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Partner-Restaurants ({restaurants.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'new'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            + Neues Restaurant registrieren
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 mb-2">
                Wähle ein Restaurant aus, um als Gast zu bestellen oder als Koch/Betreiber Ratings und Kassenbons einzusehen:
              </p>
              {restaurants.map((r) => {
                const isSelected = r.id === currentRestaurantId;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectRestaurant(r.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50/50 ring-2 ring-amber-700/20'
                        : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-800" />
                        <h3 className="font-bold text-sm text-stone-900">{r.name}</h3>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{r.city} · {r.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1.5">
                        <span>{r.dishes.length} Gerichte in Speisekarte</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-800 font-medium">-{r.discountPerRating.toFixed(2)} € Rabatt/Bewertung</span>
                        <span aria-hidden="true">·</span>
                        <span>POS: {r.posSystemName}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-amber-800 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">
                          Öffnen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 text-stone-700 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Registriere jedes Restaurant in Deutschland. Die digitale Speisekarte, QR-Codes und Kassenanbindung sind sofort einsatzbereit.</span>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Restaurantname</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Osteria dell'Angelo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Stadt</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. Hamburg"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Straße & Hausnummer</label>
                  <input
                    type="text"
                    placeholder="z.B. Neuer Wall 18"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Kassensystem (POS)</label>
                  <select
                    value={posSystemName}
                    onChange={(e) => setPosSystemName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  >
                    <option value="Orderbird POS & TSE Cloud">Orderbird POS & TSE Cloud</option>
                    <option value="Vectron POS Connect & KassenSichV">Vectron POS Connect</option>
                    <option value="Gastronovi Cloud POS">Gastronovi Cloud POS</option>
                    <option value="Hypersoft Gastro POS">Hypersoft Gastro POS</option>
                    <option value="Lightspeed Restaurant Kasse">Lightspeed Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Rabatt pro Bewertung (€)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={discountPerRating}
                    onChange={(e) => setDiscountPerRating(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Willkommensgruß auf Speisekarte</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  Restaurant anlegen & starten
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
