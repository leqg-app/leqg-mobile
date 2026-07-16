import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'data/assets_data.dart';
import 'routes.dart';
import 'store/database.dart';
import 'store/storage.dart';
import 'theme.dart';

/// Port de src/App.js : initialisation (Sentry, thème clair/sombre) et racine.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Storage.initialize();
  await StoreDatabase.initialize();
  await AssetsData.initialize();
  MapboxOptions.setAccessToken(dotenv.env['MAPBOX_API_KEY'] ?? '');

  const app = ProviderScope(child: LeQGApp());

  if (kDebugMode) {
    runApp(app);
    return;
  }

  await SentryFlutter.init(
    (options) {
      options.dsn =
          'https://247aa8fba4ca46688925bf9823ba239e@o1079194.ingest.sentry.io/6083816';
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(app),
  );
}

class LeQGApp extends StatelessWidget {
  const LeQGApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'leqg',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(Brightness.light),
      darkTheme: buildTheme(Brightness.dark),
      locale: const Locale('fr'),
      supportedLocales: const [Locale('fr')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const Routes(),
    );
  }
}
