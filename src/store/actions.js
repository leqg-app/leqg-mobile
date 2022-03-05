import { getProducts } from '../api/products';
import {
  getStores,
  getStore,
  addStore,
  editStore,
  getVersion,
} from '../api/stores';
import {
  signIn,
  signUp,
  getProfile,
  updateProfile,
  resetPassword,
} from '../api/users';
import { storeToMap } from '../utils/formatStore';
import { storage } from './storage';

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

    getStore: id => {
      if (state.storesDetails[id]) {
        return;
      }
      dispatch({ type: 'GET_STORE' });
      getStore(id)
        .then(store => dispatch({ type: 'GET_STORE_SUCCESS', id, store }))
        .catch(err =>
          dispatch({ type: 'GET_STORE_FAIL', message: err.message }),
        );
    },
    getStores: async () => {
      // Compare API version and storage version to use stores from API or storage
      const apiVersions = await getVersion();
      const versions = storage.getObject('versions', {});
      if (versions.stores === apiVersions?.stores) {
        const stores = storage.getObject('stores', []);
        if (stores?.length) {
          dispatch({ type: 'GET_STORES_SUCCESS', stores });
          return;
        }
      }
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
        dispatch({ type: 'GET_STORES_FAIL', message: err.message });
      }
    },
    setStores: stores => dispatch({ type: 'SET_STORES', stores }),

    editStore: async (id, store) => {
      if (!state.user.jwt) {
        return;
      }
      try {
        const edition = await editStore(id, store, { jwt: state.user.jwt });
        if (edition?.store) {
          dispatch({ type: 'SET_STORE', id, ...edition });
        } else {
          dispatch({ type: 'SET_STORE', id, store });
        }
      } catch (err) {
        return { error: err.message };
      }
    },
    addStore: async details => {
      if (!state.user.jwt) {
        return;
      }
      try {
        const response = await addStore(details, { jwt: state.user.jwt });
        if (response.error) {
          return response.message;
        }
        dispatch({ type: 'SET_STORE', store: response, contributed: true });
        return storeToMap(response);
      } catch (err) {
        return { error: err.message };
      }
    },

    getProducts: async () => {
      // Compare API version and storage version to use products from API or storage
      const apiVersions = await getVersion();
      const versions = storage.getObject('versions', []);
      if (versions.products) {
        const products = storage.getObject('products', []);
        if (products?.length) {
          dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
        }
      }
      if (versions.products === apiVersions?.products) {
        return;
      }
      dispatch({ type: 'GET_PRODUCTS' });
      try {
        const products = await getProducts();
        storage.setObject('products', products);
        storage.setObject('versions', {
          ...versions,
          products: apiVersions.products,
        });
        dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
      } catch (err) {
        dispatch({ type: 'GET_PRODUCTS_FAIL', message: err.message });
      }
    },

    resetStoreEdition: () => {
      dispatch({ type: 'RESET_STORE_EDITION' });
    },
    setStoreEdition: store => {
      dispatch({ type: 'SET_STORE_EDITION', store });
    },

    addFavorite: store => {
      if (!state.user?.id) {
        return;
      }
      dispatch({ type: 'ADD_FAVORITE', store });
      const { user } = state;
      // Add store and get ids
      const favorites = [...user.favorites, store].map(store => store.id);
      updateProfile(user.jwt, { favorites }).catch(() =>
        dispatch({ type: 'REMOVE_FAVORITE', store }),
      );
    },
    removeFavorite: store => {
      if (!state.user?.id) {
        return;
      }
      dispatch({ type: 'REMOVE_FAVORITE', store });
      const { user } = state;
      // Filter and get ids
      const favorites = user.favorites
        .filter(favorite => favorite.id !== store.id)
        .map(store => store.id);
      updateProfile(user.jwt, { favorites }).catch(() =>
        dispatch({ type: 'ADD_FAVORITE', store }),
      );
    },
  };
};
