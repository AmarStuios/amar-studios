#!/bin/bash
# Script de deploiement AMAR Studios — auto pull + push
# Usage: ./deploy.sh "message de commit"

set -e

cd "$(dirname "$0")"

# Nettoyer un eventuel lock
rm -f .git/index.lock 2>/dev/null || true

MSG="${1:-update}"

echo "==> Ajout des modifications..."
git add -A

if git diff --cached --quiet; then
  echo "==> Pas de nouvelle modification a commiter"
else
  echo "==> Commit : $MSG"
  git commit -m "$MSG"
fi

echo "==> Synchronisation avec GitHub (pull rebase)..."
git pull --rebase --autostash || true

echo "==> Push vers GitHub..."
git push

echo ""
echo "==> OK — Vercel et Render redeploient automatiquement"
echo "    Vercel : 1-2 minutes"
echo "    Render : 3-5 minutes"
