function getLowest(numbers) {
  if (!numbers.length) {
    return null;
  }
  if (numbers.length === 1) {
    return numbers[0];
  }
  return numbers.reduce((lowest, number) =>
    lowest < number ? lowest : number,
  );
}

function formatSchedules(schedules) {
  return schedules.reduce((schedules, schedule, i) => {
    schedules[schedule.dayOfWeek - 1] = {
      cd: schedule.closed,
      ...(schedule.opening &&
        schedule.closing && {
          o: schedule.opening,
          c: schedule.closing,
        }),
      ...(schedule.openingSpecial &&
        schedule.closingSpecial && {
          os: schedule.openingSpecial,
          cs: schedule.closingSpecial,
        }),
    };
    return schedules;
  }, new Array(7));
}

function emptySchedules() {
  return new Array(7).fill().map(() => ({ cd: false }));
}

export function storeToMap(store) {
  const {
    id,
    name,
    longitude,
    latitude,
    products = [],
    schedules = [],
  } = store;

  const productsIds = products.reduce((products, { product }) => {
    if (product && !products.includes(product)) {
      products.push(product);
    }
    return products;
  }, []);

  const specialPrice = getLowest(
    products.map(p => p.specialPrice).filter(Boolean),
  );

  return {
    id,
    name,
    lng: longitude,
    lat: latitude,
    price: getLowest(products.map(p => p.price).filter(Boolean)),
    ...(specialPrice && { specialPrice }),
    ...(productsIds.length && { products: productsIds }),
    s: schedules.length ? formatSchedules(schedules) : emptySchedules(),
  };
}
