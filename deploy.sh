#!/bin/bash
# Script de deploiement rapide AMAR Studios
# Usage: ./deploy.sh "message de commit"

set -e

cd "$(dirname "$0")"

MSG="${1:-update}"

echo "==> Ajout des modifications..."
git add -A

if git diff --cached --quiet; then
  echo "==> Aucune modification a deployer"
  exit 0
fi

echo "==> Commit : $MSG"
git commit -m "$MSG"

echo "==> Push vers GitHub..."
git push

echo ""
echo "Site sera redeploye automatiquement :"
echo "  - Vercel (frontend) : 1-2 minutes"
echo "  - Render (backend)  : 3-5 minutes"
echo ""
echo "Voir l'avancement :"
echo "  - https://vercel.com/dashboard"
echo "  - https://dashboard.render.com"
