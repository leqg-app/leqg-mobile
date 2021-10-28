const saved = [];

function inCoordinates(referer, subject) {
  const {
    northEast: [rlngE, rlatN],
    southWest: [rlngW, rlatS],
  } = referer;
  const {
    northEast: [slngE, slatN],
    southWest: [slngW, slatS],
  } = subject;
  return rlngE >= slngE && rlatN >= slatN && rlngW <= slngW && rlatS <= slatS;
}

function groupStores(newStores, coordinates) {
  let found = false;
  const stores = {};
  for (const save of saved) {
    if (save.coordinates && inCoordinates(coordinates, save.coordinates)) {
      save.stores = newStores;
      save.coordinates = coordinates;
      found = true;
    }
    for (const store of save.stores) {
      stores[store.id] = store;
    }
  }
  if (!found) {
    saved.push({
      coordinates,
      stores: newStores,
    });
    for (const store of newStores) {
      stores[store.id] = store;
    }
  }
  return Object.values(stores);
}

function alreadyLoaded(coordinates) {
  return saved.find(save => inCoordinates(save.coordinates, coordinates));
}

export { alreadyLoaded, groupStores };
