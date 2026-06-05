'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Professeur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  bio?: string;
  diplome?: string;
  specialites?: string[];
  localisation?: string;
  experience_years?: number;
  rate_per_session: number;
}

interface Appreciation {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export default function ProfPage() {
  const params = useParams();
  const profId = params.id as string;

  const [prof, setProf] = useState<Professeur | null>(null);
  const [reviews, setReviews] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch professor details
        const profRes = await fetch(`/api/professeurs/${profId}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          setProf(profData);
        }

        // Fetch reviews
        const reviewRes = await fetch(`/api/cours-prives/appreciations?prof_id=${profId}`);
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);

          if (reviewData.length > 0) {
            const avg =
              reviewData.reduce((sum: number, r: Appreciation) => sum + r.rating, 0) /
              reviewData.length;
            setAvgRating(Math.round(avg * 10) / 10);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profId]);

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
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link href="/cours-prives" className="text-teal-400 hover:text-teal-300 mb-6 inline-block">
          ← Retour au catalogue
        </Link>

        {/* Professor header */}
        <div className="bg-slate-700/50 rounded-lg p-8 mb-8 border border-slate-600">
          <div className="flex gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white">
                {prof.prenom[0]}
                {prof.nom[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {prof.prenom} {prof.nom}
              </h1>
              <p className="text-slate-300 mb-2">{prof.email}</p>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {Array(Math.round(avgRating))
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} size={20} fill="currentColor" />
                      ))}
                  </div>
                  <span className="text-white font-semibold">{avgRating}</span>
                  <span className="text-slate-400">({reviews.length} avis)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Expérience</p>
              <p className="text-white font-semibold">
                {prof.experience_years || '?'} ans
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Tarif</p>
              <p className="text-teal-400 font-semibold">€{prof.rate_per_session}/séance</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Localisation</p>
              <p className="text-white font-semibold">{prof.localisation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Diplôme</p>
              <p className="text-white font-semibold">{prof.diplome || 'N/A'}</p>
            </div>
          </div>

          {/* Bio */}
          {prof.bio && (
            <div className="mt-6 pt-6 border-t border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-2">À propos</h3>
              <p className="text-slate-300">{prof.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {prof.specialites && prof.specialites.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3">Spécialités</h3>
              <div className="flex flex-wrap gap-2">
                {prof.specialites.map((spec) => (
                  <span
                    key={spec}
                    className="bg-teal-900/50 text-teal-300 px-3 py-1 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-8 pt-6 border-t border-slate-600">
            <Link
              href={`/profs/${profId}/reserver`}
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📅 Réserver une séance
            </Link>
          </div>
        </div>

        {/* Reviews section */}
        <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
          <h2 className="text-2xl font-bold text-white mb-6">Avis des étudiants</h2>

          {reviews.length === 0 ? (
            <p className="text-slate-400">Aucun avis pour le moment</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-600 pb-6 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={18} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-white font-semibold">{review.rating}/5</span>
                  </div>
                  {review.comment && (
                    <p className="text-slate-300">{review.comment}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
