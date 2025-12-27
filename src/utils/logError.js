import * as Sentry from '@sentry/react-native';

export function logError(error, context = {}) {
  if (__DEV__) {
    console.error('🔴 Error caught:', error);
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  if (context && Object.keys(context).length > 0) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureException(error);
  }
}
