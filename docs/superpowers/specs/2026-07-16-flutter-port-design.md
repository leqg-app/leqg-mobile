# Portage Flutter de l'application LeQG

**Date** : 2026-07-16
**Objectif** : recréer l'application React Native LeQG (v4.1.0-beta.9) en Flutter, dans le dossier `flutter/`, à fonctionnalités et présentation identiques. L'app RN existante est la spécification de référence ; aucun changement de comportement, de wording ni de mise en page n'est souhaité.

## Périmètre fonctionnel (identique à l'app RN)

1. **Intro** (premier lancement) : 2 écrans de présentation swipables + écran de demande de géolocalisation.
2. **Onglet Carte** : carte Mapbox plein écran affichant les bars avec leur prix le moins cher (icône tooltip + prix), nom sous le marqueur, cercles « 5 MIN »/« 15 MIN » autour de la position, FAB « + » (ajout de bar par appui long → géocodage inverse Google), FAB « target » (recentrage), barre de recherche (écran de recherche plein écran avec historique 5 entrées), 4 filtres (Prix avec histogramme + range slider, Bière(s) avec recherche + ET/OU, Horaires avec jours + plage horaire + histogramme des prix moyens, Caractéristiques), bottom sheet du bar sélectionné (2 crans : aperçu 170px et plein écran avec top bar animée + menu ⋮).
3. **Fiche bar** (contenu du sheet) : actions Itinéraire/Partager/Enregistrer/Appeler, photos, bouton de validation « J'y suis » (géoloc < 40 m, gain de réputation), adresse, horaires repliables (tableau 7 jours + Happy hour), « Voir la carte » (produits), site web/téléphone, caractéristiques, avis (note moyenne + note personnelle + donner une note), « Mis à jour il y a … ».
4. **Carte des bières d'un bar** : liste groupée Pression/Bouteille, colonnes volume/Prix/HH, mode édition (crayon → sélection produit, variantes, devise), FAB « + ».
5. **Édition d'un bar** : nom, adresse (autocomplete Google Places), carte des bières, horaires (édition par jour ou « Tout modifier », time picker), caractéristiques, photos (sélection image + légende + upload), téléphone, site internet, historique des révisions.
6. **Notation** : 3 critères (qualité/prix, lieu, accueil) → note finale, publication → écran « WonReputation » (cercle de progression animé + points gagnés).
7. **Onglet Bières** : liste alphabétique des produits.
8. **Onglet Enregistrés** : favoris de l'utilisateur (connexion requise), suppression par étoile, navigation vers la carte.
9. **Onglet Compte** : anonyme (Connexion/Inscription/pourquoi s'inscrire/Préférences) ou connecté (cercle de niveau + réputation, Mon profil avec suppression de compte, Mes contributions paginées, Préférences avec devise préférée, Se déconnecter). Auth locale (pseudo/mdp), Google, Apple (iOS), inscription via provider (choix du pseudo), mot de passe oublié.
10. **Données hors-ligne** : bars en SQLite, entités (produits, taux de change, caractéristiques) + user + versions en stockage clé/valeur ; synchronisation incrémentale par versions (`/v1/version`, `/v2/stores`, `/v2/stores/versions/a..b`) avec reset si `reset`/version d'app changent.
11. **Divers** : thème clair/sombre MD3 (mêmes couleurs), textes 100 % français identiques, dialogues « Connexion requise », snackbars, Sentry.

## Correspondance des briques techniques

| React Native | Flutter |
|---|---|
| react-native-paper (MD3) | Material 3 natif, `ColorScheme` clair/sombre identiques à `src/theme.js` |
| React Navigation (stacks + bottom tabs) | `Navigator` imbriqués par onglet + `NavigationBar` MD3, routes racines via `Navigator` global |
| Jotai (atomes) | Riverpod (`flutter_riverpod`) : providers équivalents atome par atome |
| MMKV | `shared_preferences` (mêmes clés : `user`, `versions`, `mapPosition`, `searchHistory`, `firstOpen`, `userCurrencyCode`, `appVersion`, `products`, `rates`, `features`) |
| op-sqlite + drizzle | `sqflite`, table `store` au même schéma |
| @rnmapbox/maps | `mapbox_maps_flutter` : GeoJsonSource + SymbolLayer/CircleLayer/LineLayer, mêmes expressions de filtre/prix |
| @gorhom/bottom-sheet | `DraggableScrollableSheet` (sheet bar) + `showModalBottomSheet` (filtres/actions) |
| react-native-rheostat | widget custom : histogramme (barres) + `RangeSlider` |
| react-native-star-rating-widget | widget custom d'étoiles (demi-étoiles en lecture) |
| geolocation-service + permissions | `geolocator` |
| google-signin / apple-authentication | `google_sign_in` / `sign_in_with_apple` |
| react-native-share | `share_plus` |
| image-crop-picker | `image_picker` |
| Linking (tel/maps/web) | `url_launcher` |
| react-native-config (.env) | `flutter_dotenv` (copie du `.env` racine) |
| Sentry RN | `sentry_flutter` (même DSN, désactivé en debug) |
| date-fns formatDistance fr | fonction utilitaire dédiée (français, mêmes libellés « il y a … ») |
| Google Places autocomplete | appels HTTP directs (autocomplete + details) + UI dédiée |
| bootsplash | écran de démarrage Flutter natif par défaut |

## Architecture cible (`flutter/lib/`)

```
main.dart                    // Sentry, thème, MaterialApp, routes racines (≙ App.js + Routes.js)
theme.dart                   // ColorSchemes clair/sombre identiques
constants.dart               // jours, LEVELS, DEFAULT_MAP, api endpoint, version
models/                      // Store, Schedule, StoreProduct, Product, FeatureGroup, Rate, User…
store/  storage.dart, database.dart, atoms.dart (providers), filter_atoms.dart,
        entities_actions.dart, store_actions.dart, hooks.dart (favoris)
api/    client.dart, stores.dart, users.dart, products.dart, rates.dart, features.dart
utils/  time.dart, price.dart, coordinates.dart, format_store.dart, reputation.dart,
        sorter.dart, url.dart, error_message.dart, log_error.dart, location.dart, search_place.dart
components/                  // action_sheet, action_buttons, filter_chip, menu, badge, title,
                             // products_list, features_list, search_bar, price, animated_circle,
                             // animated_text, version_name, social_button, star_rating, bar_rheostat
containers/
  tabs.dart
  intro/ (intro, location_permission)
  map/ (map_screen, mapbox_map, store_sheet, create_store_sheet, search_store,
        store_sheet_menu, filters/{filters,price,product,schedule,feature})
  store/ (store, schedules, schedules_preview, store_products, store_features,
          store_rates, store_validate, rating_store, store_actions)
  edit_store/ (edit_store, edit_product, select_product, edit_schedules, edit_address,
               edit_features, select_currency, add_photo, history)
  account/ (account, anonym, sign_in, sign_up, sign_up_provider, reset_password,
            profile, contributions, settings, won_reputation, providers/{google,apple})
  favorites/ favorites.dart
  products/ products.dart
assets/ countries.json, currencies.json, icône logo, tooltip-50.png
```

Chaque fichier Dart correspond 1:1 à son homologue JS pour faciliter la maintenance croisée.

## Points de conception notables

- **Prix affiché sur la carte** : comme en RN, la logique « prix le plus bas / happy hour en cours » est calculée côté state (provider `storesProvider`), et les filtres carte sont traduits en expressions Mapbox identiques (`mapboxState`).
- **Providers Riverpod** : `userProvider` (persisté), `sheetStoreProvider`, `storesProvider` (+ dérivé `storesMapProvider` en FeatureCollection), `productFilter/priceFilter/featureFilter/scheduleFilter/mapBounds`, `productsProvider`, `ratesProvider`, `featuresProvider`, `storeLoadingProvider`, `storeEditionProvider`, `storeFamily(id)` (fetch au premier accès), `contributionsProvider`.
- **Erreurs/offline** : mêmes messages (« Aucune connexion internet », « Une erreur est survenue… »), même écran « réessayer » dans le sheet.
- **Sync** : reprise exacte de `entitiesActions.js` (reset, versions incrémentales, appVersion).
- **Plateformes** : permissions localisation (Info.plist / AndroidManifest), token Mapbox (clé publique dans `.env`, secret pour le téléchargement SDK), scheme `maps:`/Google Maps URL pour l'itinéraire.

## Tests et vérification

- `flutter analyze` sans erreur.
- Tests unitaires Dart pour les utilitaires portés à logique non triviale : `time`, `price`, `format_store` (décompression), `coordinates`, `reputation`, logique `storeCoversFilterTime`/`storeMatchesScheduleFilter` (mêmes cas que la logique JS).
- Build debug iOS/Android.

## Hors périmètre

- Detox/e2e, fastlane, release-it, patch-package (outillage RN).
- Aucune évolution fonctionnelle.
