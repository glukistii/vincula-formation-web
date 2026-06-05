'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Professeur {
  id: string;
  prenom: string;
  nom: string;
  bio?: string;
  specialites?: string[];
  localisation?: string;
  rate_per_session: number;
  rating?: number;
  review_count?: number;
}

export default function CoursPrivesPage() {
  const [profs, setProfs] = useState<Professeur[]>([]);
  const [filteredProfs, setFilteredProfs] = useState<Professeur[]>([]);
  const [specialteFilter, setSpecialteFilter] = useState('');
  const [localisationFilter, setLocalisationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const res = await fetch('/api/professeurs');
        if (res.ok) {
          const data = await res.json();
          setProfs(data);
          setFilteredProfs(data);
        }
      } catch (error) {
        console.error('Error fetching professeurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfs();
  }, []);

  useEffect(() => {
    let filtered = profs;

    if (specialteFilter) {
      filtered = filtered.filter((prof) =>
        prof.specialites?.some((s) =>
          s.toLowerCase().includes(specialteFilter.toLowerCase())
        )
      );
    }

    if (localisationFilter) {
      filtered = filtered.filter((prof) =>
        prof.localisation?.toLowerCase().includes(localisationFilter.toLowerCase())
      );
    }

    setFilteredProfs(filtered);
  }, [specialteFilter, localisationFilter, profs]);

  const allSpecialties = Array.from(
    new Set(profs.flatMap((p) => p.specialites || []))
  ).sort();
  const allLocations = Array.from(
    new Set(profs.map((p) => p.localisation || 'N/A'))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 Cours Privés</h1>
          <p className="text-slate-300">
            Trouvez le professeur idéal pour vos cours privés BCMA
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Spécialité
              </label>
              <select
                value={specialteFilter}
                onChange={(e) => setSpecialteFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Toutes les spécialités</option>
                {allSpecialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Région
              </label>
              <select
                value={localisationFilter}
                onChange={(e) => setLocalisationFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Toutes les régions</option>
                {allLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-400">Chargement des professeurs...</p>
          </div>
        )}

        {/* Professors Grid */}
        {!loading && (
          <>
            <p className="text-slate-300 mb-6">
              {filteredProfs.length} professeur{filteredProfs.length !== 1 ? 's' : ''} trouvé{filteredProfs.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfs.map((prof) => (
                <Link
                  key={prof.id}
                  href={`/profs/${prof.id}`}
                  className="bg-slate-700/50 rounded-lg p-6 hover:bg-slate-600/50 transition-colors group cursor-pointer border border-slate-600"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">
                      {prof.prenom[0]}
                      {prof.nom[0]}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                    {prof.prenom} {prof.nom}
                  </h3>

                  {/* Rating */}
                  {prof.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400">
                        {Array(Math.round(prof.rating))
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                      </div>
                      <span className="text-sm text-slate-300">
                        ({prof.review_count || 0} avis)
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {prof.bio && (
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                      {prof.bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {prof.specialites && prof.specialites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {prof.specialites.slice(0, 2).map((spec) => (
                        <span
                          key={spec}
                          className="text-xs bg-teal-900/50 text-teal-300 px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {prof.specialites.length > 2 && (
                        <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                          +{prof.specialites.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {prof.localisation && (
                    <p className="text-sm text-slate-400 mb-3">📍 {prof.localisation}</p>
                  )}

                  {/* Rate */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-400">
                      €{prof.rate_per_session}
                    </span>
                    <span className="text-sm text-slate-400">/séance</span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProfs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Aucun professeur ne correspond à vos critères</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
