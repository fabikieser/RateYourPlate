import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackLanguageChange } from '../utils/analytics';
import { Dish } from '../types/restaurant';

export type LanguageCode = 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl' | 'tr' | 'pl' | 'uk' | 'zh';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

export interface Translations {
  // Navigation
  menu: string;
  waiterTerminal: string;
  kitchenMonitor: string;
  operatorDashboard: string;
  printExport: string;
  cart: string;
  switchRestaurant: string;
  table: string;
  tableStand: string;

  // Fulfillment
  dineIn: string;
  delivery: string;
  pickup: string;
  selectFulfillment: string;

  // Filters & Search
  searchPlaceholder: string;
  allCategories: string;
  filterAll: string;
  filterTopRated: string;
  filterUnrated: string;
  filterChef: string;

  // Menu & Dish Cards
  addToCart: string;
  inCart: string;
  rateDish: string;
  rateDishPrompt: string;
  discountEarned: string;
  discountPerDish: string;
  unlockAfterServed: string;
  simulatedServeDish: string;
  dishServed: string;
  dishPreparing: string;
  allergens: string;
  prepTime: string;
  minutes: string;
  chefChoice: string;
  topOfCategory: string;
  starRating: string;
  noDishesFound: string;

  // Cart & Checkout
  yourCart: string;
  subtotal: string;
  reviewDiscount: string;
  deliveryFee: string;
  tip: string;
  total: string;
  checkout: string;
  proceedToPayment: string;
  payWithPayPal: string;
  payWithCard: string;
  digitalReceipt: string;
  orderSentSuccess: string;
  emptyCart: string;

  // Google Maps Review
  googleMapsTitle: string;
  googleMapsSubtitle: string;
  suggestedRating: string;
  foodRating: string;
  serviceRating: string;
  ambienceRating: string;
  speedRating: string;
  valueRating: string;
  copyAndOpenMaps: string;
  copiedNotice: string;
  thankYouReview: string;

  // Analytics & Dashboard
  analyticsTab: string;
  realtimeTraffic: string;
  activeVisitorsNow: string;
  pageViewsToday: string;
  dishConversion: string;
  connectGoogleAnalytics: string;
  measurementId: string;
  sendTestEvent: string;
  liveEventStream: string;
  gdprCompliant: string;

  // Reservation
  tableReservation: string;
  reserveTableNow: string;
  guestsCount: string;
  dateTime: string;
}

const TRANSLATIONS_DATA: Record<LanguageCode, Translations> = {
  de: {
    menu: 'Speisekarte',
    waiterTerminal: 'Kellner-Terminal',
    kitchenMonitor: 'Küchen-Monitor',
    operatorDashboard: 'Betreiber',
    printExport: 'Druck-Export',
    cart: 'Warenkorb',
    switchRestaurant: 'Restaurant wechseln',
    table: 'Tisch',
    tableStand: 'Tischaufsteller',
    dineIn: 'Am Tisch (Dine-In)',
    delivery: 'Lieferung',
    pickup: 'Selbstabholung',
    selectFulfillment: 'Bestellart wählen',
    searchPlaceholder: 'Gerichte, Zutaten oder Weine suchen...',
    allCategories: 'Alle Kategorien',
    filterAll: 'Alle Gerichte',
    filterTopRated: 'Top bewertet (4.7+)',
    filterUnrated: 'Noch unbewertet',
    filterChef: 'Chef-Empfehlungen',
    addToCart: 'In den Warenkorb',
    inCart: 'Im Warenkorb',
    rateDish: 'Gericht bewerten',
    rateDishPrompt: 'Bewerten & sparen',
    discountEarned: 'Rabatt gesichert',
    discountPerDish: '0,50 € Rabatt pro bewertetes Gericht',
    unlockAfterServed: 'Freischaltung nach Servieren am Tisch',
    simulatedServeDish: 'Gericht als serviert markieren',
    dishServed: 'Am Tisch serviert',
    dishPreparing: 'In der Küche',
    allergens: 'Allergene & Zutaten',
    prepTime: 'Zubereitungszeit',
    minutes: 'Min.',
    chefChoice: 'Empfehlung des Küchenchefs',
    topOfCategory: 'Kategorie-Favorit',
    starRating: 'Sterne',
    noDishesFound: 'Keine passenden Gerichte gefunden',
    yourCart: 'Ihr Warenkorb',
    subtotal: 'Zwischensumme',
    reviewDiscount: 'Bewertungs-Rabatt',
    deliveryFee: 'Liefergebühr',
    tip: 'Trinkgeld',
    total: 'Gesamtbetrag',
    checkout: 'Zur Kasse',
    proceedToPayment: 'Jetzt verbindlich zahlen',
    payWithPayPal: 'Mit PayPal zahlen',
    payWithCard: 'Kreditkarte / Apple Pay',
    digitalReceipt: 'Digitale TSE-Quittung',
    orderSentSuccess: 'Bestellung erfolgreich an die Küche übertragen!',
    emptyCart: 'Ihr Warenkorb ist leer',
    googleMapsTitle: 'Restaurant bei Google Maps bewerten',
    googleMapsSubtitle: 'Ihre Gerichtbewertungen fließen automatisch in den Rezensionsvorschlag ein.',
    suggestedRating: 'Vorgeschlagenes Gesamtrating',
    foodRating: 'Essen & Geschmack',
    serviceRating: 'Service & Gastfreundschaft',
    ambienceRating: 'Atmosphäre & Ambiente',
    speedRating: 'Schnelligkeit & Timing',
    valueRating: 'Preis-Leistung',
    copyAndOpenMaps: 'Rezension kopieren & Google Maps öffnen',
    copiedNotice: 'Rezension in die Zwischenablage kopiert!',
    thankYouReview: 'Vielen Dank für Ihre Unterstützung!',
    analyticsTab: 'Google Analytics & Live-Traffic',
    realtimeTraffic: 'Echtzeit-Besucher & Aktivitäten',
    activeVisitorsNow: 'Aktive Gäste online',
    pageViewsToday: 'Seitenbesuche heute',
    dishConversion: 'Menü-Konversionsrate',
    connectGoogleAnalytics: 'Google Analytics 4 verbinden',
    measurementId: 'GA4 Mess-ID',
    sendTestEvent: 'Test-Event an GA4 senden',
    liveEventStream: 'Echtzeit-Aktivitäten Stream',
    gdprCompliant: 'DSGVO / GDPR konform (Cookieless)',
    tableReservation: 'Tisch reservieren',
    reserveTableNow: 'Jetzt Tisch buchen',
    guestsCount: 'Personenanzahl',
    dateTime: 'Datum & Uhrzeit'
  },
  en: {
    menu: 'Digital Menu',
    waiterTerminal: 'Waiter Terminal',
    kitchenMonitor: 'Kitchen Display',
    operatorDashboard: 'Dashboard',
    printExport: 'Print Menu',
    cart: 'Cart',
    switchRestaurant: 'Switch Restaurant',
    table: 'Table',
    tableStand: 'Table QR Stand',
    dineIn: 'Dine-In (Table)',
    delivery: 'Delivery',
    pickup: 'Takeout / Pickup',
    selectFulfillment: 'Dining option',
    searchPlaceholder: 'Search dishes, ingredients or drinks...',
    allCategories: 'All Categories',
    filterAll: 'All Dishes',
    filterTopRated: 'Top Rated (4.7+)',
    filterUnrated: 'Unrated (Help us rate)',
    filterChef: "Chef's Specials",
    addToCart: 'Add to Cart',
    inCart: 'In Cart',
    rateDish: 'Rate this dish',
    rateDishPrompt: 'Rate & save',
    discountEarned: 'Discount applied',
    discountPerDish: '€0.50 discount for each dish you rate',
    unlockAfterServed: 'Unlocks once served at your table',
    simulatedServeDish: 'Mark as served',
    dishServed: 'Served at table',
    dishPreparing: 'Cooking in kitchen',
    allergens: 'Allergens & info',
    prepTime: 'Prep time',
    minutes: 'min',
    chefChoice: "Chef's Signature",
    topOfCategory: 'Category Favorite',
    starRating: 'Stars',
    noDishesFound: 'No dishes found matching your search',
    yourCart: 'Your Order',
    subtotal: 'Subtotal',
    reviewDiscount: 'Rating discount',
    deliveryFee: 'Delivery fee',
    tip: 'Tip',
    total: 'Total amount',
    checkout: 'Checkout',
    proceedToPayment: 'Complete Payment',
    payWithPayPal: 'Pay with PayPal',
    payWithCard: 'Credit Card / Apple Pay',
    digitalReceipt: 'Digital Receipt',
    orderSentSuccess: 'Order sent directly to the kitchen!',
    emptyCart: 'Your cart is empty',
    googleMapsTitle: 'Review restaurant on Google Maps',
    googleMapsSubtitle: 'Your dish ratings automatically build a customized Google review draft.',
    suggestedRating: 'Suggested overall rating',
    foodRating: 'Food & Taste',
    serviceRating: 'Service & Hospitality',
    ambienceRating: 'Atmosphere & Vibe',
    speedRating: 'Speed & Service time',
    valueRating: 'Value for Money',
    copyAndOpenMaps: 'Copy review & open Google Maps',
    copiedNotice: 'Review copied to clipboard!',
    thankYouReview: 'Thank you for supporting our restaurant!',
    analyticsTab: 'Google Analytics & Live Traffic',
    realtimeTraffic: 'Real-Time Visitors & Activities',
    activeVisitorsNow: 'Active diners online right now',
    pageViewsToday: 'Page views today',
    dishConversion: 'Menu conversion rate',
    connectGoogleAnalytics: 'Connect Google Analytics 4',
    measurementId: 'GA4 Measurement ID',
    sendTestEvent: 'Send test event to GA4',
    liveEventStream: 'Live Activity Stream',
    gdprCompliant: 'GDPR Privacy Mode (Cookieless)',
    tableReservation: 'Reserve Table',
    reserveTableNow: 'Book Table Now',
    guestsCount: 'Number of guests',
    dateTime: 'Date & Time'
  },
  fr: {
    menu: 'Menu Numérique',
    waiterTerminal: 'Terminal Serveur',
    kitchenMonitor: 'Écran Cuisine',
    operatorDashboard: 'Gérant',
    printExport: 'Imprimer le Menu',
    cart: 'Panier',
    switchRestaurant: 'Changer de restaurant',
    table: 'Table',
    tableStand: 'Chevalet QR Table',
    dineIn: 'Sur Place (Table)',
    delivery: 'Livraison',
    pickup: 'À emporter',
    selectFulfillment: 'Mode de commande',
    searchPlaceholder: 'Rechercher plats, ingrédients, vins...',
    allCategories: 'Toutes les catégories',
    filterAll: 'Tous les plats',
    filterTopRated: 'Mieux notés (4.7+)',
    filterUnrated: 'Non notés',
    filterChef: 'Sélection du Chef',
    addToCart: 'Ajouter au panier',
    inCart: 'Au panier',
    rateDish: 'Noter ce plat',
    rateDishPrompt: 'Notez & économisez',
    discountEarned: 'Remise appliquée',
    discountPerDish: '0,50 € de réduction par plat noté',
    unlockAfterServed: 'Accessible dès que le plat est servi',
    simulatedServeDish: 'Marquer comme servi',
    dishServed: 'Servi à table',
    dishPreparing: 'En préparation en cuisine',
    allergens: 'Allergènes & ingrédients',
    prepTime: 'Préparation',
    minutes: 'min',
    chefChoice: 'Coup de cœur du Chef',
    topOfCategory: 'Favori de la catégorie',
    starRating: 'Étoiles',
    noDishesFound: 'Aucun plat trouvé',
    yourCart: 'Votre commande',
    subtotal: 'Sous-total',
    reviewDiscount: 'Remise avis',
    deliveryFee: 'Frais de livraison',
    tip: 'Pourboire',
    total: 'Total à régler',
    checkout: 'Commander',
    proceedToPayment: 'Payer la commande',
    payWithPayPal: 'Payer avec PayPal',
    payWithCard: 'Carte bancaire / Apple Pay',
    digitalReceipt: 'Ticket de caisse digital',
    orderSentSuccess: 'Commande transmise avec succès en cuisine !',
    emptyCart: 'Votre panier est vide',
    googleMapsTitle: 'Noter le restaurant sur Google Maps',
    googleMapsSubtitle: 'Vos avis par plat composent automatiquement une recommandation détaillée.',
    suggestedRating: 'Note globale suggérée',
    foodRating: 'Cuisine & Saveurs',
    serviceRating: 'Service & Accueil',
    ambienceRating: 'Cadre & Ambiance',
    speedRating: 'Rapidité du service',
    valueRating: 'Rapport qualité-prix',
    copyAndOpenMaps: 'Copier l’avis & ouvrir Google Maps',
    copiedNotice: 'Avis copié dans le presse-papier !',
    thankYouReview: 'Merci pour votre fidélité et votre avis !',
    analyticsTab: 'Google Analytics & Trafic en Direct',
    realtimeTraffic: 'Visiteurs & Activités en direct',
    activeVisitorsNow: 'Clients connectés en direct',
    pageViewsToday: 'Pages vues aujourd’hui',
    dishConversion: 'Taux de conversion du menu',
    connectGoogleAnalytics: 'Connecter Google Analytics 4',
    measurementId: 'Identifiant de mesure GA4',
    sendTestEvent: 'Envoyer un événement test à GA4',
    liveEventStream: 'Flux d’activité en temps réel',
    gdprCompliant: 'Conforme RGPD (Sans cookies)',
    tableReservation: 'Réserver une table',
    reserveTableNow: 'Réserver maintenant',
    guestsCount: 'Nombre de personnes',
    dateTime: 'Date & heure'
  },
  it: {
    menu: 'Menu Digitale',
    waiterTerminal: 'Terminale Cameriere',
    kitchenMonitor: 'Monitor Cucina',
    operatorDashboard: 'Gestione',
    printExport: 'Stampa Menu',
    cart: 'Carrello',
    switchRestaurant: 'Cambia ristorante',
    table: 'Tavolo',
    tableStand: 'Cavaliere QR Tavolo',
    dineIn: 'Al Tavolo',
    delivery: 'Consegna a domicilio',
    pickup: 'Da asporto',
    selectFulfillment: 'Opzione ordine',
    searchPlaceholder: 'Cerca piatti, ingredienti o vini...',
    allCategories: 'Tutte le categorie',
    filterAll: 'Tutti i piatti',
    filterTopRated: 'I più votati (4.7+)',
    filterUnrated: 'Da valutare',
    filterChef: 'Consigli dello Chef',
    addToCart: 'Aggiungi al carrello',
    inCart: 'Nel carrello',
    rateDish: 'Valuta questo piatto',
    rateDishPrompt: 'Valuta e risparmia',
    discountEarned: 'Sconto applicato',
    discountPerDish: '0,50 € di sconto per ogni piatto valutato',
    unlockAfterServed: 'Sbloccato dopo il servizio al tavolo',
    simulatedServeDish: 'Segna come servito',
    dishServed: 'Servito al tavolo',
    dishPreparing: 'In preparazione',
    allergens: 'Allergeni & info',
    prepTime: 'Tempo di prep.',
    minutes: 'min',
    chefChoice: 'Specialità dello Chef',
    topOfCategory: 'Piatto preferito',
    starRating: 'Stelle',
    noDishesFound: 'Nessun piatto trovato',
    yourCart: 'Il tuo ordine',
    subtotal: 'Subtotale',
    reviewDiscount: 'Sconto recensioni',
    deliveryFee: 'Spese di consegna',
    tip: 'Mancia',
    total: 'Totale',
    checkout: 'Cassa',
    proceedToPayment: 'Paga ora',
    payWithPayPal: 'Paga con PayPal',
    payWithCard: 'Carta di credito / Apple Pay',
    digitalReceipt: 'Ricevuta digitale',
    orderSentSuccess: 'Ordine inviato direttamente in cucina!',
    emptyCart: 'Il carrello è vuoto',
    googleMapsTitle: 'Recensisci il ristorante su Google Maps',
    googleMapsSubtitle: 'I tuoi voti ai singoli piatti compongono la bozza della recensione finale.',
    suggestedRating: 'Valutazione complessiva consigliata',
    foodRating: 'Cibo & Sapori',
    serviceRating: 'Servizio & Ospitalità',
    ambienceRating: 'Atmosfera',
    speedRating: 'Velocità di servizio',
    valueRating: 'Rapporto qualità-prezzo',
    copyAndOpenMaps: 'Copia recensione e apri Google Maps',
    copiedNotice: 'Recensione copiata negli appunti!',
    thankYouReview: 'Grazie mille per il tuo supporto!',
    analyticsTab: 'Google Analytics & Traffico Live',
    realtimeTraffic: 'Visitatori & Attività in Tempo Reale',
    activeVisitorsNow: 'Ospiti attivi online ora',
    pageViewsToday: 'Visualizzazioni oggi',
    dishConversion: 'Tasso di conversione del menu',
    connectGoogleAnalytics: 'Collega Google Analytics 4',
    measurementId: 'ID di misurazione GA4',
    sendTestEvent: 'Invia evento di test a GA4',
    liveEventStream: 'Stream delle attività live',
    gdprCompliant: 'Conforme GDPR (Senza cookie)',
    tableReservation: 'Prenota un tavolo',
    reserveTableNow: 'Prenota ora',
    guestsCount: 'Numero di persone',
    dateTime: 'Data e ora'
  },
  es: {
    menu: 'Carta Digital',
    waiterTerminal: 'Terminal Camarero',
    kitchenMonitor: 'Monitor de Cocina',
    operatorDashboard: 'Administración',
    printExport: 'Imprimir Carta',
    cart: 'Pedido',
    switchRestaurant: 'Cambiar restaurante',
    table: 'Mesa',
    tableStand: 'Soporte QR de Mesa',
    dineIn: 'En Mesa (Comedor)',
    delivery: 'A Domicilio',
    pickup: 'Para Llevar',
    selectFulfillment: 'Tipo de pedido',
    searchPlaceholder: 'Buscar platos, ingredientes o vinos...',
    allCategories: 'Todas las categorías',
    filterAll: 'Todos los platos',
    filterTopRated: 'Mejor valorados (4.7+)',
    filterUnrated: 'Sin valorar',
    filterChef: 'Recomendación del Chef',
    addToCart: 'Añadir al pedido',
    inCart: 'En el pedido',
    rateDish: 'Valorar este plato',
    rateDishPrompt: 'Valora y ahorra',
    discountEarned: 'Descuento aplicado',
    discountPerDish: '0,50 € de descuento por cada plato valorado',
    unlockAfterServed: 'Desbloqueado cuando se sirve en mesa',
    simulatedServeDish: 'Marcar como servido',
    dishServed: 'Servido en mesa',
    dishPreparing: 'En cocina',
    allergens: 'Alérgenos e ingredientes',
    prepTime: 'Tiempo de prep.',
    minutes: 'min',
    chefChoice: 'Especialidad del Chef',
    topOfCategory: 'Favorito de la categoría',
    starRating: 'Estrellas',
    noDishesFound: 'No se encontraron platos',
    yourCart: 'Tu pedido',
    subtotal: 'Subtotal',
    reviewDiscount: 'Descuento por valoración',
    deliveryFee: 'Gastos de envío',
    tip: 'Propina',
    total: 'Total',
    checkout: 'Finalizar pedido',
    proceedToPayment: 'Pagar ahora',
    payWithPayPal: 'Pagar con PayPal',
    payWithCard: 'Tarjeta / Apple Pay',
    digitalReceipt: 'Ticket digital TSE',
    orderSentSuccess: '¡Pedido enviado directamente a cocina!',
    emptyCart: 'Tu carrito está vacío',
    googleMapsTitle: 'Opina en Google Maps',
    googleMapsSubtitle: 'Tus valoraciones de cada plato generan una reseña personalizada.',
    suggestedRating: 'Valoración general sugerida',
    foodRating: 'Comida y Sabor',
    serviceRating: 'Servicio y Atención',
    ambienceRating: 'Ambiente y Decoración',
    speedRating: 'Rapidez de servicio',
    valueRating: 'Relación Calidad-Precio',
    copyAndOpenMaps: 'Copiar reseña y abrir Google Maps',
    copiedNotice: '¡Reseña copiada al portapapeles!',
    thankYouReview: '¡Muchas gracias por tu valoración!',
    analyticsTab: 'Google Analytics y Tráfico en Vivo',
    realtimeTraffic: 'Visitantes y Actividad en Tiempo Real',
    activeVisitorsNow: 'Comensales activos ahora mismo',
    pageViewsToday: 'Visitas hoy',
    dishConversion: 'Conversión de la carta',
    connectGoogleAnalytics: 'Conectar Google Analytics 4',
    measurementId: 'ID de medición GA4',
    sendTestEvent: 'Enviar evento de prueba a GA4',
    liveEventStream: 'Registro de actividad en directo',
    gdprCompliant: 'Cumple con RGPD (Sin cookies)',
    tableReservation: 'Reservar mesa',
    reserveTableNow: 'Reservar ahora',
    guestsCount: 'Número de comensales',
    dateTime: 'Fecha y hora'
  },
  nl: {
    menu: 'Digitale Menukaart',
    waiterTerminal: 'Kelner Terminal',
    kitchenMonitor: 'Keukenscherm',
    operatorDashboard: 'Beheerder',
    printExport: 'Menu Printen',
    cart: 'Winkelmand',
    switchRestaurant: 'Wissel Restaurant',
    table: 'Tafel',
    tableStand: 'Tafel QR-Standaard',
    dineIn: 'Aan Tafel',
    delivery: 'Bezorging',
    pickup: 'Afhalen',
    selectFulfillment: 'Bestelmethode',
    searchPlaceholder: 'Zoek gerechten, ingrediënten of dranken...',
    allCategories: 'Alle categorieën',
    filterAll: 'Alle gerechten',
    filterTopRated: 'Hoogst gewaardeerd (4.7+)',
    filterUnrated: 'Nog niet beoordeeld',
    filterChef: 'Aanbeveling van de Chef',
    addToCart: 'In winkelmand',
    inCart: 'In winkelmand',
    rateDish: 'Beoordeel gerecht',
    rateDishPrompt: 'Beoordeel en bespaar',
    discountEarned: 'Korting toegepast',
    discountPerDish: '€ 0,50 korting per beoordeeld gerecht',
    unlockAfterServed: 'Beschikbaar na serveren aan tafel',
    simulatedServeDish: 'Markeer als geserveerd',
    dishServed: 'Geserveerd aan tafel',
    dishPreparing: 'In de keuken',
    allergens: 'Allergenen & info',
    prepTime: 'Bereidingstijd',
    minutes: 'min',
    chefChoice: 'Keuze van de Chef',
    topOfCategory: 'Categorie favoriet',
    starRating: 'Sterren',
    noDishesFound: 'Geen gerechten gevonden',
    yourCart: 'Uw bestelling',
    subtotal: 'Subtotaal',
    reviewDiscount: 'Beoordelingskorting',
    deliveryFee: 'Bezorgkosten',
    tip: 'Fooi',
    total: 'Totaalbedrag',
    checkout: 'Afrekenen',
    proceedToPayment: 'Nu betalen',
    payWithPayPal: 'Betalen met PayPal',
    payWithCard: 'Creditcard / Apple Pay',
    digitalReceipt: 'Digitaal kasticket',
    orderSentSuccess: 'Bestelling succesvol naar de keuken verstuurd!',
    emptyCart: 'Uw winkelmand is leeg',
    googleMapsTitle: 'Beoordeel op Google Maps',
    googleMapsSubtitle: 'Uw gerechtbeoordelingen stellen automatisch een complete recensie samen.',
    suggestedRating: 'Voorgestelde algemene score',
    foodRating: 'Eten & Smaak',
    serviceRating: 'Service & Gastvrijheid',
    ambienceRating: 'Sfeer & Uitstraling',
    speedRating: 'Snelheid van bediening',
    valueRating: 'Prijs-kwaliteit',
    copyAndOpenMaps: 'Recensie kopiëren & Google Maps openen',
    copiedNotice: 'Recensie gekopieerd naar klembord!',
    thankYouReview: 'Hartelijk dank voor uw beoordeling!',
    analyticsTab: 'Google Analytics & Live Verkeer',
    realtimeTraffic: 'Realtime Bezoekers & Activiteiten',
    activeVisitorsNow: 'Actieve gasten online',
    pageViewsToday: 'Paginaweergaven vandaag',
    dishConversion: 'Menukaart conversie',
    connectGoogleAnalytics: 'Google Analytics 4 koppelen',
    measurementId: 'GA4 Metings-ID',
    sendTestEvent: 'Testgebeurtenis naar GA4 sturen',
    liveEventStream: 'Live activiteitenstream',
    gdprCompliant: 'AVG / GDPR conform (Zonder cookies)',
    tableReservation: 'Tafel reserveren',
    reserveTableNow: 'Nu reserveren',
    guestsCount: 'Aantal personen',
    dateTime: 'Datum & tijd'
  },
  tr: {
    menu: 'Dijital Menü',
    waiterTerminal: 'Garson Terminali',
    kitchenMonitor: 'Mutfak Ekranı',
    operatorDashboard: 'İşletmeci',
    printExport: 'Menü Yazdır',
    cart: 'Sepet',
    switchRestaurant: 'Restoran Değiştir',
    table: 'Masa',
    tableStand: 'Masa QR Standı',
    dineIn: 'Masada (Restoranda)',
    delivery: 'Paket Servis',
    pickup: 'Gel Al',
    selectFulfillment: 'Sipariş türü seç',
    searchPlaceholder: 'Yemek, malzeme veya içecek ara...',
    allCategories: 'Tüm Kategoriler',
    filterAll: 'Tüm Yemekler',
    filterTopRated: 'En Yüksek Puanlı (4.7+)',
    filterUnrated: 'Henüz Puanlanmamış',
    filterChef: 'Şefin Önerisi',
    addToCart: 'Sepete Ekle',
    inCart: 'Sepette',
    rateDish: 'Yemeği Puanla',
    rateDishPrompt: 'Puanla ve indirim kazan',
    discountEarned: 'İndirim uygulandı',
    discountPerDish: 'Puanlanan her yemek için 0,50 € indirim',
    unlockAfterServed: 'Masaya servis edildikten sonra açılır',
    simulatedServeDish: 'Servis edildi olarak işaretle',
    dishServed: 'Masaya servis edildi',
    dishPreparing: 'Mutfakta hazırlanıyor',
    allergens: 'Alerjenler ve İçerik',
    prepTime: 'Hazırlık Süresi',
    minutes: 'dk',
    chefChoice: 'Şefin Özel Seçimi',
    topOfCategory: 'Kategori Favorisi',
    starRating: 'Yıldız',
    noDishesFound: 'Aramanıza uygun yemek bulunamadı',
    yourCart: 'Siparişiniz',
    subtotal: 'Ara Toplam',
    reviewDiscount: 'Değerlendirme İndirimi',
    deliveryFee: 'Teslimat Ücreti',
    tip: 'Bahşiş',
    total: 'Toplam Tutar',
    checkout: 'Siparişi Tamamla',
    proceedToPayment: 'Şimdi Öde',
    payWithPayPal: 'PayPal ile Öde',
    payWithCard: 'Kredi Kartı / Apple Pay',
    digitalReceipt: 'Dijital Fiş',
    orderSentSuccess: 'Siparişiniz mutfağa iletildi!',
    emptyCart: 'Sepetiniz boş',
    googleMapsTitle: 'Google Haritalar’da Restoranı Değerlendir',
    googleMapsSubtitle: 'Yemek puanlarınız otomatik olarak Google inceleme taslağı oluşturur.',
    suggestedRating: 'Önerilen Genel Puan',
    foodRating: 'Yemek ve Lezzet',
    serviceRating: 'Hizmet ve İlgi',
    ambienceRating: 'Atmosfer',
    speedRating: 'Servis Hızı',
    valueRating: 'Fiyat-Performans',
    copyAndOpenMaps: 'Yorumu kopyala ve Google Haritalar’ı aç',
    copiedNotice: 'Yorum panoya kopyalandı!',
    thankYouReview: 'Desteğiniz için çok teşekkür ederiz!',
    analyticsTab: 'Google Analytics ve Canlı Trafik',
    realtimeTraffic: 'Gerçek Zamanlı Ziyaretçiler ve Etkinlikler',
    activeVisitorsNow: 'Şu an çevrimiçi aktif konuklar',
    pageViewsToday: 'Bugünkü sayfa görüntülemeleri',
    dishConversion: 'Menü dönüşüm oranı',
    connectGoogleAnalytics: 'Google Analytics 4 Bağla',
    measurementId: 'GA4 Ölçüm Kimliği',
    sendTestEvent: 'GA4’e test etkinliği gönder',
    liveEventStream: 'Canlı Etkinlik Akışı',
    gdprCompliant: 'KVKK / GDPR Uyumlu (Çerezsiz)',
    tableReservation: 'Masa Ayırt',
    reserveTableNow: 'Hemen Rezervasyon Yap',
    guestsCount: 'Kişi sayısı',
    dateTime: 'Tarih ve Saat'
  },
  pl: {
    menu: 'Cyfrowe Menu',
    waiterTerminal: 'Terminal Kelnerski',
    kitchenMonitor: 'Ekran Kuchenny',
    operatorDashboard: 'Właściciel',
    printExport: 'Drukuj Menu',
    cart: 'Koszyk',
    switchRestaurant: 'Zmień restaurację',
    table: 'Stolik',
    tableStand: 'Stojak z kodem QR',
    dineIn: 'Na miejscu (Stolik)',
    delivery: 'Dostawa',
    pickup: 'Odbiór osobisty',
    selectFulfillment: 'Wybierz formę zamówienia',
    searchPlaceholder: 'Szukaj dań, składników, win...',
    allCategories: 'Wszystkie kategorie',
    filterAll: 'Wszystkie dania',
    filterTopRated: 'Najwyżej oceniane (4.7+)',
    filterUnrated: 'Jeszcze nieocenione',
    filterChef: 'Rekomendacja Szefa Kuchni',
    addToCart: 'Dodaj do koszyka',
    inCart: 'W koszyku',
    rateDish: 'Oceń to danie',
    rateDishPrompt: 'Oceń i zyskaj rabat',
    discountEarned: 'Rabat naliczony',
    discountPerDish: '0,50 € rabatu za każde ocenione danie',
    unlockAfterServed: 'Aktywne po podaniu do stolika',
    simulatedServeDish: 'Oznacz jako podane',
    dishServed: 'Podane do stolika',
    dishPreparing: 'W przygotowaniu w kuchni',
    allergens: 'Alergeny i składniki',
    prepTime: 'Czas przygotowania',
    minutes: 'min',
    chefChoice: 'Specjalność Szefa Kuchni',
    topOfCategory: 'Ulubione w kategorii',
    starRating: 'Gwiazdki',
    noDishesFound: 'Nie znaleziono pasujących dań',
    yourCart: 'Twoje zamówienie',
    subtotal: 'Suma częściowa',
    reviewDiscount: 'Rabat za opinie',
    deliveryFee: 'Koszt dostawy',
    tip: 'Napiwek',
    total: 'Łączna kwota',
    checkout: 'Przejdź do kasy',
    proceedToPayment: 'Zapłać teraz',
    payWithPayPal: 'Płać przez PayPal',
    payWithCard: 'Karta płatnicza / Apple Pay',
    digitalReceipt: 'Elektroniczny paragon',
    orderSentSuccess: 'Zamówienie przesłane prosto do kuchni!',
    emptyCart: 'Twój koszyk jest pusty',
    googleMapsTitle: 'Oceń restaurację w Google Maps',
    googleMapsSubtitle: 'Twoje oceny poszczególnych dań automatycznie tworzą gotową recenzję.',
    suggestedRating: 'Sugerowana ocena ogólna',
    foodRating: 'Jedzenie i Smak',
    serviceRating: 'Obsługa i Gościnność',
    ambienceRating: 'Klimat i Wystrój',
    speedRating: 'Szybkość obsługi',
    valueRating: 'Stosunek ceny do jakości',
    copyAndOpenMaps: 'Skopiuj opinię i otwórz Google Maps',
    copiedNotice: 'Opinia skopiowana do schowka!',
    thankYouReview: 'Bardzo dziękujemy za Twoją opinię!',
    analyticsTab: 'Google Analytics i Ruch na Żywo',
    realtimeTraffic: 'Odwiedzający i Aktywność w Czasie Rzeczywistym',
    activeVisitorsNow: 'Aktywni goście online',
    pageViewsToday: 'Wyświetlenia stron dzisiaj',
    dishConversion: 'Wskaźnik konwersji menu',
    connectGoogleAnalytics: 'Połącz z Google Analytics 4',
    measurementId: 'Identyfikator pomiaru GA4',
    sendTestEvent: 'Wyślij zdarzenie testowe do GA4',
    liveEventStream: 'Transmisja aktywności na żywo',
    gdprCompliant: 'Zgodne z RODO (Bez plików cookie)',
    tableReservation: 'Zarezerwuj stolik',
    reserveTableNow: 'Zarezerwuj teraz',
    guestsCount: 'Liczba osób',
    dateTime: 'Data i godzina'
  },
  uk: {
    menu: 'Цифрове Меню',
    waiterTerminal: 'Термінал Офіціанта',
    kitchenMonitor: 'Екран Кухні',
    operatorDashboard: 'Панель Керування',
    printExport: 'Друк Меню',
    cart: 'Кошик',
    switchRestaurant: 'Змінити ресторан',
    table: 'Стіл',
    tableStand: 'QR-Підставка на столі',
    dineIn: 'У закладі (Стіл)',
    delivery: 'Доставка',
    pickup: 'Самовивіз',
    selectFulfillment: 'Спосіб замовлення',
    searchPlaceholder: 'Пошук страв, інгредієнтів, напоїв...',
    allCategories: 'Усі категорії',
    filterAll: 'Усі страви',
    filterTopRated: 'Найвищий рейтинг (4.7+)',
    filterUnrated: 'Ще без оцінок',
    filterChef: 'Вибір Шефа',
    addToCart: 'До кошика',
    inCart: 'У кошику',
    rateDish: 'Оцінити страву',
    rateDishPrompt: 'Оцініть та отримайте знижку',
    discountEarned: 'Знижку нараховано',
    discountPerDish: 'Знижка 0,50 € за кожну оцінену страву',
    unlockAfterServed: 'Доступно після подачі до столу',
    simulatedServeDish: 'Позначити як подану',
    dishServed: 'Подано до столу',
    dishPreparing: 'Готується на кухні',
    allergens: 'Алергени та склад',
    prepTime: 'Час приготування',
    minutes: 'хв',
    chefChoice: 'Фірмова страва Шефа',
    topOfCategory: 'Хіт категорії',
    starRating: 'Зірки',
    noDishesFound: 'Страв за запитом не знайдено',
    yourCart: 'Ваше замовлення',
    subtotal: 'Проміжний підсумок',
    reviewDiscount: 'Знижка за відгуки',
    deliveryFee: 'Вартість доставки',
    tip: 'Чайові',
    total: 'Загальна сума',
    checkout: 'Оформити замовлення',
    proceedToPayment: 'Оплатити зараз',
    payWithPayPal: 'Оплата через PayPal',
    payWithCard: 'Банківська картка / Apple Pay',
    digitalReceipt: 'Електронний чек',
    orderSentSuccess: 'Замовлення надіслано на кухню!',
    emptyCart: 'Ваш кошик порожній',
    googleMapsTitle: 'Оцінити заклад у Google Maps',
    googleMapsSubtitle: 'Ваші оцінки окремих страв формують детальний відгук для Google Maps.',
    suggestedRating: 'Рекомендований загальний бал',
    foodRating: 'Їжа та Смак',
    serviceRating: 'Сервіс та Гостинність',
    ambienceRating: 'Атмосфера',
    speedRating: 'Швидкість обслуговування',
    valueRating: 'Співвідношення ціна/якість',
    copyAndOpenMaps: 'Скопіювати відгук і відкрити Google Maps',
    copiedNotice: 'Відгук скопійовано в буфер обміну!',
    thankYouReview: 'Щиро дякуємо за ваш відгук!',
    analyticsTab: 'Google Analytics та Трафік',
    realtimeTraffic: 'Відвідувачі та активність у реальному часі',
    activeVisitorsNow: 'Активні гості онлайн зараз',
    pageViewsToday: 'Перегляди сторінок сьогодні',
    dishConversion: 'Конверсія переглядів у замовлення',
    connectGoogleAnalytics: 'Підключити Google Analytics 4',
    measurementId: 'Ідентифікатор відстеження GA4',
    sendTestEvent: 'Надіслати тестову подію в GA4',
    liveEventStream: 'Стрічка подій у реальному часі',
    gdprCompliant: 'Сумісно з GDPR (Без cookie)',
    tableReservation: 'Забронювати стіл',
    reserveTableNow: 'Забронювати зараз',
    guestsCount: 'Кількість гостей',
    dateTime: 'Дата та час'
  },
  zh: {
    menu: '电子菜单',
    waiterTerminal: '服务员终端',
    kitchenMonitor: '后厨大屏',
    operatorDashboard: '管理后台',
    printExport: '打印菜单',
    cart: '购物车',
    switchRestaurant: '切换餐厅',
    table: '桌号',
    tableStand: '餐桌立牌',
    dineIn: '堂食（餐桌扫码）',
    delivery: '外卖配送',
    pickup: '到店自取',
    selectFulfillment: '就餐方式',
    searchPlaceholder: '搜索菜品、食材或饮品...',
    allCategories: '全部类别',
    filterAll: '全部菜品',
    filterTopRated: '最高评分 (4.7+)',
    filterUnrated: '尚待评价',
    filterChef: '主厨推荐',
    addToCart: '加入购物车',
    inCart: '已在购物车',
    rateDish: '评价此菜品',
    rateDishPrompt: '评价享立减优惠',
    discountEarned: '立减已生效',
    discountPerDish: '每评价一道菜可享 0.50 € 立减',
    unlockAfterServed: '上菜至餐桌后即可解锁评价',
    simulatedServeDish: '标记为已上菜',
    dishServed: '已上菜至餐桌',
    dishPreparing: '厨房制作中',
    allergens: '过敏原与食材说明',
    prepTime: '制作用时',
    minutes: '分钟',
    chefChoice: '主厨招牌',
    topOfCategory: '品类人气之冠',
    starRating: '星级',
    noDishesFound: '未找到符合条件的菜品',
    yourCart: '我的点餐',
    subtotal: '小计',
    reviewDiscount: '菜品好评立减',
    deliveryFee: '配送费',
    tip: '小费',
    total: '实付总额',
    checkout: '去结账',
    proceedToPayment: '立即支付',
    payWithPayPal: 'PayPal 支付',
    payWithCard: '信用卡 / Apple Pay',
    digitalReceipt: '电子小票 (TSE合规)',
    orderSentSuccess: '订单已直接发送至后厨！',
    emptyCart: '购物车空空如也',
    googleMapsTitle: '在 Google 地图评价餐厅',
    googleMapsSubtitle: '您对单道菜品的评分将自动整合成 Google 地图优质真实好评。',
    suggestedRating: '推荐综合评分',
    foodRating: '美味与口感',
    serviceRating: '服务与热情',
    ambienceRating: '环境与氛围',
    speedRating: '上菜速度',
    valueRating: '性价比',
    copyAndOpenMaps: '一键复制好评并打开 Google 地图',
    copiedNotice: '好评文本已复制到剪贴板！',
    thankYouReview: '衷心感谢您的宝贵评价与支持！',
    analyticsTab: 'Google Analytics 与实时访客',
    realtimeTraffic: '实时访客与活动追踪',
    activeVisitorsNow: '当前在线就餐客人',
    pageViewsToday: '今日页面浏览量',
    dishConversion: '菜单点单转化率',
    connectGoogleAnalytics: '接入 Google Analytics 4',
    measurementId: 'GA4 衡量 ID',
    sendTestEvent: '向 GA4 发送测试事件',
    liveEventStream: '实时动态流',
    gdprCompliant: '符合欧盟 GDPR 隐私标准 (无Cookie)',
    tableReservation: '在线订座',
    reserveTableNow: '立即预订桌位',
    guestsCount: '就餐人数',
    dateTime: '日期与时间'
  }
};

// Multilingual preset dictionaries for dishes
interface LocalizedDishInfo {
  name: string;
  description: string;
}

const DISH_TRANSLATIONS: Record<string, Partial<Record<LanguageCode, LocalizedDishInfo>>> = {
  dish_pasta_tartufo: {
    en: {
      name: 'Fresh Black Truffle Tagliatelle',
      description: 'Handmade fresh egg pasta tossed in whipped Alpine butter, 24-month Parmigiano Reggiano DOP, topped generously with shaved black summer truffles.'
    },
    fr: {
      name: 'Tagliatelles à la Truffe Noire Fraîche',
      description: 'Pâtes fraîches aux œufs faites maison, beurre monté fermier, Parmigiano Reggiano DOP 24 mois et généreuses lamelles de truffe noire d’été fraîchement râpées.'
    },
    it: {
      name: 'Tagliatelle al Tartufo Fresco',
      description: 'Pasta all’uovo fresca fatta in casa, burro di malga mantecato, Parmigiano Reggiano DOP 24 mesi e abbondante tartufo estivo nero a scaglie.'
    },
    es: {
      name: 'Tagliatelle con Trufa Negra Fresca',
      description: 'Pasta fresca al huevo hecha a mano, mantequilla de montaña, Parmigiano Reggiano DOP de 24 meses y abundante trufa negra de verano rallada al momento.'
    },
    nl: {
      name: 'Verse Zwarte Truffel Tagliatelle',
      description: 'Huisgemaakte verse eierpasta met geklopte bergboter, 24 maanden gerijpte Parmigiano Reggiano DOP en royaal geschaafde verse zwarte zomertruffel.'
    },
    tr: {
      name: 'Taze Siyah Trüflü Tagliatelle',
      description: 'Taze el yapımı yumurtalı makarna, çırpılmış dağ tereyağı, 24 aylık Parmigiano Reggiano DOP ve bol taze rendelenmiş siyah yaz trüfü.'
    },
    zh: {
      name: '现刨夏季黑松露手工宽面',
      description: '手工新鲜意式鸡蛋宽面，配高山牧场黄油、24个月熟成帕马森干酪 DOP，豪爽现刨新鲜黑夏季松露。'
    }
  },
  dish_bistecca_fiorentina: {
    en: {
      name: 'Bistecca Fiorentina Tagliata (300g)',
      description: 'Dry-aged bone-in beef sirloin, charcoal-grilled medium-rare, served with roasted rosemary potatoes, fleur de sel and fresh salsa verde.'
    },
    fr: {
      name: 'Bistecca Fiorentina Tagliata (300g)',
      description: 'Faux-filet de bœuf maturé sur os, grillé rosé au feu de bois, accompagné de pommes de terre au romarin, fleur de sel et salsa verde maison.'
    },
    it: {
      name: 'Bistecca Fiorentina Tagliata (300g)',
      description: 'Lombata di manzo dry-aged frollata all’osso, grigliata alla brace al sangue, patate al rosmarino, fior di sale e salsa verde artigianale.'
    },
    es: {
      name: 'Bistecca Fiorentina Tagliata (300g)',
      description: 'Lomo de ternera madurado con hueso, a la brasa en punto jugoso, con patatas al romero, flor de sal y salsa verde fresca.'
    },
    zh: {
      name: '意式佛罗伦萨厚切牛排 (300g)',
      description: '干式熟成带骨牛里脊，木炭明火香烤至五分熟，佐迷迭香烤土豆、海盐花与新鲜秘制意式青酱。'
    }
  },
  dish_burrata_pugliese: {
    en: {
      name: 'Apulian Burrata with Datterini Tomatoes',
      description: 'Creamy artisan Burrata from Puglia, colorful datterini cherry tomatoes, house-made basil pesto, 12-year aged balsamic glaze and toasted focaccia.'
    },
    fr: {
      name: 'Burrata des Pouilles & Tomates Datterini',
      description: 'Burrata crémeuse des Pouilles, tomates datterini gorgées de soleil, pesto au basilic maison, vinaigre balsamique 12 ans d’âge et focaccia croustillante.'
    },
    it: {
      name: 'Burrata Pugliese con Pomodorini',
      description: 'Cremosa burrata pugliese, pomodorini datterini variopinti, pesto al basilico fatto in casa, aceto balsamico di Modena 12 anni e focaccia calda.'
    },
    es: {
      name: 'Burrata de Apulia con Tomatitos Datterini',
      description: 'Cremosa burrata artesanal de Puglia, tomates datterini multicolores, pesto casero de albahaca, vinagre balsámico de Módena y focaccia tostada.'
    },
    zh: {
      name: '普利亚特级布拉塔奶酪佐番茄',
      description: '产自意大利普利亚的丝滑布拉塔水牛乳酪、缤纷达泰里尼小番茄、手作罗勒青酱、12年陈酿摩德纳黑醋及烤意式佛卡夏。'
    }
  },
  dish_tiramisu_tradizionale: {
    en: {
      name: 'Classic House Tiramisù',
      description: 'Prepared after an authentic family recipe with silky mascarpone cream, Piedmontese espresso, Savoiardi ladyfingers and dusting of bitter Valrhona cocoa.'
    },
    fr: {
      name: 'Tiramisù Traditionnel Maison',
      description: 'Préparé selon la recette familiale avec mascarpone onctueux, espresso italien, biscuits Savoiardi et généreuse poudre de cacao Valrhona.'
    },
    it: {
      name: 'Tiramisù Tradizionale della Casa',
      description: 'Preparato secondo l’antica ricetta di famiglia con mascarpone vellutato, espresso piemontese, savoiardi inzuppati e cacao amaro Valrhona.'
    },
    es: {
      name: 'Tiramisù Tradicional de la Casa',
      description: 'Elaborado según la receta de la abuela con suave mascarpone, café espresso de Piamonte, bizcochos Savoiardi y cacao puro Valrhona.'
    },
    zh: {
      name: '主厨秘制经典意式提拉米苏',
      description: '传承意国家族古法配方：丝滑特浓马斯卡彭奶油、皮埃蒙特浓缩咖啡、浸润萨沃亚迪手指饼干，轻覆法芙娜纯黑可可粉。'
    }
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof Translations) => string;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  getLocalizedDish: (dish: Dish) => { name: string; description: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ryp_selected_language') as LanguageCode;
      if (stored && TRANSLATIONS_DATA[stored]) {
        return stored;
      }
      // Check browser language
      const browserLang = navigator.language?.substring(0, 2).toLowerCase() as LanguageCode;
      if (browserLang && TRANSLATIONS_DATA[browserLang]) {
        return browserLang;
      }
    }
    return 'de';
  });

  const setLanguage = (newLang: LanguageCode) => {
    trackLanguageChange(language, newLang);
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ryp_selected_language', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: keyof Translations): string => {
    const langData = TRANSLATIONS_DATA[language] || TRANSLATIONS_DATA['de'];
    return langData[key] || TRANSLATIONS_DATA['de'][key] || String(key);
  };

  const getLocalizedDish = (dish: Dish): { name: string; description: string } => {
    const dishTranslations = DISH_TRANSLATIONS[dish.id];
    if (dishTranslations && dishTranslations[language]) {
      return {
        name: dishTranslations[language]!.name,
        description: dishTranslations[language]!.description
      };
    }
    return {
      name: dish.name,
      description: dish.description
    };
  };

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
        getLocalizedDish
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
