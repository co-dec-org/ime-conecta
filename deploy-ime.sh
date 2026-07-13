#!/usr/bin/env bash
# ============================================================
#  DEPLOY · IME CONECTA  (y solo este proyecto)
#  Actualiza git + publica en Vercel únicamente esta carpeta.
#  Uso:   ./deploy-ime.sh "mensaje del commit"
# ============================================================
set -euo pipefail

DIR="$HOME/Desktop/GitHub/IME Conecta"
REPO_ESPERADO="ime-conecta"   # el remoto debe contener esto

cd "$DIR"

# 1) Verificar que la carpeta esté enlazada al proyecto Vercel correcto
if [ ! -f ".vercel/project.json" ]; then
  echo "ABORTADO: falta enlazar con Vercel. Corre primero:  vercel link"
  exit 1
fi

# 2) Si hay git, verificar remoto y respaldar
if git rev-parse --git-dir >/dev/null 2>&1; then
  REMOTO="$(git remote get-url origin 2>/dev/null || echo '')"
  if [[ -n "$REMOTO" && "$REMOTO" != *"$REPO_ESPERADO"* ]]; then
    echo "ABORTADO: el remoto no es Conecta (remoto: $REMOTO)"; exit 1
  fi
  MSG="${1:-Actualización Conecta $(date '+%Y-%m-%d %H:%M')}"
  git add -A
  if git diff --cached --quiet; then echo "· Sin cambios que commitear."; else git commit -m "$MSG"; fi
  git push 2>/dev/null || echo "· (git push omitido: sin remoto o sin permisos)"
fi

# 3) Publicar en producción
echo "· Publicando en Vercel (producción)…"
vercel --prod --yes

echo "LISTO · Conecta actualizado"
