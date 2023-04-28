import * as Sentry from '@sentry/react-native';

function getErrorMessage(error, errorMessages = {}) {
  const message = error.message || error;
  if (message === 'Network request failed') {
    return 'Aucune connexion internet';
  }
  if (errorMessages[message]) {
    return errorMessages[message];
  }
  Sentry.captureException(error);
  return 'Une erreur est survenue, merci de réessayer plus tard';
}

export { getErrorMessage };
