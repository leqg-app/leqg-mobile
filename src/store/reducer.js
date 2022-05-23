import { storeToMap } from '../utils/formatStore';
import { createStoreEdition } from './context';

export const reducer = (state, action) => {
  switch (action.type) {
    case 'AUTH': {
      return { ...state, user: {} };
    }
    case 'AUTH_SUCCESS': {
      return { ...state, user: action.user };
    }
    case 'AUTH_RESET': {
      return { ...state, user: {} };
    }

    case 'GET_STORE': {
      return { ...state, error: undefined };
    }
    case 'GET_STORE_SUCCESS': {
      return {
        ...state,
        error: undefined,
        storesDetails: {
          ...state.storesDetails,
          [action.id]: action.store,
        },
      };
    }
    case 'GET_STORE_FAIL': {
      return {
        ...state,
        error: action.error,
      };
    }

    case 'SET_STORES': {
      return { ...state, stores: action.stores };
    }
    case 'GET_STORES': {
      return { ...state, error: undefined, loading: true };
    }
    case 'GET_STORES_SUCCESS': {
      return {
        ...state,
        error: undefined,
        stores: action.stores,
        loading: false,
      };
    }
    case 'GET_STORES_FAIL': {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    case 'GET_PRODUCTS': {
      return { ...state, error: undefined, loading: true };
    }
    case 'GET_PRODUCTS_SUCCESS': {
      return {
        ...state,
        error: undefined,
        products: action.products,
        loading: false,
      };
    }
    case 'GET_PRODUCTS_FAIL': {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    case 'GET_RATES_SUCCESS': {
      return {
        ...state,
        rates: action.rates,
      };
    }

    case 'GET_FEATURES_SUCCESS': {
      return {
        ...state,
        features: action.features,
      };
    }

    case 'SET_STORE': {
      const { id, store, contributed } = action;
      const stores = state.stores.filter(s => id !== s.id);
      stores.push(storeToMap(store));

      return {
        ...state,
        stores,
        storesDetails: {
          ...state.storesDetails,
          [id || store.id]: store,
        },
        ...(contributed && {
          user: {
            ...state.user,
            contributions: state.user.contributions + 1,
          },
        }),
        storeEdition: {},
      };
    }

    case 'SET_STORE_EDITION': {
      const { store } = action;
      return {
        ...state,
        storeEdition: {
          ...state.storeEdition,
          ...store,
        },
      };
    }
    case 'RESET_STORE_EDITION': {
      return {
        ...state,
        storeEdition: createStoreEdition(),
      };
    }

    case 'ADD_FAVORITE': {
      return {
        ...state,
        user: {
          ...state.user,
          favorites: [...state.user.favorites, action.store],
        },
        ...(action.error && { error: action.error }),
      };
    }
    case 'REMOVE_FAVORITE': {
      return {
        ...state,
        user: {
          ...state.user,
          favorites: state.user.favorites.filter(
            favorite => favorite.id !== action.store.id,
          ),
        },
        ...(action.error && { error: action.error }),
      };
    }

    case 'DISMISS_ERROR': {
      return { ...state, error: undefined };
    }

    default:
      return state;
  }
};
