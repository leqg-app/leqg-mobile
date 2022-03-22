import Config from 'react-native-config';

// async function searchPlaceMapbox(longitude, latitude) {
//   const queries = {
//     access_token: Config.MAPBOX_API_KEY,
//     types: 'address',
//   };
//   const query = Object.entries(queries)
//     .map(([param, value]) => `${param}=${value}`)
//     .join('&');
//   const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${query}`;
//   const { features } = await fetch(url).then(res => res.json());
//   if (!features || !features[0] || !features[0].place_name) {
//     return {};
//   }
//   const { place_name: address, context } = features[0];
//   return {
//     address,
//     countryCode: context
//       ? context.pop().short_code.slice(0, 2).toUpperCase()
//       : '',
//   };
// }

async function searchPlaceGoogle(longitude, latitude) {
  const queries = {
    key: Config.GOOGLE_MAPS_API_KEY,
    latlng: `${latitude},${longitude}`,
    language: 'fr',
  };
  const query = Object.entries(queries)
    .map(([param, value]) => `${param}=${value}`)
    .join('&');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${query}`;
  const { results } = await fetch(url).then(res => res.json());
  for (const result of results) {
    const { address_components, formatted_address } = result;
    if (formatted_address.includes('+')) {
      continue;
    }
    const country = address_components.find(({ types }) =>
      types.includes('country'),
    );
    if (country) {
      return {
        address: formatted_address,
        countryCode: country.short_name,
      };
    }
    return {
      address: formatted_address,
      countryCode: '',
    };
  }
  return {};
}

export default searchPlaceGoogle;
