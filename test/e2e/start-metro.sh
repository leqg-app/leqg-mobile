#!/bin/bash

# Vérifie si Metro est déjà en cours d'exécution
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "Metro bundler est déjà en cours d'exécution sur le port 8081"
    exit 0
fi

echo "Démarrage du Metro bundler..."
yarn start &
METRO_PID=$!

# Attendre que Metro soit prêt
echo "En attente que Metro soit prêt..."
for i in {1..30}; do
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
        echo "Metro bundler est prêt!"
        exit 0
    fi
    sleep 1
done

echo "Timeout: Metro bundler n'a pas démarré dans les 30 secondes"
kill $METRO_PID 2>/dev/null
exit 1
