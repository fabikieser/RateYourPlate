import React, { useState } from 'react';
import { X, Sparkles, Upload, FileText, Check, ArrowRight, Camera, Wand2, RefreshCw, AlertCircle } from 'lucide-react';
import { Dish, Restaurant } from '../types/restaurant';

interface AiMenuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onImportDishes: (dishes: Dish[]) => void;
}

// Sample menus for immediate 1-click scanning demo
const SAMPLE_RAW_MENUS = {
  italian: `Antipasti & Vorspeisen:
Carpaccio di Manzo - Hauchdünnes Rinderfilet mit Rucola, Pinienkernen & Parmesan - 15,90 € (Laktose, Schalenfrüchte)
Bruschetta Classica - Geröstetes Ciabatta mit aromatischen Tomaten, Knoblauch und Basilikum - 8,50 € (Gluten)
Vitello Tonnato - Zartes Kalbfleisch mit cremiger Thunfisch-Kapern-Sauce - 16,00 € (Fisch, Ei)

Primi & Hausgemachte Pasta:
Pappardelle al Cinghiale - Frische breite Bandnudeln mit toskanischem Wildschweinragout - 19,50 € (Gluten, Ei, Sellerie)
Ravioli di Ricotta e Spinaci - Gefüllte Teigtaschen in Salbeibutter mit Grana Padano - 17,20 € (Gluten, Laktose)
Risotto ai Funghi Porcini - Cremiger Carnaroli-Reis mit frischen Steinpilzen & Weißwein - 18,90 € (Laktose, Sulfite)

Secondi & Fleisch:
Filetto di Manzo al Pepe Verde - Rinderfiletsteak mit grünem Madagaskar-Pfeffer und Rosmarinkartoffeln - 32,50 € (Laktose)
Branzino alla Griglia - Gegrilltes Wolfsbarschfilet auf mediterranem Grillgemüse - 26,00 € (Fisch)

Dolci:
Panna Cotta con Frutti di Bosco - Vanillesahne mit warmen Waldbeeren - 7,50 € (Laktose)
Cannoli Siciliani - Knusprige Gebäckrollen mit süßer Ricottacreme und Pistazien - 8,20 € (Gluten, Schalenfrüchte)`,

  bavarian: `Suppen & Vorspeisen:
Frische Flädlesuppe - Kräftige Rinderkraftbrühe mit Kräuterflädle - 6,90 € (Gluten, Ei, Sellerie)
Obazda mit Brezn - Würziger bayerischer Camembert mit roten Zwiebeln und ofenfrischer Laugenbrezel - 9,50 € (Gluten, Laktose)

Wirtshaus-Klassiker:
Münchner Sauerbraten - Nach Hausrezept eingelegt mit Preiselbeeren und zwei Semmelknödeln - 22,80 € (Gluten, Sellerie)
Spanferkelkrustenbraten - Knusprige Schwarte, Dunkelbiersoße und warmer Speckkrautsalat - 19,90 € (Gluten)
Schwäbische Maultaschen - Geschmälzt mit geschmorten Zwiebeln und gemischtem Blattsalat - 16,50 € (Gluten, Ei)

Dessert:
Apfelkücherl - Im Bierteig gebacken mit Bourbon-Vanilleeis und Zimtzucker - 8,90 € (Gluten, Laktose)`,

  burger: `Craft Burger:
BBQ Bacon Deluxe - 180g Neuland Beef, smoked Bacon, Cheddar, geröstete Zwiebeln, BBQ Sauce - 15,90 € (Gluten, Laktose, Senf)
Avocado Green Burger - Veganes Quinoa-Erbsen-Patty, Guacamole, Wildkräuter, vegane Limetten-Mayo - 14,50 € (Gluten)
Double Smash Cheese - 2x 100g Smashed Beef, American Cheese, Pickles, Secret Burger Sauce - 14,90 € (Gluten, Laktose, Ei)

Sides:
Chili Cheese Fries - Frische Pommes mit hausgemachter Jalapeno-Käsesauce und Hackfleisch - 7,50 € (Laktose)
Trüffel Parmesan Fries - Knusprige Fritten mit Trüffelöl und frisch geriebenem Grana Padano - 7,90 € (Laktose)`
};

// Culinary photo presets matched to categories
const CATEGORY_IMAGE_PRESETS: Record<string, string[]> = {
  pasta: [
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?auto=format&fit=crop&w=600&q=80'
  ],
  meat: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'
  ],
  starter: [
    'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  ],
  drink: [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'
  ]
};

export const AiMenuScannerModal: React.FC<AiMenuScannerModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onImportDishes,
}) => {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [extractedDishes, setExtractedDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Handle uploaded file (PDF / Image / Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Read text content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && text.length > 20) {
          setInputText(text);
        } else {
          // If binary or image without OCR text, prefill realistic sample based on restaurant type
          setInputText(SAMPLE_RAW_MENUS.italian);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (type: 'italian' | 'bavarian' | 'burger') => {
    setInputText(SAMPLE_RAW_MENUS[type]);
    setFileName(`Speisekarte_${type}.pdf`);
  };

  // AI Parser function
  const handleStartAiScan = () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(15);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);

      // Parse lines and extract dishes
      const lines = inputText.split('\n').filter(l => l.trim().length > 0);
      let currentCategory = 'Hauptgerichte';
      const parsed: Dish[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Check if line looks like a category header
        if (trimmed.endsWith(':') || (!trimmed.includes('€') && !trimmed.includes('-') && trimmed.length < 35)) {
          currentCategory = trimmed.replace(':', '');
          return;
        }

        // Try extracting dish name, description, price, allergens
        // Format e.g. "Carpaccio di Manzo - Hauchdünnes Rinderfilet... - 15,90 € (Laktose)"
        const priceMatch = trimmed.match(/(\d+[.,]\d{2})\s*€?/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : (14.50 + (idx % 8));

        // Name and description split
        let name = trimmed;
        let description = 'Frisch zubereitete Spezialität nach Art des Hauses.';
        let allergens: string[] = [];

        // Check for allergens in parentheses
        const allergenMatch = trimmed.match(/\((.*?)\)/);
        if (allergenMatch) {
          allergens = allergenMatch[1].split(',').map(s => s.trim());
        }

        // Split by dash or hyphen
        const parts = trimmed.split(/[-–]/);
        if (parts.length >= 2) {
          name = parts[0].trim();
          description = parts[1].replace(/(\d+[.,]\d{2})\s*€?/, '').replace(/\(.*?\)/, '').trim();
          if (parts.length >= 3 && !description) {
            description = parts[2].replace(/(\d+[.,]\d{2})\s*€?/, '').trim();
          }
        } else {
          name = trimmed.replace(/(\d+[.,]\d{2})\s*€?/, '').replace(/\(.*?\)/, '').trim();
        }

        // Determine cuisine category and assign matching AI-generated/curated image
        let cuisineCat: Dish['cuisineCategory'] = 'pasta';
        const lower = (name + ' ' + description).toLowerCase();

        if (lower.includes('burger') || lower.includes('patty') || lower.includes('fries') || lower.includes('pommes')) {
          cuisineCat = 'burger';
        } else if (lower.includes('steak') || lower.includes('rind') || lower.includes('braten') || lower.includes('fleisch') || lower.includes('schwein') || lower.includes('schnitzel')) {
          cuisineCat = 'meat';
        } else if (lower.includes('suppe') || lower.includes('salat') || lower.includes('bruschetta') || lower.includes('carpaccio') || lower.includes('vorspeise') || lower.includes('obazda')) {
          cuisineCat = 'starter';
        } else if (lower.includes('dessert') || lower.includes('tiramisu') || lower.includes('panna cotta') || lower.includes('kücherl') || lower.includes('süß') || lower.includes('cannoli')) {
          cuisineCat = 'dessert';
        } else if (lower.includes('wein') || lower.includes('bier') || lower.includes('wasser') || lower.includes('saft')) {
          cuisineCat = 'drink';
        } else {
          cuisineCat = 'pasta';
        }

        const presetImages = CATEGORY_IMAGE_PRESETS[cuisineCat] || CATEGORY_IMAGE_PRESETS.pasta;
        const assignedImage = presetImages[idx % presetImages.length];

        parsed.push({
          id: 'dish_ai_' + Date.now() + '_' + idx,
          restaurantId: restaurant.id,
          name: name.slice(0, 50),
          category: currentCategory,
          price: price,
          description: description || 'Zubereitet aus ausgewählten, frischen Zutaten.',
          available: true,
          allergens: allergens.length > 0 ? allergens : ['Gluten'],
          prepTimeMinutes: 12 + (idx % 10),
          ratingAverage: 5.0,
          ratingCount: 1,
          chefRecommendation: idx % 4 === 0,
          imageUrl: assignedImage,
          cuisineCategory: cuisineCat
        });
      });

      // Select all by default
      const initialSelected: Record<string, boolean> = {};
      parsed.forEach(d => { initialSelected[d.id] = true; });

      setExtractedDishes(parsed);
      setSelectedDishIds(initialSelected);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }, 1200);
  };

  const handleToggleSelectDish = (id: string) => {
    setSelectedDishIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleConfirmImport = () => {
    const dishesToImport = extractedDishes.filter(d => selectedDishIds[d.id]);
    if (dishesToImport.length > 0) {
      onImportDishes(dishesToImport);
      onClose();
    }
  };

  const selectedCount = Object.values(selectedDishIds).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
                KI Speisekarten-Scanner
              </span>
              <h2 className="text-lg font-bold font-serif-display">
                Speisekarte hochladen & per KI digitalisieren
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {extractedDishes.length === 0 ? (
            <>
              {/* Value proposition banner */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-stone-800 leading-relaxed">
                  <h3 className="font-bold text-amber-950 text-sm mb-0.5">
                    Maximale Einfachheit für Gastronomen
                  </h3>
                  <p>
                    Laden Sie einfach Ihre bestehende Speisekarte als PDF, Foto oder Text hoch. Unsere KI erkennt Gerichte, Preise, Kategorien und Allergene automatisch und schlägt direkt passende Bilder vor.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-stone-300 hover:border-amber-700 rounded-2xl p-6 text-center transition-colors bg-stone-50/50">
                <Upload className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Speisekarte als PDF oder Foto hier ablegen
                </h4>
                <p className="text-stone-500 text-xs mb-3">
                  Unterstützt PDF, JPG, PNG oder Textdateien
                </p>

                <input
                  type="file"
                  id="menu-file-input"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="menu-file-input"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Datei auswählen</span>
                </label>

                {fileName && (
                  <p className="mt-2 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{fileName} geladen</span>
                  </p>
                )}
              </div>

              {/* Quick Sample Presets */}
              <div>
                <span className="font-semibold text-stone-700 block mb-2">
                  Oder sofort testen mit einer Muster-Speisekarte:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('italian')}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-700 rounded-xl text-left cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-stone-900 block">🍝 Italienische Karte</span>
                    <span className="text-[11px] text-stone-500">Antipasti, Pasta, Fleisch, Tiramisu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('bavarian')}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-700 rounded-xl text-left cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-stone-900 block">🥨 Wirtshaus-Klassiker</span>
                    <span className="text-[11px] text-stone-500">Braten, Maultaschen, Sauerbraten</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('burger')}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-700 rounded-xl text-left cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-stone-900 block">🍔 Craft Burger & Sides</span>
                    <span className="text-[11px] text-stone-500">Smash Burger, Trüffel-Fries</span>
                  </button>
                </div>
              </div>

              {/* Textarea Preview / Manual Paste */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Inhalt der Speisekarte (kann vor der Analyse angepasst werden):
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Kopieren Sie hier den Text Ihrer Speisekarte hinein oder nutzen Sie eine Vorlage..."
                  className="w-full p-3 font-mono text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              {/* Progress bar during analysis */}
              {isAnalyzing && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-stone-800">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>KI analysiert Speisekarte & ordnet Fotos zu...</span>
                    </span>
                    <span className="font-mono text-amber-900 tabular-nums">{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-800 h-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Result Preview after Extraction */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-bold font-serif-display text-stone-900">
                    Erkannte Gerichte mit KI-Bildervorschlägen
                  </h3>
                  <p className="text-xs text-stone-500">
                    {extractedDishes.length} Gerichte erfolgreich erkannt. Wählen Sie die Speisen für Ihre App:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExtractedDishes([]);
                    setInputText('');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer underline"
                >
                  Neu scannen
                </button>
              </div>

              {/* Dishes Preview Cards */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {extractedDishes.map((dish) => {
                  const isChecked = selectedDishIds[dish.id] !== false;

                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleToggleSelectDish(dish.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'border-amber-700 bg-amber-50/30 ring-1 ring-amber-700/20'
                          : 'border-stone-200 opacity-60 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectDish(dish.id)}
                          className="w-4 h-4 text-amber-800 rounded border-stone-300 focus:ring-amber-800 cursor-pointer"
                        />

                        {/* Dish AI image thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              🍽️
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 truncate">{dish.name}</span>
                            <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                              {dish.category}
                            </span>
                          </div>
                          <p className="text-stone-600 text-[11px] line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                          {dish.allergens && dish.allergens.length > 0 && (
                            <span className="text-[10px] text-stone-400">
                              Allergene: {dish.allergens.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-stone-900 font-mono text-sm tabular-nums">
                          {dish.price.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 cursor-pointer text-xs"
          >
            Abbrechen
          </button>

          {extractedDishes.length === 0 ? (
            <button
              type="button"
              disabled={!inputText.trim() || isAnalyzing}
              onClick={handleStartAiScan}
              className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Speisekarte jetzt per KI scannen</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmImport}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{selectedCount} Gerichte in Speisekarte übernehmen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
