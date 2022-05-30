import { decompressStore, storeToMap } from '../utils/formatStore';
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
        stores: action.stores.map(decompressStore),
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
      const { store } = action;
      const stores = state.stores.filter(s => store.id !== s.id).concat(store);

      return {
        ...state,
        stores,
        storesDetails: {
          ...state.storesDetails,
          [store.id]: store,
        },
        storeEdition: {},
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

    case 'SET_SHEET_STORE': {
      return { ...state, sheetStore: action.store };
    }

    case 'DISMISS_ERROR': {
      return { ...state, error: undefined };
    }

    default:
      return state;
  }
};
