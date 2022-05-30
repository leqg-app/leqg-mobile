function decompressProducts(compressedProduct) {
  return compressedProduct.reduce((products, product) => {
    const [productId, price, specialPrice, volume] = product;
    return products.concat({ productId, price, specialPrice, volume });
  }, []);
}

function decompressSchedules(compressedSchedule) {
  return compressedSchedule.reduce((schedules, schedule, day) => {
    if (schedule === 0) {
      return schedules.concat({ dayOfWeek: day + 1, closed: true });
    }
    const [normal = [], special = []] = schedule || [];
    const [opening = null, closing = null] = normal;
    const [openingSpecial = null, closingSpecial] = special;
    return schedules.concat({
      dayOfWeek: day + 1,
      closed: false,
      opening,
      closing,
      openingSpecial,
      closingSpecial,
    });
  }, []);
}

export function decompressStore(compressedStore) {
  const [
    id,
    name,
    address,
    longitude,
    latitude,
    price,
    specialPrice,
    currencyCode,
    products,
    schedules,
    features,
  ] = compressedStore;
  return {
    id,
    name,
    address,
    longitude,
    latitude,
    price,
    specialPrice,
    currencyCode,
    products: decompressProducts(products),
    schedules: decompressSchedules(schedules),
    features,
  };
}
