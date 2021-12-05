export function displayPrice(price) {
  if (!price || isNaN(parseInt(price))) {
    return '';
  }
  if (parseFloat(price) === parseInt(price)) {
    return parseInt(price).toString();
  }
  return price.toFixed(2).replace('.', ',');
}

export function parsePrice(price) {
  if (!price || isNaN(parseFloat(price))) {
    return '';
  }
  return parseFloat(String(price).replace(',', '.'));
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
