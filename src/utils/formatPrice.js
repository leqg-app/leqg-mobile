export function formatPrice(price) {
  if (!price || isNaN(parseInt(price))) {
    return '';
  }
  price = String(price).replace(',', '.');
  if (parseFloat(price) === parseInt(price)) {
    return parseInt(price).toString();
  }
  return parseFloat(price).toFixed(2).replace('.', ',');
}
