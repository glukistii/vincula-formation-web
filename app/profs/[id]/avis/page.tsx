'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';

interface Professeur {
  id: string;
  prenom: string;
  nom: string;
}

export default function AvisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profId = params.id as string;
  const reservationId = searchParams.get('reservation_id');

  const [prof, setProf] = useState<Professeur | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch('/api/cours-prives/appreciations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prof_id: profId,
          reservation_id: reservationId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        alert('Avis publié avec succès!');
        router.push('/mes-reservations');
      } else {
        alert('Erreur lors de la publication de l\'avis');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/mes-reservations" className="text-teal-400 hover:text-teal-300 mb-6 inline-block">
          ← Retour aux réservations
        </Link>

        <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
          <h1 className="text-3xl font-bold text-white mb-2">Laisser un avis</h1>
          <p className="text-slate-400 mb-8">
            Votre avis sur {prof.prenom} {prof.nom}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-4">
                Note
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={`${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-white font-semibold mt-2">{rating}/5 étoiles</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec cette séance..."
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? 'Publication en cours...' : 'Publier mon avis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
