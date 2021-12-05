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

export function sortByPrices(a, b) {
  const substracted = a.price - b.price;
  if (substracted) {
    return substracted;
  }
  if (a.specialPrice && b.specialPrice) {
    return a.specialPrice - b.specialPrice;
  }
  return 0;
}
