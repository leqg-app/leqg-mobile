import * as Sentry from '@sentry/react-native';

function getErrorMessage(error, options = {}) {
  if (error === 'Network request failed') {
    return 'Aucune connexion internet';
  }
  if (options.unknown) {
    reportError(error);
    return 'Une erreur est survenue, merci de réessayer plus tard';
  }
  return error;
}

function reportError(error) {
  // Don't report network errors
  if ((error.message || error) === 'Network request failed') {
    return;
  }
  Sentry.captureException(error);
}

export { getErrorMessage, reportError };
