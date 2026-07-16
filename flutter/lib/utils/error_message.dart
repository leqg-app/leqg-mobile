import 'dart:io';

import 'log_error.dart';

/// Port de src/utils/errorMessage.js : mêmes messages français.
String getErrorMessage(Object error,
    [Map<String, String> errorMessages = const {}]) {
  final message = error is Exception || error is Error
      ? error.toString()
      : error.toString();
  if (error is SocketException ||
      message.contains('Network request failed') ||
      message.contains('SocketException') ||
      message.contains('Failed host lookup')) {
    return 'Aucune connexion internet';
  }
  if (errorMessages[message] != null) {
    return errorMessages[message]!;
  }
  logError(error);
  return 'Une erreur est survenue, merci de réessayer plus tard';
}
