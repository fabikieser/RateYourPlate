import React, { useState } from 'react';
import { Restaurant, Dish, DishRating, Order, CartItem, Reservation, FulfillmentType, RestaurantGoogleReview } from './types/restaurant';
import { INITIAL_RESTAURANTS, INITIAL_RATINGS, INITIAL_RECENT_ORDERS, INITIAL_RESERVATIONS, INITIAL_GOOGLE_REVIEWS } from './data/sampleRestaurants';
import { Header } from './components/Header';
import { GuestMenu } from './components/GuestMenu';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptView } from './components/ReceiptView';
import { OperatorChefDashboard } from './components/OperatorChefDashboard';
import { QrTableManager } from './components/QrTableManager';
import { RestaurantPlatformModal } from './components/RestaurantPlatformModal';
import { ReservationModal } from './components/ReservationModal';
import { PrintMenuView } from './components/PrintMenuView';
import { WaiterTerminal } from './components/WaiterTerminal';
import { AiMenuScannerModal } from './components/AiMenuScannerModal';
import { RateYourPlateLogo } from './components/RateYourPlateLogo';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

function RateYourPlateApp() {
  const { currentUser, canAccessView } = useAuth();

  // App state
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(INITIAL_RESTAURANTS[0].id);
  const [selectedTable, setSelectedTable] = useState<string | number>(4);
  const [currentView, setCurrentView] = useState<'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print'>('guest');

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTargetView, setAuthTargetView] = useState('Personal-Bereich');

  // Current active restaurant (must be initialized before tableOrders)
  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];

  // Fulfillment Type (Am Tisch / Lieferung / Abholung)
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('dine_in');

  // Orders, Ratings, Reservations, and Google Reviews
  const [orders, setOrders] = useState<Order[]>(INITIAL_RECENT_ORDERS);
  const [ratings, setRatings] = useState<DishRating[]>(INITIAL_RATINGS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [googleReviews, setGoogleReviews] = useState<RestaurantGoogleReview[]>(INITIAL_GOOGLE_REVIEWS);

  // Cart for current table or order
  const [cart, setCart] = useState<CartItem[]>([
    {
      dish: INITIAL_RESTAURANTS[0].dishes[0],
      quantity: 1,
    },
    {
      dish: INITIAL_RESTAURANTS[0].dishes[4],
      quantity: 1,
    }
  ]);

  // Active ratings provided by this guest for dishes in session
  const [guestRatings, setGuestRatings] = useState<Record<string, { stars: number; comment?: string }>>({
    'dish_pasta_tartufo': { stars: 5, comment: 'Sensationell cremig!' }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active table / fulfillment orders
  const tableOrders = orders.filter(
    o => o.restaurantId === currentRestaurant.id &&
         (fulfillmentType === 'dine_in' ? o.tableNumber == selectedTable : o.fulfillmentType === fulfillmentType)
  );

  // Collect served & preparing dish IDs for anti-cheat verification
  const consumedDishIds: string[] = [];
  const preparingDishIds: string[] = [];

  tableOrders.forEach(o => {
    if (o.kitchenStatus === 'serviert') {
      o.items.forEach(item => {
        if (!consumedDishIds.includes(item.dish.id)) {
          consumedDishIds.push(item.dish.id);
        }
      });
    } else if (o.kitchenStatus === 'in_zubereitung' || o.kitchenStatus === 'eingegangen' || o.kitchenStatus === 'fertig') {
      o.items.forEach(item => {
        if (!preparingDishIds.includes(item.dish.id)) {
          preparingDishIds.push(item.dish.id);
        }
      });
    }
  });

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRestaurantPickerOpen, setIsRestaurantPickerOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // RBAC View Selector with Permission Gate
  const handleSelectView = (view: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print') => {
    if (view === 'guest') {
      setCurrentView('guest');
      return;
    }
    if (canAccessView(view)) {
      setCurrentView(view);
    } else {
      setAuthTargetView(
        view === 'waiter' ? 'Kellner-Terminal' :
        view === 'chef' ? 'Küchen-Monitor' :
        view === 'analytics' ? 'Betreiber-Dashboard' :
        view === 'print' ? 'Druck-Export' : 'Tischaufsteller'
      );
      setIsAuthModalOpen(true);
    }
  };

  // Simulate Incoming Lieferando Order
  const handleSimulateLieferandoOrder = () => {
    const randomOrderNumber = Math.floor(1000 + Math.random() * 9000);
    const randomDishes = [
      currentRestaurant.dishes[0],
      currentRestaurant.dishes[Math.min(2, currentRestaurant.dishes.length - 1)],
    ];
    const subtotal = randomDishes.reduce((sum, d) => sum + d.price, 0);

    const newOrder: Order = {
      id: 'ord_lfd_' + Date.now(),
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name,
      fulfillmentType: 'delivery',
      orderSource: 'lieferando',
      lieferandoOrderId: 'LIF-' + randomOrderNumber,
      deliveryDetails: {
        street: 'Lieferando Kundenadresse ' + Math.floor(1 + Math.random() * 90),
        postalCode: currentRestaurant.postalCode.split(' ')[0] || '60311',
        city: currentRestaurant.city,
        deliveryNotes: `Lieferando Kurier #${Math.floor(10 + Math.random() * 80)} übernimmt die Zustellung`,
        desiredTime: 'ca. in 25 Min.'
      },
      deliveryFee: currentRestaurant.deliveryFee || 2.50,
      customerName: 'Lieferando Gast #' + randomOrderNumber,
      customerPhone: '+49 171 ' + Math.floor(1000000 + Math.random() * 8999999),
      items: randomDishes.map(d => ({ dish: d, quantity: 1 })),
      subtotal,
      discountPerDishRating: 0.50,
      ratedDishes: {},
      ratingDiscountTotal: 0,
      tipAmount: 2.00,
      finalTotal: subtotal + 2.00 + (currentRestaurant.deliveryFee || 2.50),
      paymentMethod: 'paypal',
      paymentStatus: 'kasse_synchronisiert',
      customerEmail: `gast-${randomOrderNumber}@takeaway.com`,
      timestamp: 'Heute, ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      receiptNumber: 'RE-LFD-' + Date.now(),
      tseTransactionId: 'TSE-LFD-' + Math.floor(100000 + Math.random() * 900000),
      vat7: Number((subtotal * 0.07).toFixed(2)),
      vat19: 0,
      kitchenStatus: 'eingegangen'
    };

    setOrders(prev => [newOrder, ...prev]);
    setToastMessage(`Neue Lieferando-Bestellung #${newOrder.lieferandoOrderId} eingegangen!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cart Actions
  const handleAddToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const handleClearCartItem = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dish.id !== dishId));
  };

  // Rating action (awards discount & updates statistics with Anti-Cheat safeguard)
  const handleRateDish = (dishId: string, stars: number, comment?: string) => {
    // Anti-Cheat: Dishes can ONLY be rated once they have been served and consumed!
    if (!consumedDishIds.includes(dishId)) {
      setToastMessage(`🔒 Sicherheits-Sperre: Gerichte können erst bewertet werden, sobald sie an Tisch ${selectedTable} serviert & verzehrt wurden!`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setGuestRatings(prev => ({
      ...prev,
      [dishId]: { stars, comment: comment?.trim() }
    }));

    // Find dish name
    const dish = currentRestaurant.dishes.find(d => d.id === dishId);
    const dishName = dish ? dish.name : 'Gericht';

    // Add or update to ratings collection for chef and operator
    const newRatingEntry: DishRating = {
      id: 'rate_' + Date.now(),
      dishId,
      dishName,
      restaurantId: currentRestaurant.id,
      stars,
      comment: comment?.trim(),
      guestName: 'Gast',
      tableNumber: selectedTable,
      timestamp: 'Gerade eben'
    };

    setRatings(prev => [newRatingEntry, ...prev.filter(r => !(r.dishId === dishId && r.tableNumber === selectedTable))]);

    // Recalculate dish ratingAverage
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        dishes: rest.dishes.map(d => {
          if (d.id !== dishId) return d;
          const newCount = d.ratingCount + 1;
          const newAvg = Number(((d.ratingAverage * d.ratingCount + stars) / newCount).toFixed(1));
          return {
            ...d,
            ratingCount: newCount,
            ratingAverage: newAvg
          };
        })
      };
    }));
  };

  // Simulation & Table status handlers to demonstrate anti-cheat workflows
  const handleMarkTableDishesServed = (tableNumber: string | number) => {
    setOrders(prev => {
      const matching = prev.filter(o => o.restaurantId === currentRestaurant.id && o.tableNumber == tableNumber);
      if (matching.length === 0) {
        const sampleDishes = [currentRestaurant.dishes[0], currentRestaurant.dishes[4] || currentRestaurant.dishes[1]];
        const newServed: Order = {
          id: 'ord_' + Date.now(),
          restaurantId: currentRestaurant.id,
          restaurantName: currentRestaurant.name,
          fulfillmentType: 'dine_in',
          tableNumber: tableNumber,
          items: sampleDishes.map(d => ({ dish: d, quantity: 1 })),
          subtotal: sampleDishes.reduce((s, d) => s + d.price, 0),
          discountPerDishRating: currentRestaurant.discountPerRating,
          ratedDishes: {},
          ratingDiscountTotal: 0,
          tipAmount: 0,
          finalTotal: sampleDishes.reduce((s, d) => s + d.price, 0),
          paymentMethod: 'paypal',
          paymentStatus: 'in_bearbeitung',
          customerEmail: 'gast@rateyourplate.app',
          timestamp: 'Vor 20 Min.',
          receiptNumber: 'RE-' + Date.now(),
          tseTransactionId: 'TSE-' + Date.now(),
          vat7: 0,
          vat19: 0,
          kitchenStatus: 'serviert'
        };
        return [newServed, ...prev];
      }
      return prev.map(o => {
        if (o.restaurantId === currentRestaurant.id && o.tableNumber == tableNumber) {
          return { ...o, kitchenStatus: 'serviert' };
        }
        return o;
      });
    });
  };

  const handleMarkTableDishesPreparing = (tableNumber: string | number) => {
    setOrders(prev => {
      const matching = prev.filter(o => o.restaurantId === currentRestaurant.id && o.tableNumber == tableNumber);
      if (matching.length === 0) {
        const sampleDishes = [currentRestaurant.dishes[0], currentRestaurant.dishes[1]];
        const newPrep: Order = {
          id: 'ord_' + Date.now(),
          restaurantId: currentRestaurant.id,
          restaurantName: currentRestaurant.name,
          fulfillmentType: 'dine_in',
          tableNumber: tableNumber,
          items: sampleDishes.map(d => ({ dish: d, quantity: 1 })),
          subtotal: sampleDishes.reduce((s, d) => s + d.price, 0),
          discountPerDishRating: currentRestaurant.discountPerRating,
          ratedDishes: {},
          ratingDiscountTotal: 0,
          tipAmount: 0,
          finalTotal: sampleDishes.reduce((s, d) => s + d.price, 0),
          paymentMethod: 'paypal',
          paymentStatus: 'in_bearbeitung',
          customerEmail: 'gast@rateyourplate.app',
          timestamp: 'Gerade eben',
          receiptNumber: 'RE-' + Date.now(),
          tseTransactionId: 'TSE-' + Date.now(),
          vat7: 0,
          vat19: 0,
          kitchenStatus: 'in_zubereitung'
        };
        return [newPrep, ...prev];
      }
      return prev.map(o => {
        if (o.restaurantId === currentRestaurant.id && o.tableNumber == tableNumber) {
          return { ...o, kitchenStatus: 'in_zubereitung' };
        }
        return o;
      });
    });
  };

  const handleResetTableOrders = (tableNumber: string | number) => {
    setOrders(prev => prev.filter(o => !(o.restaurantId === currentRestaurant.id && o.tableNumber == tableNumber)));
    setGuestRatings({});
  };

  const handleSimulateServeDish = (dishId: string) => {
    const targetDish = currentRestaurant.dishes.find(d => d.id === dishId);
    if (!targetDish) return;
    setOrders(prev => [
      {
        id: 'ord_' + Date.now(),
        restaurantId: currentRestaurant.id,
        restaurantName: currentRestaurant.name,
        fulfillmentType: 'dine_in',
        tableNumber: selectedTable,
        items: [{ dish: targetDish, quantity: 1 }],
        subtotal: targetDish.price,
        discountPerDishRating: currentRestaurant.discountPerRating,
        ratedDishes: {},
        ratingDiscountTotal: 0,
        tipAmount: 0,
        finalTotal: targetDish.price,
        paymentMethod: 'paypal',
        paymentStatus: 'in_bearbeitung',
        customerEmail: 'gast@rateyourplate.app',
        timestamp: 'Gerade serviert',
        receiptNumber: 'RE-' + Date.now(),
        tseTransactionId: 'TSE-' + Date.now(),
        vat7: 0,
        vat19: 0,
        kitchenStatus: 'serviert'
      },
      ...prev
    ]);
  };

  // Update image for a dish
  const handleUpdateDishImage = (dishId: string, imageUrl: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        dishes: rest.dishes.map(d => d.id === dishId ? { ...d, imageUrl } : d)
      };
    }));
  };

  // Delete / Remove dish from menu
  const handleDeleteDish = (dishId: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        dishes: rest.dishes.filter(d => d.id !== dishId)
      };
    }));
  };

  // Update Restaurant Logo
  const handleUpdateRestaurantLogo = (logoUrl: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        logoUrl
      };
    }));
  };

  // Import AI Scanned dishes
  const handleImportDishes = (newDishes: Dish[]) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      // Also collect any new categories
      const existingCategories = new Set(rest.categories);
      newDishes.forEach(d => existingCategories.add(d.category));

      return {
        ...rest,
        categories: Array.from(existingCategories),
        dishes: [...newDishes, ...rest.dishes]
      };
    }));
  };

  // Payment complete callback
  const handlePaymentComplete = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveReceipt(order);
  };

  // Google Maps Review submitted callback
  const handleSubmitGoogleReview = (newReview: RestaurantGoogleReview) => {
    setGoogleReviews(prev => [newReview, ...prev]);
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      const prevCount = rest.googleMapsReviewCount || 428;
      const prevAvg = rest.googleMapsRating || 4.8;
      const newCount = prevCount + 1;
      const newAvg = Number(((prevAvg * prevCount + newReview.overallStars) / newCount).toFixed(1));
      return {
        ...rest,
        googleMapsReviewCount: newCount,
        googleMapsRating: newAvg
      };
    }));
  };

  // Update Google Place ID & Maps URL
  const handleUpdateGoogleSettings = (placeId: string, googleMapsUrl?: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        googlePlaceId: placeId,
        googleMapsUrl: googleMapsUrl || rest.googleMapsUrl
      };
    }));
  };

  // Update order status in kitchen monitor
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['kitchenStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, kitchenStatus: newStatus } : o));
  };

  // Waiter send order to kitchen
  const handleSendOrderToKitchen = (waiterOrder: Order) => {
    setOrders(prev => [waiterOrder, ...prev]);
  };

  // Open guest checkout from waiter terminal
  const handleOpenGuestCheckoutForTable = (tableNumber: string | number, items: CartItem[]) => {
    setSelectedTable(tableNumber);
    setCart(items);
    setFulfillmentType('dine_in');
    setCurrentView('guest');
    setIsCheckoutOpen(true);
  };

  // Reservations handlers
  const handleMakeReservation = (newRes: Reservation) => {
    setReservations(prev => [newRes, ...prev]);
  };

  const handleUpdateReservationStatus = (reservationId: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r));
  };

  // Add new dish in menu editor
  const handleAddNewDish = (newDish: Dish) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        dishes: [newDish, ...rest.dishes]
      };
    }));
  };

  // Toggle dish availability
  const handleToggleDishAvailability = (dishId: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id !== currentRestaurant.id) return rest;
      return {
        ...rest,
        dishes: rest.dishes.map(d => d.id === dishId ? { ...d, available: !d.available } : d)
      };
    }));
  };

  // Add new restaurant to platform
  const handleAddRestaurant = (newRestaurant: Restaurant) => {
    setRestaurants(prev => [newRestaurant, ...prev]);
  };

  const handleOpenTableAsGuest = (tableNumber: string | number) => {
    setSelectedTable(tableNumber);
    setFulfillmentType('dine_in');
    setCurrentView('guest');
    setActiveReceipt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onSelectView={(view) => {
          handleSelectView(view);
          setActiveReceipt(null);
        }}
        restaurant={currentRestaurant}
        onOpenRestaurantPicker={() => setIsRestaurantPickerOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAuthModal={(target) => {
          setAuthTargetView(target || 'Personal-Bereich');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 pointer-events-auto">
          <div className="bg-stone-900 text-amber-200 border border-amber-500/50 shadow-2xl px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-white cursor-pointer shrink-0 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {activeReceipt ? (
          <ReceiptView
            order={activeReceipt}
            restaurant={currentRestaurant}
            onBackToMenu={() => setActiveReceipt(null)}
            onSubmitGoogleReview={handleSubmitGoogleReview}
          />
        ) : (
          <>
            {currentView === 'guest' && (
              <GuestMenu
                restaurant={currentRestaurant}
                selectedTable={selectedTable}
                onChangeTable={setSelectedTable}
                fulfillmentType={fulfillmentType}
                onChangeFulfillmentType={setFulfillmentType}
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                guestRatings={guestRatings}
                onRateDish={handleRateDish}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onOpenReservation={() => setIsReservationOpen(true)}
                consumedDishIds={consumedDishIds}
                preparingDishIds={preparingDishIds}
                activeTableOrders={tableOrders}
                onMarkTableDishesServed={handleMarkTableDishesServed}
                onMarkTableDishesPreparing={handleMarkTableDishesPreparing}
                onResetTableOrders={handleResetTableOrders}
                onSimulateServeDish={handleSimulateServeDish}
                ratings={ratings}
              />
            )}

            {currentView === 'waiter' && (
              <WaiterTerminal
                restaurant={currentRestaurant}
                orders={orders}
                onSendOrderToKitchen={handleSendOrderToKitchen}
                onOpenGuestCheckoutForTable={handleOpenGuestCheckoutForTable}
                onMarkTableServed={handleMarkTableDishesServed}
              />
            )}

            {currentView === 'print' && (
              <PrintMenuView
                restaurant={currentRestaurant}
                onBack={() => setCurrentView('guest')}
              />
            )}

            {currentView === 'qr_tables' && (
              <QrTableManager
                restaurant={currentRestaurant}
                onOpenTableAsGuest={handleOpenTableAsGuest}
              />
            )}

            {currentView === 'chef' && (
              <OperatorChefDashboard
                restaurant={currentRestaurant}
                ratings={ratings}
                orders={orders}
                reservations={reservations}
                googleReviews={googleReviews}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onAddNewDish={handleAddNewDish}
                onToggleDishAvailability={handleToggleDishAvailability}
                onUpdateDishImage={handleUpdateDishImage}
                onDeleteDish={handleDeleteDish}
                onUpdateRestaurantLogo={handleUpdateRestaurantLogo}
                onUpdateGoogleSettings={handleUpdateGoogleSettings}
                onOpenAiScanner={() => setIsAiScannerOpen(true)}
                onOpenPrintMenu={() => setCurrentView('print')}
                activeTab="kitchen"
                onSimulateLieferandoOrder={handleSimulateLieferandoOrder}
              />
            )}

            {currentView === 'analytics' && (
              <OperatorChefDashboard
                restaurant={currentRestaurant}
                ratings={ratings}
                orders={orders}
                reservations={reservations}
                googleReviews={googleReviews}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onAddNewDish={handleAddNewDish}
                onToggleDishAvailability={handleToggleDishAvailability}
                onUpdateDishImage={handleUpdateDishImage}
                onDeleteDish={handleDeleteDish}
                onUpdateRestaurantLogo={handleUpdateRestaurantLogo}
                onUpdateGoogleSettings={handleUpdateGoogleSettings}
                onOpenAiScanner={() => setIsAiScannerOpen(true)}
                onOpenPrintMenu={() => setCurrentView('print')}
                activeTab="analytics"
                onSimulateLieferandoOrder={handleSimulateLieferandoOrder}
              />
            )}
          </>
        )}
      </div>

      {/* Checkout Drawer / Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        restaurant={currentRestaurant}
        selectedTable={selectedTable}
        fulfillmentType={fulfillmentType}
        onChangeFulfillmentType={setFulfillmentType}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCartItem={handleClearCartItem}
        guestRatings={guestRatings}
        onRateDish={handleRateDish}
        onPaymentComplete={handlePaymentComplete}
        consumedDishIds={consumedDishIds}
      />

      {/* Table Reservation Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        restaurant={currentRestaurant}
        onMakeReservation={handleMakeReservation}
      />

      {/* AI Menu Scanner Modal */}
      <AiMenuScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        restaurant={currentRestaurant}
        onImportDishes={handleImportDishes}
      />

      {/* Restaurant Switcher & Onboarding Modal */}
      <RestaurantPlatformModal
        isOpen={isRestaurantPickerOpen}
        onClose={() => setIsRestaurantPickerOpen(false)}
        restaurants={restaurants}
        currentRestaurantId={currentRestaurant.id}
        onSelectRestaurant={setSelectedRestaurantId}
        onAddRestaurant={handleAddRestaurant}
      />

      {/* Personal & Betreiber Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        restaurant={currentRestaurant}
        targetViewName={authTargetView}
        onSuccessRedirect={() => {
          if (authTargetView.includes('Kellner')) {
            setCurrentView('waiter');
          } else if (authTargetView.includes('Küche')) {
            setCurrentView('chef');
          } else if (authTargetView.includes('Betreiber') || authTargetView.includes('Dashboard')) {
            setCurrentView('analytics');
          } else if (authTargetView.includes('Druck')) {
            setCurrentView('print');
          }
          setActiveReceipt(null);
        }}
      />

      {/* Footer */}
      <footer className="print:hidden bg-stone-900 text-stone-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RateYourPlateLogo size="xs" variant="light" showTagline={false} />
            <span className="text-stone-500">|</span>
            <span className="text-stone-300">Digitale Speisekarte, Gericht-für-Gericht Bewertungen, Google Maps Reputation & POS</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>KI-Speisekarten Scanner</span>
            <span aria-hidden="true">·</span>
            <span>DIN A4 & A5 PDF-Druck</span>
            <span aria-hidden="true">·</span>
            <span>Mobiles Kellner-Terminal</span>
            <span aria-hidden="true">·</span>
            <span>Google Maps Live-Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RateYourPlateApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
