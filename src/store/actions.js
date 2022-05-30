import { getProducts } from '../api/products';
import {
  getStores,
  getStore,
  addStore,
  editStore,
  getVersion,
} from '../api/stores';
import { getRates } from '../api/rates';
import {
  signIn,
  signUp,
  getProfile,
  updateProfile,
  resetPassword,
} from '../api/users';
import { getFeatures } from '../api/features';
import { storeToMap } from '../utils/formatStore';
import { storage } from './storage';
import { getErrorMessage } from '../utils/errorMessage';

const versionRequest = getVersion().catch(() => ({}));

export const actionCreators = (dispatch, state) => {
  return {
    signUp: async body => {
      dispatch({ type: 'AUTH' });
      try {
        const { error, data, jwt, user } = await signUp(body);
        if (error) {
          return data[0].messages[0].id;
        }
        storage.set('jwt', jwt);
        user.jwt = jwt;
        dispatch({ type: 'AUTH_SUCCESS', user });
      } catch (err) {
        return err.message;
      }
    },
    signIn: async body => {
      dispatch({ type: 'AUTH' });
      try {
        const { jwt, user, data, error } = await signIn(body);
        if (error) {
          return data[0].messages[0].id;
        }
        storage.set('jwt', jwt);
        user.jwt = jwt;
        dispatch({ type: 'AUTH_SUCCESS', user });
      } catch (err) {
        return err.message;
      }
    },
    resetPassword: async body => {
      try {
        const { data, error } = await resetPassword(body);
        if (error) {
          return data[0].messages[0].id;
        }
        return false;
      } catch (err) {
        return err.message;
      }
    },

    signOut: () => {
      dispatch({ type: 'AUTH' });
      storage.set('jwt', '');
    },

    getUser: async () => {
      try {
        const jwt = storage.getString('jwt');
        if (!jwt) {
          return;
        }
        const { data, error, ...user } = await getProfile(jwt);
        if (error) {
          return data[0].messages[0].id;
        }
        user.jwt = jwt;
        dispatch({ type: 'AUTH_SUCCESS', user });
      } catch (err) {
        return { error: err.message };
      }
    },

    getStore: async id => {
      if (state.storesDetails[id]) {
        return;
      }
      dispatch({ type: 'GET_STORE' });
      try {
        const store = await getStore(id);
        dispatch({ type: 'GET_STORE_SUCCESS', id, store });
      } catch (err) {
        const error = getErrorMessage(err.message, { unknown: true });
        dispatch({ type: 'GET_STORE_FAIL', error });
      }
    },
    getStores: async () => {
      // Get stores from device data
      const stores = storage.getObject('stores', []);
      if (stores?.length) {
        dispatch({ type: 'GET_STORES_SUCCESS', stores });
      }
      // Check if we need to get stores from API
      const apiVersions = await versionRequest;
      const versions = storage.getObject('versions', {});
      if (stores?.length && versions.stores >= apiVersions?.stores) {
        return;
      }
      // Load, display & save new stores
      dispatch({ type: 'GET_STORES' });
      try {
        const stores = await getStores(apiVersions?.stores);
        storage.setObject('stores', stores);
        storage.setObject('versions', {
          ...versions,
          stores: apiVersions.stores,
        });
        dispatch({ type: 'GET_STORES_SUCCESS', stores });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'GET_STORES_FAIL', error });
      }
    },

    addStore: async body => {
      if (!state.user.jwt) {
        return;
      }
      try {
        const response = await addStore(body, { jwt: state.user.jwt });
        if (response.error) {
          throw response.error;
        }
        const { store, reputation, version } = response;
        // Update store
        dispatch({ type: 'SET_STORE', store });
        // Upgrade version
        const versions = storage.getObject('versions', {});
        storage.setObject('versions', { ...versions, stores: version });
        // Won reputation
        dispatch({ type: 'USER_REPUTATION', reputation });
        return { store, reputation };
      } catch (err) {
        return { error: getErrorMessage(err.message, { unknown: true }) };
      }
    },
    editStore: async (id, body) => {
      if (!state.user.jwt) {
        return;
      }
      try {
        const response = await editStore(id, body, { jwt: state.user.jwt });
        if (response.error) {
          throw response.error;
        }
        const { store, reputation, version } = response;
        // Update store
        dispatch({ type: 'SET_STORE', store });
        // Upgrade version
        const versions = storage.getObject('versions', {});
        storage.setObject('versions', { ...versions, stores: version });
        // Won reputation
        dispatch({ type: 'USER_REPUTATION', reputation });
        return { store, reputation };
      } catch (err) {
        return { error: getErrorMessage(err.message, { unknown: true }) };
      }
    },

    getProducts: async () => {
      // Get products from device data
      const products = storage.getObject('products', []);
      if (products?.length) {
        dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
      }
      // Check if we need to get products from API
      const apiVersions = await versionRequest;
      const versions = storage.getObject('versions', {});
      if (versions.products === apiVersions?.products) {
        return;
      }
      dispatch({ type: 'GET_PRODUCTS' });
      try {
        const products = await getProducts(apiVersions?.products);
        storage.setObject('products', products);
        storage.setObject('versions', {
          ...versions,
          products: apiVersions.products,
        });
        dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'GET_PRODUCTS_FAIL', error });
      }
    },

    getRates: async () => {
      // Get rates from device data
      const rates = storage.getObject('rates', []);
      if (rates?.length) {
        dispatch({ type: 'GET_RATES_SUCCESS', rates });
      }
      // Check if we need to get rates from API
      const apiVersions = await versionRequest;
      const versions = storage.getObject('versions', {});
      if (!apiVersions?.rates || versions.rates === apiVersions.rates) {
        return;
      }
      dispatch({ type: 'GET_RATES' });
      try {
        const rates = await getRates(apiVersions.rates);
        storage.setObject('rates', rates);
        storage.setObject('versions', {
          ...versions,
          rates: apiVersions.rates,
        });
        dispatch({ type: 'GET_RATES_SUCCESS', rates });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'GET_RATES_FAIL', error });
      }
    },

    getFeatures: async () => {
      // Get rates from device data
      const features = storage.getObject('features', []);
      if (features?.length) {
        dispatch({ type: 'GET_FEATURES_SUCCESS', features });
      }
      // Check if we need to get features from API
      const apiVersions = await versionRequest;
      const versions = storage.getObject('versions', {});
      if (
        !apiVersions?.features ||
        versions.features === apiVersions.features
      ) {
        return;
      }
      dispatch({ type: 'GET_FEATURES' });
      try {
        const features = await getFeatures(apiVersions.features);
        storage.setObject('features', features);
        storage.setObject('versions', {
          ...versions,
          features: apiVersions.features,
        });
        dispatch({ type: 'GET_FEATURES_SUCCESS', features });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'GET_FEATURES_FAIL', error });
      }
    },

    addFavorite: async store => {
      if (!state.user?.id) {
        return;
      }
      dispatch({ type: 'ADD_FAVORITE', store });
      const { user } = state;
      // Add store and get ids
      const favorites = [...user.favorites, store].map(store => store.id);
      try {
        await updateProfile(user.jwt, { favorites });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'REMOVE_FAVORITE', store, error });
      }
    },
    removeFavorite: async store => {
      if (!state.user?.id) {
        return;
      }
      dispatch({ type: 'REMOVE_FAVORITE', store });
      const { user } = state;
      // Filter and get ids
      const favorites = user.favorites
        .filter(favorite => favorite.id !== store.id)
        .map(store => store.id);

      try {
        await updateProfile(user.jwt, { favorites });
      } catch (err) {
        const error = getErrorMessage(err.message);
        dispatch({ type: 'ADD_FAVORITE', store, error });
      }
    },

    setSheetStore: store => dispatch({ type: 'SET_SHEET_STORE', store }),

    dismissError: () => dispatch({ type: 'DISMISS_ERROR' }),
  };
};
