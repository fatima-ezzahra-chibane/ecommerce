#!/usr/bin/env bash
# Lance Expo sans npm installé sur la machine (utilise Docker + Node)
set -euo pipefail
cd "$(dirname "$0")"

# IP du PC accessible depuis le téléphone (obligatoire sur téléphone physique)
# VirtualBox : utilise l'IP WiFi du PC HÔTE, pas 10.0.2.15 de la VM
API_HOST_IP="${API_HOST_IP:-${EXPO_PUBLIC_API_URL:-}}"
if [ -z "$API_HOST_IP" ] || [[ "$API_HOST_IP" == http* ]]; then
  API_HOST_IP="${API_HOST_IP:-$(hostname -I | awk '{print $1}')}"
fi
# Si on a passé une URL complète par erreur, extraire l'IP
if [[ "$API_HOST_IP" == http* ]]; then
  API_HOST_IP=$(echo "$API_HOST_IP" | sed -E 's|https?://([^:/]+).*|\1|')
fi

export EXPO_PUBLIC_API_URL="http://${API_HOST_IP}:8080/api/v1"
# tunnel | lan (défaut, recommandé VirtualBox) | auto (essaie tunnel puis LAN)
EXPO_MODE="${EXPO_MODE:-lan}"
# FORCE_INSTALL=1 pour forcer un npm install complet
FORCE_INSTALL="${FORCE_INSTALL:-0}"

echo "==> Démarrage Expo via Docker"
echo "    API mobile : $EXPO_PUBLIC_API_URL"
echo "    Mode Expo  : $EXPO_MODE"
echo ""

if [[ "$API_HOST_IP" == 10.0.2.* ]]; then
  echo "!!! VirtualBox détecté — le téléphone ne peut PAS utiliser $API_HOST_IP"
  echo ""
  echo "    1. Sur ton PC (hôte), trouve ton IP WiFi : ipconfig (Windows) ou ifconfig"
  echo "       Exemple : 192.168.1.10"
  echo ""
  echo "    2. VirtualBox > VM > Paramètres > Réseau > NAT > Redirection de ports :"
  echo "       Hôte 8080  ->  Invité 10.0.2.15  Port 8080   (API Laravel)"
  echo "       Hôte 8081  ->  Invité 10.0.2.15  Port 8081   (Metro bundler)"
  echo "       Hôte 19000 ->  Invité 10.0.2.15  Port 19000  (Expo dev server)"
  echo "       Hôte 19001 ->  Invité 10.0.2.15  Port 19001  (optionnel)"
  echo ""
  echo "    3. Relance avec l'IP du PC hôte :"
  echo "       API_HOST_IP=192.168.1.10 ./start.sh"
  echo ""
  read -r -p "    Continuer quand même avec $API_HOST_IP ? [o/N] " ans
  [[ "${ans,,}" == "o" || "${ans,,}" == "oui" || "${ans,,}" == "y" ]] || exit 1
fi

# Corriger fichiers créés par root lors d'un ancien lancement Docker
if [ -f package-lock.json ] && [ ! -w package-lock.json ]; then
  echo "==> Correction des permissions (mot de passe sudo possible)..."
  sudo chown -R "$(id -u):$(id -g)" package.json package-lock.json app.json 2>/dev/null || true
fi

# Libère les ports si un ancien conteneur Expo tourne encore
for port in 8081 19000 19001; do
  ids=$(docker ps -q --filter "publish=${port}" 2>/dev/null || true)
  if [ -n "$ids" ]; then
    echo "==> Arrêt de l'ancien conteneur Expo (port ${port})..."
    docker stop $ids >/dev/null 2>&1 || true
  fi
done

echo "==> Lancement du conteneur Expo..."
echo "    (si node_modules existe déjà, npm install est ignoré → démarrage rapide)"
echo ""

docker run -it --rm \
  -v "$(pwd):/app" \
  -v vivid_mobile_node_modules:/app/node_modules \
  -w /app \
  -p 8081:8081 \
  -p 19000:19000 \
  -p 19001:19001 \
  -e "EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL" \
  -e "EXPO_MODE=$EXPO_MODE" \
  -e "API_HOST_IP=$API_HOST_IP" \
  -e "FORCE_INSTALL=$FORCE_INSTALL" \
  -e "REACT_NATIVE_PACKAGER_HOSTNAME=$API_HOST_IP" \
  node:22-alpine \
  sh -c '
    set -e
    NEED_INSTALL=0
    if [ "$FORCE_INSTALL" = "1" ]; then
      NEED_INSTALL=1
    elif [ ! -d node_modules/expo ] || [ ! -d node_modules/@expo/cli ]; then
      NEED_INSTALL=1
    fi

    if [ "$NEED_INSTALL" = "1" ]; then
      echo "==> Installation des dépendances (peut prendre plusieurs minutes)..."
      npm install --legacy-peer-deps
    else
      echo "==> Dépendances déjà présentes — skip npm install"
    fi

    echo "==> Mode ${EXPO_MODE} (exp://${API_HOST_IP}:8081)"
    if [ "$EXPO_MODE" = "lan" ]; then
      npx expo start --lan
    elif [ "$EXPO_MODE" = "tunnel" ]; then
      npx expo start --tunnel
    else
      echo "==> Tentative tunnel ngrok..."
      npx expo start --tunnel || {
        echo ""
        echo "!!! Tunnel ngrok indisponible — passage en mode LAN"
        npx expo start --lan
      }
    fi
  '
