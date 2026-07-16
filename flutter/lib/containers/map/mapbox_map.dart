import 'dart:async';
import 'dart:convert';
import 'dart:ui' as ui;

import 'package:flutter/material.dart' hide Visibility;
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart' as geo;
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';

import '../../constants.dart';
import '../../models/models.dart' as models;
import '../../store/atoms.dart';
import '../../store/filter_atoms.dart';
import '../../store/storage.dart';
import '../../utils/circle.dart';
import '../../utils/error_message.dart';
import '../../utils/location.dart';
import '../../utils/search_place.dart';
import 'create_store_sheet.dart';

String _cssColor(Color color) =>
    'rgba(${(color.r * 255).round()}, ${(color.g * 255).round()}, ${(color.b * 255).round()}, ${color.a})';

/// Port de src/containers/Map/Mapbox.js : carte, marqueurs de prix, cercles
/// 5/15 min, création de bar par appui long, FABs.
class MapboxMapView extends ConsumerStatefulWidget {
  const MapboxMapView({super.key});

  @override
  ConsumerState<MapboxMapView> createState() => _MapboxMapViewState();
}

class _MapboxMapViewState extends ConsumerState<MapboxMapView> {
  MapboxMap? _map;
  bool _styleReady = false;
  List<double>? _position;
  List<double>? _initialPosition;
  double? _initialZoomLevel;
  StreamSubscription<geo.Position>? _positionSub;
  Timer? _cameraSaveTimer;
  Timer? _focusTimer;

  @override
  void initState() {
    super.initState();
    final stored =
        Storage.getObject<Map<String, dynamic>>('mapPosition', {})!;
    if (stored['coordinates'] is List) {
      _initialPosition = (stored['coordinates'] as List)
          .map((c) => (c as num).toDouble())
          .toList();
      _initialZoomLevel = (stored['zoom'] as num?)?.toDouble();
    }

    // Au démarrage : tenter la géolocalisation
    () async {
      try {
        final position = await getLocation();
        setState(() {
          _position = position;
          _initialPosition = position;
          _initialZoomLevel = 13;
        });
        _watchPosition();
      } catch (_) {
        setState(() {
          _position = null;
          _initialPosition ??= [
            DefaultMap.centerCoordinates[0],
            DefaultMap.centerCoordinates[1]
          ];
          _initialZoomLevel ??= DefaultMap.zoomLevel;
        });
      }
    }();
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _cameraSaveTimer?.cancel();
    _focusTimer?.cancel();
    super.dispose();
  }

  void _watchPosition() {
    _positionSub ??= geo.Geolocator.getPositionStream(
      locationSettings: const geo.LocationSettings(distanceFilter: 10),
    ).listen((position) {
      _position = [position.longitude, position.latitude];
      _updateNearCircles();
    }, onError: (_) {});
    _map?.location
        .updateSettings(LocationComponentSettings(enabled: true));
  }

  // -- Mise à jour des sources/layers

  Future<void> _updateStoresSource() async {
    if (!_styleReady) return;
    final stores = ref.read(storesMapProvider);
    await _map?.style
        .setStyleSourceProperty('stores', 'data', jsonEncode(stores));
  }

  Future<void> _updateFilters() async {
    if (!_styleReady) return;
    final expressions = ref.read(mapboxProvider);
    final filter = jsonEncode(['all', ...expressions.filters]);
    final style = _map?.style;
    if (style == null) return;
    await style.setStyleLayerProperty('store', 'filter', filter);
    await style.setStyleLayerProperty('storeName', 'filter', filter);
    await style.setStyleLayerProperty(
        'store', 'text-field', jsonEncode(expressions.textField));
    await style.setStyleLayerProperty(
        'store', 'symbol-sort-key', jsonEncode(expressions.symbolSortKey));
    await style.setStyleLayerProperty(
        'store', 'text-size', jsonEncode(expressions.textSize));
  }

  Future<void> _updateFocusSource() async {
    if (!_styleReady) return;
    final sheetStore = ref.read(sheetStoreProvider);
    final collection = {
      'type': 'FeatureCollection',
      'features': sheetStore == null
          ? []
          : [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [sheetStore.longitude, sheetStore.latitude],
                },
                'properties': sheetStore.toJson(),
              }
            ],
    };
    await _map?.style
        .setStyleSourceProperty('storeFocus', 'data', jsonEncode(collection));
  }

  Future<void> _updateCreateStoreSource() async {
    if (!_styleReady) return;
    final createStore = ref.read(createStoreProvider);
    final data = createStore?.longitude != null
        ? {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [createStore!.longitude, createStore.latitude],
            },
            'properties': <String, dynamic>{},
          }
        : {'type': 'FeatureCollection', 'features': []};
    await _map?.style
        .setStyleSourceProperty('newStore', 'data', jsonEncode(data));
  }

  Future<void> _updateNearCircles() async {
    if (!_styleReady) return;
    final style = _map?.style;
    if (style == null) return;
    final empty = {'type': 'FeatureCollection', 'features': []};
    await style.setStyleSourceProperty(
        'near15',
        'data',
        jsonEncode(
            _position != null ? circlePolygon(_position!, 1) : empty));
    await style.setStyleSourceProperty(
        'near5',
        'data',
        jsonEncode(
            _position != null ? circlePolygon(_position!, 0.25) : empty));
  }

  Future<void> _onStyleLoaded(StyleLoadedEventData data) async {
    final map = _map;
    if (map == null) return;
    final colors = Theme.of(context).colorScheme;
    final style = map.style;

    // Icône tooltip des prix
    final bytes = await rootBundle.load('assets/tooltip-50.png');
    final image = await decodeImageFromList(bytes.buffer.asUint8List());
    final rgba = await image.toByteData(format: ui.ImageByteFormat.rawRgba);
    await style.addStyleImage(
        'tooltipIcon',
        1.0,
        MbxImage(
            width: image.width,
            height: image.height,
            data: rgba!.buffer.asUint8List()),
        false,
        [],
        [],
        null);

    final empty = jsonEncode({
      'type': 'geojson',
      'data': {'type': 'FeatureCollection', 'features': []},
    });
    for (final id in ['stores', 'storeFocus', 'newStore', 'near15', 'near5']) {
      await style.addStyleSource(id, empty);
    }

    final primary = _cssColor(colors.primary);

    // Prix des bars (≙ layerStyles.storePrice)
    await style.addStyleLayer(
        jsonEncode({
          'id': 'store',
          'type': 'symbol',
          'source': 'stores',
          'layout': {
            'icon-image': 'tooltipIcon',
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': '',
          },
          'paint': {
            'icon-translate': [0, -10],
            'text-color': '#fff',
            'text-translate': [0, -13],
          },
        }),
        null);

    // Nom des bars (≙ layerStyles.storeName)
    await style.addStyleLayer(
        jsonEncode({
          'id': 'storeName',
          'type': 'symbol',
          'source': 'stores',
          'minzoom': 10,
          'layout': {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-justify': 'auto',
            'text-variable-anchor': [
              'left',
              'right',
              'top',
              'bottom',
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right'
            ],
            'text-radial-offset': 1.4,
          },
          'paint': {
            'text-translate': [0, -11],
            'text-halo-width': 2.0,
            'text-color': _cssColor(colors.onSurface),
            'text-halo-color': _cssColor(colors.onSecondary),
          },
        }),
        LayerPosition(below: 'store'));

    // Bar sélectionné (≙ layerStyles.focusStore, couleur du thème constants)
    await style.addStyleLayer(
        jsonEncode({
          'id': 'storeFocusCircle',
          'type': 'circle',
          'source': 'storeFocus',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#163033',
            'circle-opacity': 0.5,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#163033',
            'circle-translate': [0, 1],
          },
        }),
        LayerPosition(above: 'store'));

    // Croix du nouveau bar
    await style.addStyleLayer(
        jsonEncode({
          'id': 'newStoreCross',
          'type': 'symbol',
          'source': 'newStore',
          'layout': {'text-field': '✕', 'text-size': 20},
          'paint': {'text-color': primary},
        }),
        null);

    // Cercles 5/15 minutes
    for (final circle in [
      {'id': '15', 'source': 'near15', 'minzoom': 11, 'text': '15 MIN'},
      {'id': '5', 'source': 'near5', 'minzoom': 14.5, 'text': '5 MIN'},
    ]) {
      await style.addStyleLayer(
          jsonEncode({
            'id': 'nearText${circle['id']}',
            'type': 'symbol',
            'source': circle['source'],
            'minzoom': circle['minzoom'],
            'layout': {
              'symbol-placement': 'line-center',
              'text-field': circle['text'],
              'text-size': 13,
              'text-offset': [0, 1],
              'text-letter-spacing': 0.1,
            },
            'paint': {
              'text-color': primary,
              'text-halo-color': primary,
              'text-halo-width': 0.4,
            },
          }),
          LayerPosition(below: 'store'));
      await style.addStyleLayer(
          jsonEncode({
            'id': 'nearLine${circle['id']}',
            'type': 'line',
            'source': circle['source'],
            'minzoom': circle['minzoom'],
            'paint': {
              'line-color': primary,
              'line-width': 1.4,
              'line-opacity': 0.84,
              'line-dasharray': [5, 5],
            },
          }),
          null);
    }

    _styleReady = true;
    await _updateStoresSource();
    await _updateFilters();
    await _updateFocusSource();
    await _updateNearCircles();
  }

  void _onMapCreated(MapboxMap map) {
    _map = map;
    map.gestures.updateSettings(GesturesSettings(
      pitchEnabled: false,
      rotateEnabled: false,
    ));
    map.scaleBar.updateSettings(ScaleBarSettings(
      position: OrnamentPosition.BOTTOM_LEFT,
      marginLeft: 10,
      marginBottom: 40,
    ));
    map.compass.updateSettings(CompassSettings(enabled: false));
    if (_position != null) {
      map.location.updateSettings(LocationComponentSettings(enabled: true));
    }
  }

  void _moveTo(List<double> centerCoordinate, {double zoom = 15}) {
    _map?.flyTo(
      CameraOptions(
        center: Point(
            coordinates: Position(centerCoordinate[0], centerCoordinate[1])),
        zoom: zoom,
      ),
      MapAnimationOptions(duration: 1500),
    );
  }

  Future<void> _moveToCurrentLocation() async {
    try {
      final position = await getLocation(
          timeout: 5000, askedByUser: true, context: context);
      _moveTo(position);
      _position = position;
      _watchPosition();
      _updateNearCircles();
    } catch (_) {
      _position = null;
      _updateNearCircles();
    }
  }

  Future<void> _onTap(MapContentGestureContext gestureContext) async {
    final map = _map;
    if (map == null || !_styleReady) return;

    // Un bar touché ?
    final features = await map.queryRenderedFeatures(
      RenderedQueryGeometry.fromScreenCoordinate(gestureContext.touchPosition),
      RenderedQueryOptions(layerIds: ['store'], filter: null),
    );
    if (features.isNotEmpty && features.first != null) {
      final feature = features.first!.queriedFeature.feature;
      final properties = feature['properties'];
      if (properties is Map) {
        final json = jsonDecode(jsonEncode(properties)) as Map<String, dynamic>;
        ref.read(sheetStoreProvider.notifier).state = models.Store.fromJson(json);
        return;
      }
    }

    // Sinon : fermer les sheets (≙ onMapPress)
    if (ref.read(sheetStoreProvider) != null) {
      ref.read(sheetStoreProvider.notifier).state = null;
    }
    if (ref.read(createStoreProvider) != null) {
      ref.read(createStoreProvider.notifier).state = null;
    }
  }

  Future<void> _searchPoint(MapContentGestureContext gestureContext) async {
    final coordinates = gestureContext.point.coordinates;
    final longitude = coordinates.lng.toDouble();
    final latitude = coordinates.lat.toDouble();
    ref.read(sheetStoreProvider.notifier).state = null;
    ref.read(createStoreProvider.notifier).state = CreateStoreState(
        loading: true, longitude: longitude, latitude: latitude);
    try {
      final place = await searchPlaceGoogle(longitude, latitude);
      final address = place['address'];
      if (address == null || address.isEmpty) {
        ref.read(createStoreProvider.notifier).state = const CreateStoreState(
            error:
                "L'adresse semble invalide, essayez autre part ou contactez-nous");
        return;
      }
      ref.read(createStoreProvider.notifier).state = CreateStoreState(
        address: address,
        countryCode: place['countryCode'],
        longitude: longitude,
        latitude: latitude,
      );
    } catch (err) {
      ref.read(createStoreProvider.notifier).state =
          CreateStoreState(error: getErrorMessage(err));
    }
  }

  void _didMove(CameraChangedEventData data) {
    _cameraSaveTimer?.cancel();
    _cameraSaveTimer = Timer(const Duration(milliseconds: 200), () async {
      final map = _map;
      if (map == null) return;
      final camera = await map.getCameraState();
      Storage.setObject('mapPosition', {
        'coordinates': [
          camera.center.coordinates.lng,
          camera.center.coordinates.lat
        ],
        'zoom': camera.zoom,
      });
      final bounds = await map.getBounds();
      ref.read(mapBoundsProvider.notifier).state = models.MapBounds(
        northEast: [
          bounds.bounds.northeast.coordinates.lng.toDouble(),
          bounds.bounds.northeast.coordinates.lat.toDouble(),
        ],
        southWest: [
          bounds.bounds.southwest.coordinates.lng.toDouble(),
          bounds.bounds.southwest.coordinates.lat.toDouble(),
        ],
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final isDarkMode =
        MediaQuery.platformBrightnessOf(context) == Brightness.dark;

    ref.listen(storesMapProvider, (previous, next) => _updateStoresSource());
    ref.listen(mapboxProvider, (previous, next) => _updateFilters());
    ref.listen(createStoreProvider,
        (previous, next) => _updateCreateStoreSource());
    ref.listen(sheetStoreProvider, (previous, next) {
      _updateFocusSource();
      if (next?.focus == true) {
        ref.read(createStoreProvider.notifier).state = null;
        _focusTimer?.cancel();
        _focusTimer = Timer(const Duration(milliseconds: 100), () {
          _map?.flyTo(
            CameraOptions(
              center: Point(
                  coordinates: Position(next!.longitude, next.latitude)),
              zoom: 17,
            ),
            MapAnimationOptions(duration: 1000),
          );
        });
      }
    });

    if (_initialPosition == null) {
      return const SizedBox.expand();
    }

    return Stack(
      children: [
        MapWidget(
          key: const ValueKey('map'),
          styleUri:
              isDarkMode ? MapboxStyles.DARK : MapboxStyles.MAPBOX_STREETS,
          cameraOptions: CameraOptions(
            center: Point(
                coordinates:
                    Position(_initialPosition![0], _initialPosition![1])),
            zoom: _initialZoomLevel ?? DefaultMap.zoomLevel,
          ),
          onMapCreated: _onMapCreated,
          onStyleLoadedListener: _onStyleLoaded,
          onTapListener: _onTap,
          onLongTapListener: _searchPoint,
          onCameraChangeListener: _didMove,
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: Column(
            children: [
              FloatingActionButton(
                heroTag: 'addStore',
                backgroundColor: colors.surface,
                foregroundColor: colors.primary,
                onPressed: () => ref.read(createStoreProvider.notifier).state =
                    const CreateStoreState(add: true),
                child: const Icon(Icons.add),
              ),
              const SizedBox(height: 10),
              FloatingActionButton(
                heroTag: 'locate',
                backgroundColor: colors.surface,
                foregroundColor: colors.primary,
                onPressed: _moveToCurrentLocation,
                child: const Icon(Icons.gps_fixed),
              ),
            ],
          ),
        ),
        const Align(
          alignment: Alignment.bottomCenter,
          child: CreateStoreSheet(),
        ),
      ],
    );
  }
}
