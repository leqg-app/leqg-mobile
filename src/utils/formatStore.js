function getLowest(numbers) {
  if (!numbers.length) {
    return 0;
  }
  if (numbers.length === 1) {
    return numbers[0];
  }
  return numbers.reduce((lowest, number) =>
    lowest < number ? lowest : number,
  );
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

function getProductsById(products) {
  const groupById = (products, [id, price, specialPrice, volume]) => ({
    ...products,
    [id]: {
      price,
      specialPrice,
      volume,
    },
  });
  return products.reduce(groupById, {});
}

export function decompressStore(compressedStore) {
  if (!Array.isArray(compressedStore)) {
    return {};
  }
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
    productsById: getProductsById(products),
    schedules: decompressSchedules(schedules),
    features,
  };
}

export function formatStoreToMap(store) {
  const { longitude, latitude, products } = store;
  return {
    ...store,
    longitude: +longitude.toFixed(5),
    latitude: +latitude.toFixed(5),
    price: getLowest(products.map(p => p.price).filter(Boolean)),
    specialPrice: getLowest(products.map(p => p.specialPrice).filter(Boolean)),
    currencyCode: products?.[0]?.currencyCode || 'EUR',
    productsById: products.reduce(
      (products, product) => ({ ...products, [product.id]: product }),
      {},
    ),
  };
}
