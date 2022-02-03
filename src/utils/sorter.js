export function sortBy(field, order = 'desc') {
  const [first, second] = order === 'desc' ? [1, -1] : [-1, 1];
  return function (objectA, objectB) {
    return objectA[field] > objectB[field] ? first : second;
  };
}
