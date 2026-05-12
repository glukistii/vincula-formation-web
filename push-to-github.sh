#!/bin/bash

# Script de push automatisé pour Vincula Formation
# Double-cliquez ce fichier pour exécuter!

echo "🚀 Démarrage du push vers GitHub..."
echo ""

cd ~/vincula-formation-web

echo "📋 Étape 1: Vérifier les changements..."
git status
echo ""

echo "📦 Étape 2: Ajouter les fichiers..."
git add .
echo "✅ Fichiers ajoutés"
echo ""

echo "💾 Étape 3: Créer le commit..."
git commit -m "feat: add API proxy route and auth UI"
echo "✅ Commit créé"
echo ""

echo "🌐 Étape 4: Pousser vers GitHub..."
git push origin main
echo "✅ Push complété!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SUCCÈS! Vercel va redéployer en 1-2 minutes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Vérifiez: https://vincula-formation-web.vercel.app"
echo ""
echo "Appuyez sur une touche pour fermer..."
read
