# Le QG — Flutter

Portage Flutter de l'application React Native (dossier parent). Toutes les
fonctionnalités et la présentation sont identiques à l'app RN ; chaque fichier
Dart correspond à son homologue JS (voir
`docs/superpowers/specs/2026-07-16-flutter-port-design.md`).

## Prérequis

1. **Variables d'environnement** : copier le `.env` de la racine du repo dans
   ce dossier (`cp ../.env .env`). Il contient `MAPBOX_API_KEY`,
   `GOOGLE_MAPS_API_KEY`, `GOOGLE_WEB_CLIENT_ID` et `MAPBOX_SECRET_KEY`.
2. **Android** : le token secret Mapbox est lu automatiquement depuis `.env`
   (ou depuis `MAPBOX_SECRET_KEY` dans `gradle.properties`, ou la variable
   d'environnement `MAPBOX_DOWNLOADS_TOKEN`).
3. **iOS** : le SDK Mapbox nécessite un fichier `~/.netrc` :

   ```
   machine api.mapbox.com
     login mapbox
     password <MAPBOX_SECRET_KEY>
   ```

## Commandes

```sh
flutter pub get
flutter run            # lance l'app
flutter test           # tests unitaires (logique portée du JS)
flutter analyze        # lint
flutter build apk      # build Android
flutter build ios      # build iOS
```

## Architecture

- `lib/store/` : état (Riverpod, ≙ atomes Jotai), storage
  (SharedPreferences, ≙ MMKV), base SQLite (≙ op-sqlite/drizzle),
  synchronisation par versions.
- `lib/api/` : client HTTP + endpoints api.leqg.app.
- `lib/containers/` : écrans, même découpage que `src/containers/`.
- `lib/components/` : composants partagés (≙ `src/components/`).
- `lib/utils/` : logique métier portée à l'identique (horaires, prix,
  filtres…), couverte par `test/utils_test.dart`.
