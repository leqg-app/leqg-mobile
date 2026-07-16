import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../components/dialogs.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../tabs.dart';
import '../edit_store/edit_store.dart';

/// Port des actions UI de Store.js / storeActions.js.
void shareStore(Store store) {
  Share.share(
    'Retrouvons nous au ${store.name}\n\n${store.address}',
    subject: 'Retrouvons nous',
  );
}

void openAddress(Store store) {
  final encodedName = Uri.encodeComponent(store.name);
  final encodedAddress = Uri.encodeComponent(store.address ?? '');
  final url = Platform.isIOS
      ? 'maps:0,0?q=$encodedName@${store.latitude},${store.longitude}'
      : 'https://www.google.com/maps/search/$encodedName,+$encodedAddress?hl=fr';
  launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
}

void launchStoreWebsite(Store store) {
  if (store.website != null && store.website!.isNotEmpty) {
    launchUrl(Uri.parse(store.website!), mode: LaunchMode.externalApplication);
  }
}

void callStore(Store store) {
  if (store.phone != null && store.phone!.isNotEmpty) {
    launchUrl(Uri.parse('tel:${store.phone}'));
  }
}

/// ≙ editStoreScreen de storeActions.js : dialogue « Connexion requise » ou
/// navigation vers l'édition.
void editStoreScreen(BuildContext context, WidgetRef ref, Store store) {
  final user = ref.read(userProvider);
  if (user == null) {
    showLoginRequiredDialog(
      context,
      message: 'Vous devez être connecté pour modifier ce bar',
      onLogin: () {
        navigateToAccountTab(context, ref);
        ref.read(sheetStoreProvider.notifier).state = null;
      },
    );
    return;
  }
  ref.read(storeEditionProvider.notifier).state = StoreEdition.fromStore(store);
  Navigator.of(context, rootNavigator: true).push(
    MaterialPageRoute(builder: (context) => const EditStoreScreen()),
  );
}
