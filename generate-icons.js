const https = require('https');
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');

// Create public dir if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download logo from WordPress
function downloadLogo() {
  return new Promise((resolve, reject) => {
    const logoPath = path.join(publicDir, 'logo-original.jpg');
    const file = fs.createWriteStream(logoPath);

    https.get('https://vincula-formation.com/wp-content/uploads/2025/12/icone-e1767854840484.jpg', (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Logo téléchargé');
        resolve(logoPath);
      });
    }).on('error', reject);
  });
}

// Create simple icon with Vincula V
function createIconWithCanvas(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - Teal color
  ctx.fillStyle = '#0D9488';
  ctx.fillRect(0, 0, size, size);

  // White V
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(size * 0.6)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', size / 2, size / 2);

  return canvas;
}

// Generate icons
function generateIcons() {
  try {
    // Generate favicon (32x32)
    const favicon32 = createIconWithCanvas(32);
    fs.writeFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      favicon32.toBuffer('image/png')
    );
    console.log('✅ Favicon 32x32 créé');

    // Generate favicon (16x16)
    const favicon16 = createIconWithCanvas(16);
    fs.writeFileSync(
      path.join(publicDir, 'favicon-16x16.png'),
      favicon16.toBuffer('image/png')
    );
    console.log('✅ Favicon 16x16 créé');

    // Generate PWA icons (192x192, 512x512)
    const icon192 = createIconWithCanvas(192);
    fs.writeFileSync(
      path.join(publicDir, 'icon-192x192.png'),
      icon192.toBuffer('image/png')
    );
    console.log('✅ Icon 192x192 créé');

    const icon512 = createIconWithCanvas(512);
    fs.writeFileSync(
      path.join(publicDir, 'icon-512x512.png'),
      icon512.toBuffer('image/png')
    );
    console.log('✅ Icon 512x512 créé');

    // Create/update favicon.ico (simple PNG will work as fallback)
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );
    console.log('✅ Favicon.ico créé');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error.message);
    throw error;
  }
}

// Main
async function main() {
  try {
    console.log('🚀 Génération des icônes Vincula...\n');

    // Try to download logo, but continue if it fails
    try {
      await downloadLogo();
    } catch (err) {
      console.warn('⚠️  Impossible de télécharger le logo, utilisation du logo par défaut');
    }

    generateIcons();

    console.log('\n✅ Toutes les icônes ont été générées avec succès!');
    console.log('📍 Fichiers créés dans: ' + publicDir);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
