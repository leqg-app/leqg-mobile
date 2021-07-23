function getStores() {
  return fetch('http://192.168.10.110:1337/stores').then(res => res.json());
}

export default { getStores };
