'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: string;
  prof_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  zoom_url?: string;
  professeurs?: {
    prenom: string;
    nom: string;
  };
}

export default function MesReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [pastReservations, setPastReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/cours-prives/reservations');
        if (res.ok) {
          const data = await res.json();
          setReservations(data);

          // Separate upcoming and past
          const now = new Date();
          const upcoming = data.filter(
            (r: Reservation) => new Date(r.scheduled_at) > now
          );
          const past = data.filter(
            (r: Reservation) => new Date(r.scheduled_at) <= now
          );

          setUpcomingReservations(upcoming.sort((a: Reservation, b: Reservation) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          ));
          setPastReservations(past.sort((a: Reservation, b: Reservation) =>
            new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
          ));
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleJoinMeeting = (reservation: Reservation) => {
    if (reservation.status === 'confirmed' && reservation.zoom_url) {
      window.open(reservation.zoom_url, '_blank');
    } else {
      alert('La séance n\'est pas encore disponible');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">📚 Mes Réservations</h1>

        {/* Upcoming */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">À venir</h2>

          {upcomingReservations.length === 0 ? (
            <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
              <p className="text-slate-400 mb-4">Vous n\'avez pas de séance prévue</p>
              <Link
                href="/cours-prives"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Réserver une séance
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => {
                const scheduledDate = new Date(reservation.scheduled_at);
                const isStarted = new Date() >= scheduledDate;

                return (
                  <div
                    key={reservation.id}
                    className="bg-slate-700/50 rounded-lg p-6 border border-teal-500/30 hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {reservation.professeurs?.prenom} {reservation.professeurs?.nom}
                        </h3>
                        <p className="text-slate-300 mb-2">
                          📅 {scheduledDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-slate-300 mb-2">
                          🕐 {scheduledDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - 45 min
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          Statut:{' '}
                          <span className={`font-semibold ${
                            reservation.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {reservation.status === 'confirmed'
                              ? 'Confirmée'
                              : 'En attente'}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isStarted && reservation.status === 'confirmed' && (
                          <button
                            onClick={() => handleJoinMeeting(reservation)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                          >
                            🎥 Rejoindre
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Historique</h2>

          {pastReservations.length === 0 ? (
            <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
              <p className="text-slate-400">Aucune séance terminée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastReservations.map((reservation) => {
                const scheduledDate = new Date(reservation.scheduled_at);

                return (
                  <div
                    key={reservation.id}
                    className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {reservation.professeurs?.prenom} {reservation.professeurs?.nom}
                        </h3>
                        <p className="text-slate-400 mb-2">
                          {scheduledDate.toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <Link
                        href={`/profs/${reservation.prof_id}/avis?reservation_id=${reservation.id}`}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        ⭐ Laisser un avis
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
