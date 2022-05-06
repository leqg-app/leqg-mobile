function getErrorMessage(error, options = {}) {
  if (error === 'Network request failed') {
    return 'Aucune connexion internet';
  }
  if (options.unknown) {
    return 'Une erreur est survenue, merci de réessayer plus tard';
  }
}

export { getErrorMessage };
