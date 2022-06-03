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
    productsId: products.map(product => product[0]),
    productsPrice: products.map(product => product[1]),
    productsSpecialPrice: products.map(product => product[2]),
    productsVolume: products.map(product => product[3]),
    schedules: decompressSchedules(schedules),
    features,
  };
}
