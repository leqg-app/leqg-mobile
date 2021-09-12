import qs from 'qs';
import { get, post } from './index';

function getStores(coordinates) {
  const { northEast, southWest } = coordinates;
  const params = qs.stringify({
    _limit: -1,
    _where: [
      {
        longitude_gte: southWest[0],
        latitude_gte: southWest[1],
      },
      {
        longitude_lte: northEast[0],
        latitude_lte: northEast[1],
      },
    ],
  });
  return get(`/stores?${params}`);
}

function addStore(data, { jwt }) {
  return post('/stores', data, { Authorization: `bearer ${jwt}` });
}

export { getStores, addStore };
