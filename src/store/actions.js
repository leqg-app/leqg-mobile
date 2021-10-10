import { getProducts } from '../api/products';
import { getStores, getStore, addStore } from '../api/stores';
import { signIn, signUp, updateProfile } from '../api/users';
import { alreadyLoaded } from '../utils/smartLoadMap';

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
    signIn: body => {
      dispatch({ type: 'AUTH' });
      return signIn(body)
        .then(({ jwt, user }) => dispatch({ type: 'AUTH_SUCCESS', jwt, user }))
        .catch(({ data }) =>
          dispatch({ type: 'AUTH_FAIL', message: data[0].messages[0] }),
        );
    },

    getStore: id => {
      dispatch({ type: 'GET_STORE' });
      getStore(id)
        .then(store => dispatch({ type: 'GET_STORE_SUCCESS', id, store }))
        .catch(err =>
          dispatch({ type: 'GET_STORE_FAIL', message: err.message }),
        );
    },
    getStores: coordinates => {
      if (alreadyLoaded(coordinates)) {
        return;
      }
      dispatch({ type: 'GET_STORES' });
      getStores(coordinates)
        .then(stores =>
          dispatch({ type: 'GET_STORES_SUCCESS', stores, coordinates }),
        )
        .catch(err =>
          dispatch({ type: 'GET_STORES_FAIL', message: err.message }),
        );
    },
    addStore: details => {
      dispatch({ type: 'ADD_STORE' });
      addStore(details, { jwt: state.jwt })
        .then(store => dispatch({ type: 'ADD_STORE_SUCCESS', store }))
        .catch(err =>
          dispatch({ type: 'ADD_STORE_FAIL', message: err.message }),
        );
    },

    getProducts: () => {
      dispatch({ type: 'GET_PRODUCTS' });
      getProducts()
        .then(products => dispatch({ type: 'GET_PRODUCTS_SUCCESS', products }))
        .catch(err =>
          dispatch({ type: 'GET_PRODUCTS_FAIL', message: err.message }),
        );
    },

    setStoreEdition: store => {
      dispatch({ type: 'SET_STORE_EDITION', store });
    },

    addFavorite: store => {
      if (!state.user?.details?.id) {
        return;
      }
      dispatch({ type: 'ADD_FAVORITE', store });
      const { jwt, details } = state.user;
      // Add store and get ids
      const favorites = [...details.favorites, store].map(store => store.id);
      updateProfile({ favorites }, jwt).catch(() =>
        dispatch({ type: 'REMOVE_FAVORITE', store }),
      );
    },
    removeFavorite: store => {
      if (!state.user?.details?.id) {
        return;
      }
      dispatch({ type: 'REMOVE_FAVORITE', store });
      const { jwt, details } = state.user;
      // Filter and get ids
      const favorites = details.favorites
        .filter(favorite => favorite.id !== store.id)
        .map(store => store.id);
      updateProfile({ favorites }, jwt).catch(() =>
        dispatch({ type: 'ADD_FAVORITE', store }),
      );
    },
  };
};
