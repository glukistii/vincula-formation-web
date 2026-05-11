'use client'

import { useEffect, useState } from 'react'
import './page.css'

interface Video {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  _links?: {
    'wp:featuredmedia'?: Array<{
      href: string
    }>
  }
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        'https://www.vincula-formation.com/wp-json/wp/v2/posts?categories=4&per_page=10'
      )
      if (!response.ok) throw new Error('Erreur de chargement')
      const data = await response.json()
      setVideos(data)
      if (data.length > 0) {
        setSelectedVideo(data[0])
      }
    } catch (err) {
      setError('Impossible de charger les vidéos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>🎬 Vincula Formation</h1>
        <p>Lecteur vidéo & e-commerce</p>
      </header>

      <main>
        {loading && <div className="loading">Chargement...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="grid">
            <div className="player-section">
              {selectedVideo ? (
                <div className="video-player">
                  <div className="placeholder">
                    <div className="play-icon">▶️</div>
                    <p>{selectedVideo.title.rendered}</p>
                  </div>
                  <div className="description">
                    <h2>{selectedVideo.title.rendered}</h2>
                    <div dangerouslySetInnerHTML={{ __html: selectedVideo.content.rendered }} />
                  </div>
                </div>
              ) : (
                <div className="empty">Aucune vidéo disponible</div>
              )}
            </div>

            <aside className="playlist">
              <h3>📚 Formations</h3>
              <div className="video-list">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    className={`video-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <span className="thumbnail">🎥</span>
                    <span className="title">{video.title.rendered}</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer>
        <p>© 2024 Vincula Formation • Formations vidéo professionnelles</p>
      </footer>
    </div>
  )
}
