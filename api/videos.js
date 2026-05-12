// File: api/videos.js
// Vercel serverless function that proxies the WordPress API
export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://www.vincula-formation.com/wp-json/wp/v2/posts?per_page=10'
    );

    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}`);
    }

    const data = await response.json();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message
    });
  }
}
