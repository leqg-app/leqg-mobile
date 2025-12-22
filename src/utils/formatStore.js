export function getLowest(numbers) {
  if (!numbers.length) {
    return 0;
  }
  return numbers.reduce((lowest, number) =>
    (!number || number > lowest) && lowest ? lowest : number,
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

export function storesToDatabase(compressedStore) {
  if (!Array.isArray(compressedStore)) {
    return {};
  }
  const [
    id,
    name,
    address,
    longitude,
    latitude,
    ,
    ,
    // TODO: remove fields from API
    currencyCode,
    products,
    schedules,
    features,
    rate,
    rateCount,
  ] = compressedStore;
  return {
    id,
    name,
    address,
    longitude,
    latitude,
    currencyCode,
    productsById: getProductsById(products),
    schedules: decompressSchedules(schedules),
    features,
    rate,
    rateCount,
  };
}

export function storeToDatabase(store) {
  const { longitude, latitude, products } = store;
  return {
    ...store,
    longitude: +longitude.toFixed(5),
    latitude: +latitude.toFixed(5),
    currencyCode: products?.[0]?.currencyCode || 'EUR',
    productsById: products.reduce(
      (products, product) => ({ ...products, [product.id]: product }),
      {},
    ),
  };
}
