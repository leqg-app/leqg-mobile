import { logError } from './logError';

function getErrorMessage(error, errorMessages = {}) {
  const message = error.message || error;
  if (message === 'Network request failed') {
    return 'Aucune connexion internet';
  }
  if (errorMessages[message]) {
    return errorMessages[message];
  }
  logError(error);
  return 'Une erreur est survenue, merci de réessayer plus tard';
}

export { getErrorMessage };
