'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Professeur {
  id: string;
  prenom: string;
  nom: string;
  rate_per_session: number;
}

export default function ReserverPage() {
  const params = useParams();
  const router = useRouter();
  const profId = params.id as string;

  const [prof, setProf] = useState<Professeur | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const res = await fetch(`/api/professeurs/${profId}`);
        if (res.ok) {
          setProf(await res.json());
        }
      } catch (error) {
        console.error('Error fetching professor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProf();
  }, [profId]);

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Generate time slots
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !prof) return;

    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();

      const res = await fetch('/api/cours-prives/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prof_id: profId,
          scheduled_at: scheduledAt,
          notes,
        }),
      });

      if (res.ok) {
        const reservation = await res.json();
        // Redirect to payment (stubbed)
        alert('Réservation créée! Veuillez passer au paiement.');
        router.push('/mes-reservations');
      } else {
        alert('Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  if (!prof) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Professeur non trouvé</p>
      </div>
    );
  }

  const dates = generateDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/profs/${profId}`} className="text-teal-400 hover:text-teal-300 mb-6 inline-block">
          ← Retour au profil
        </Link>

        <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
          <h1 className="text-3xl font-bold text-white mb-2">Réserver une séance</h1>
          <p className="text-slate-400 mb-8">
            Cours privé de 45 minutes avec votre professeur
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Sélectionnez une date</option>
                {dates.map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  });
                  return (
                    <option key={date} value={date}>
                      {dayName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Time selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Heure
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Décrivez vos objectifs ou questions pour cette séance..."
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
              />
            </div>

            {/* Summary */}
            <div className="bg-teal-900/30 border border-teal-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300">Date & Heure:</span>
                <span className="text-white font-semibold">
                  {selectedDate && selectedTime
                    ? `${new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('fr-FR')} à ${selectedTime}`
                    : 'À définir'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300">Durée:</span>
                <span className="text-white font-semibold">45 minutes</span>
              </div>
              <div className="flex justify-between items-center border-t border-teal-500/30 pt-3">
                <span className="text-white font-bold">Total:</span>
                <span className="text-teal-400 font-bold text-lg">€{prof.rate_per_session}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!selectedDate || submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? 'Réservation en cours...' : 'Procéder au paiement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
