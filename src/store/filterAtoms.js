import { atom, selector } from 'recoil';

import { CHEAPEST_PRICE_EXPRESSION, OPEN_STORE_EXPRESSION } from '../utils/map';

const productFilterState = atom({
  key: 'productFilterState',
  default: {
    products: [],
    filterAll: true,
  },
});

const priceFilterState = atom({
  key: 'priceFilterState',
  default: null,
});

const featureFilterState = atom({
  key: 'featureFilterState',
  default: null,
});

const scheduleFilterState = atom({
  key: 'scheduleFilterState',
  default: null,
});

const mapboxFiltersState = selector({
  key: 'mapboxFiltersState',
  get: ({ get }) => {
    const filters = [];
    const productFilter = get(productFilterState);
    const priceFilter = get(priceFilterState);
    const featureFilter = get(featureFilterState);
    const scheduleFilter = get(scheduleFilterState);

    if (productFilter.products?.length) {
      const { filterAll, products } = productFilter;
      const filterType = filterAll ? 'all' : 'any';
      filters.push([
        filterType,
        ...products.map(({ id }) => ['in', id, ['get', 'productsId']]),
      ]);
    }
    if (priceFilter) {
      const [min, max] = priceFilter;
      if (min > 0) {
        filters.push(['>=', CHEAPEST_PRICE_EXPRESSION, min]);
      }
      if (max < 10) {
        filters.push(['<=', CHEAPEST_PRICE_EXPRESSION, max]);
      }
    }
    if (featureFilter) {
      filters.push(...featureFilter.map(id => ['in', id, ['get', 'features']]));
    }
    if (scheduleFilter) {
      filters.push(OPEN_STORE_EXPRESSION);
    }

    return filters;
  },
});

export {
  productFilterState,
  priceFilterState,
  featureFilterState,
  scheduleFilterState,
  mapboxFiltersState,
};
