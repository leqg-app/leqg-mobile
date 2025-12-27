// From https://stackoverflow.com/a/65799152/1815046
function getCoordinatesDistance(cord1, cord2) {
  const radlat1 = (Math.PI * cord1.latitude) / 180;
  const radlat2 = (Math.PI * cord2.latitude) / 180;

  const theta = cord1.longitude - cord2.longitude;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  dist = Math.acos(Math.min(dist, 1));
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; // miles to km

  return dist;
}

function isStoreInBounds(store, bounds) {
  if (!bounds) {
    return true;
  }

  const { longitude, latitude } = store;
  const ne = bounds.ne || bounds.northEast;
  const sw = bounds.sw || bounds.southWest;

  if (!ne || !sw) {
    return true;
  }

  return (
    longitude >= sw[0] &&
    longitude <= ne[0] &&
    latitude >= sw[1] &&
    latitude <= ne[1]
  );
}

export { getCoordinatesDistance, isStoreInBounds };
