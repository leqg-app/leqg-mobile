import { MMKV } from 'react-native-mmkv';
const storage = new MMKV({ id: 'leqg', encryptionKey: 'dml2ZWxhYmllcmUK' });

storage.setObject = function (key, obj) {
  try {
    storage.set(key, JSON.stringify(obj));
  } catch (e) {
    console.log(`Unable to store ${key}`);
    console.log(e);
  }
};
storage.getObject = function (key, defaultValue) {
  if (!storage.contains(key)) {
    return defaultValue;
  }
  try {
    return JSON.parse(storage.getString(key));
  } catch {
    return defaultValue;
  }
};

export { storage };
