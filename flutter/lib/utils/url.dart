/// Port de src/utils/url.js.
String getUrlHost(String? url) {
  if (url == null || url.isEmpty) {
    return '';
  }
  final parts = url.split('//');
  if (parts.length < 2) {
    return '';
  }
  return parts[1].split('/').first;
}
