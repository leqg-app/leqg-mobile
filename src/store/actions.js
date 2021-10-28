import { getProducts } from '../api/products';
import { getStores, getStore, addStore, getVersion } from '../api/stores';
import { signIn, signUp, getProfile, updateProfile } from '../api/users';
import { storage } from './storage';

export const actionCreators = (dispatch, state) => {
  return {
    signUp: body => {
      dispatch({ type: 'AUTH' });
      return signUp(body)
        .then(({ jwt, user, data, error }) => {
          if (error) {
            return data[0].messages[0].id;
          }
          dispatch({ type: 'AUTH_SUCCESS', jwt, user });
        })
        .catch(({ message }) => message);
    },
    signIn: async body => {
      dispatch({ type: 'AUTH' });
      try {
        const { jwt, user, data, error } = await signIn(body);
        if (error) {
          return data[0].messages[0].id;
        }
        await storage.setStringAsync('jwt', jwt);
        user.jwt = jwt;
        dispatch({ type: 'AUTH_SUCCESS', user });
      } catch (err) {
        return err.message;
      }
    },
    getUser: async () => {
      try {
        const jwt = await storage.getStringAsync('jwt');
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
      const versions = (await storage.getMapAsync('versions')) || {};
      if (versions.stores === apiVersions?.stores) {
        const stores = await storage.getArrayAsync('stores');
        if (stores?.length) {
          dispatch({ type: 'GET_STORES_SUCCESS', stores });
          return;
        }
      }
      dispatch({ type: 'GET_STORES' });
      try {
        const stores = await getStores();
        await storage.setArrayAsync('stores', stores);
        await storage.setMapAsync('versions', {
          ...versions,
          stores: apiVersions.stores,
        });
        dispatch({ type: 'GET_STORES_SUCCESS', stores });
      } catch (err) {
        dispatch({ type: 'GET_STORES_FAIL', message: err.message });
      }
    },
    setStores: stores => dispatch({ type: 'SET_STORES', stores }),
    addStore: details => {
      dispatch({ type: 'ADD_STORE' });
      addStore(details, { jwt: state.user.jwt })
        .then(store => dispatch({ type: 'ADD_STORE_SUCCESS', store }))
        .catch(err =>
          dispatch({ type: 'ADD_STORE_FAIL', message: err.message }),
        );
    },

    getProducts: async () => {
      // Compare API version and storage version to use products from API or storage
      const apiVersions = await getVersion();
      const versions = (await storage.getMapAsync('versions')) || {};
      if (versions.products === apiVersions?.products) {
        const products = await storage.getArrayAsync('products');
        if (products?.length) {
          dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
          return;
        }
      }
      dispatch({ type: 'GET_PRODUCTS' });
      try {
        const products = await getProducts();
        await storage.setArrayAsync('products', products);
        await storage.setMapAsync('versions', {
          ...versions,
          products: apiVersions.products,
        });
        dispatch({ type: 'GET_PRODUCTS_SUCCESS', products });
      } catch (err) {
        dispatch({ type: 'GET_PRODUCTS_FAIL', message: err.message });
      }
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
