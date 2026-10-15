import React, { useState } from 'react';
import { Calendar, Clock, Users, X, CheckCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { Restaurant, Reservation } from '../types/restaurant';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onMakeReservation: (res: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onMakeReservation,
}) => {
  const [guestName, setGuestName] = useState('Fabi Kieser');
  const [guestEmail, setGuestEmail] = useState('fabikieser@gmail.com');
  const [guestPhone, setGuestPhone] = useState('+49 170 1234567');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:30');
  const [partySize, setPartySize] = useState(2);
  const [tablePreference, setTablePreference] = useState('Terrasse');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    const newRes: Reservation = {
      id: 'res_' + Math.floor(1000 + Math.random() * 9000),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      date,
      time,
      partySize,
      tablePreference,
      specialRequests: specialRequests.trim(),
      status: 'bestätigt',
      createdAt: 'Gerade eben'
    };

    onMakeReservation(newRes);
    setCreatedReservation(newRes);
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setCreatedReservation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <span className="text-xs text-amber-300 font-medium tracking-wide">
              {restaurant.name} · {restaurant.city}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif-display">
              Tisch online reservieren
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConfirmed && createdReservation ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold font-serif-display text-stone-900">
              Tisch erfolgreich reserviert!
            </h3>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Reservierungs-ID:</span>
                <span className="font-mono font-bold text-stone-900">#{createdReservation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Datum & Uhrzeit:</span>
                <span className="font-semibold text-stone-900">{createdReservation.date} um {createdReservation.time} Uhr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Personen:</span>
                <span className="font-semibold text-stone-900">{createdReservation.partySize} Personen ({createdReservation.tablePreference})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Name:</span>
                <span className="font-semibold text-stone-900">{createdReservation.guestName}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 text-left flex items-start gap-2">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Bestätigung versendet</p>
                <p className="text-[11px] text-emerald-800">
                  Eine Reservierungsbestätigung wurde automatisch an <strong>{createdReservation.guestEmail}</strong> gesendet.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Fertig & zur Speisekarte
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Promo note */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2 text-stone-800">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Kostenlose Sofort-Bestätigung. Bei Ihrem Besuch am Tisch scannen & sparen!</span>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Datum</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Uhrzeit</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                >
                  {['12:00', '12:30', '13:00', '13:30', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((t) => (
                    <option key={t} value={t}>{t} Uhr</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guests & Table Preference */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  <span>Anzahl Gäste</span>
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'Personen'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Bereich / Wunschplatz
                </label>
                <select
                  value={tablePreference}
                  onChange={(e) => setTablePreference(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                >
                  <option value="Innenbereich">Innenbereich</option>
                  <option value="Terrasse / Außen">Terrasse / Außenbereich</option>
                  <option value="Fensterplatz">Fensterplatz</option>
                  <option value="Ruhige Ecke">Ruhige Ecke</option>
                </select>
              </div>
            </div>

            {/* Contact details */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Vollständiger Name
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="z.B. Maximilian Mustermann"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>E-Mail (für Bestätigung)</span>
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@beispiel.de"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Telefonnummer</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+49 170 1234567"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Special requests */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Besondere Wünsche oder Anmerkungen (optional)
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="z.B. Geburtstag, Kinderstuhl, Allergien..."
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg cursor-pointer shadow-xs transition-colors"
              >
                Jetzt verbindlich reservieren
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
