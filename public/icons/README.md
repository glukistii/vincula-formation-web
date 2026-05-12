# Icônes PWA

Les 6 fichiers PNG dans ce dossier sont des icônes générées **algorithmiquement** aux couleurs Vincula (teal `#0D9488` + V blanc, coins arrondis pour la version "any", plein carré pour la version "maskable").

C'est un placeholder propre, suffisant pour la mise en production. Si tu veux remplacer par le **vrai logo Vincula** plus tard :

1. Prends le fichier source haute résolution (idéalement carré, ≥ 1024×1024).
2. Va sur https://realfavicongenerator.net (ou https://maskable.app pour la version maskable).
3. Upload, exporte le pack, remplace les fichiers de ce dossier :
   - `icon-192.png` (192×192)
   - `icon-512.png` (512×512)
   - `icon-512-maskable.png` (512×512, avec safe zone ~10 %)
   - `apple-touch-icon.png` (180×180)
   - `favicon-32.png` (32×32)
4. Pas besoin de toucher au manifest, les noms restent identiques.
