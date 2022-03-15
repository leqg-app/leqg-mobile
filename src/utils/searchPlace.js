import Config from 'react-native-config';

function searchPlace(longitude, latitude) {
  const queries = {
    access_token: Config.MAPBOX_API_KEY,
    types: 'address',
  };
  const query = Object.entries(queries)
    .map(([param, value]) => `${param}=${value}`)
    .join('&');
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${query}`;
  return fetch(url).then(res => res.json());
}

export default searchPlace;
