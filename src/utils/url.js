function getUrlHost(url) {
  if (!url?.split) {
    return '';
  }
  return url.split('//')[1]?.split('/')?.[0] || '';
}

export { getUrlHost };
