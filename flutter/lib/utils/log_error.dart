import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Port de src/utils/logError.js.
void logError(Object error,
    [StackTrace? stack, Map<String, dynamic> context = const {}]) {
  if (kDebugMode) {
    debugPrint('🔴 Error caught: $error');
    if (context.isNotEmpty) {
      debugPrint('Context: $context');
    }
    if (stack != null) {
      debugPrint('Stack trace: $stack');
    }
  }

  Sentry.captureException(error, stackTrace: stack, withScope: (scope) {
    if (context.isNotEmpty) {
      scope.setContexts('extra', context);
    }
  });
}
