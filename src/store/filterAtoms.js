import { atom, selector } from 'recoil';

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

const mapboxState = selector({
  key: 'mapboxState',
  get: ({ get }) => {
    const filters = [];
    const productFilter = get(productFilterState);
    const priceFilter = get(priceFilterState);
    const featureFilter = get(featureFilterState);
    const scheduleFilter = get(scheduleFilterState);

    let cheapestPrice = ['get', 'price'];

    if (productFilter.products?.length) {
      const { filterAll, products } = productFilter;
      const filterType = filterAll ? 'all' : 'any';
      filters.push([
        filterType,
        ...products.map(({ id }) => [
          'to-boolean',
          [
            'get',
            'price',
            ['get', `${id}`, ['object', ['get', 'productsById']]],
          ],
        ]),
      ]);

      // Update prices text on map
      cheapestPrice = [
        'min',
        ...products.map(({ id }) => [
          'coalesce',
          [
            'get',
            'price',
            ['get', `${id}`, ['object', ['get', 'productsById']]],
          ],
          999999, // help!
        ]),
      ];
    }

    if (priceFilter) {
      const [min, max] = priceFilter;
      if (min > 0) {
        filters.push(['>=', cheapestPrice, min]);
      }
      if (max < 10) {
        filters.push(['<=', cheapestPrice, max]);
      }
    }

    if (featureFilter) {
      filters.push(...featureFilter.map(id => ['in', id, ['get', 'features']]));
    }
    if (scheduleFilter) {
      filters.push(['get', 'open']);
    }

    return {
      filters: filters.length ? filters : [['has', 'id']],
      textField: ['to-string', cheapestPrice],
      symbolSortKey: cheapestPrice,
      textSize: [
        'case',
        ['<', 3, ['length', ['to-string', cheapestPrice]]],
        11,
        13,
      ],
    };
  },
});

export {
  productFilterState,
  priceFilterState,
  featureFilterState,
  scheduleFilterState,
  mapboxState,
};
