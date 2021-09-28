import { groupStores } from '../utils/smartLoadMap';

export const reducer = (state, action) => {
  switch (action.type) {
    case 'AUTH': {
      return { ...state, loading: true, error: undefined };
    }
    case 'AUTH_SUCCESS': {
      const { jwt, user } = action;
      return { ...state, jwt, user, loading: false };
    }
    case 'AUTH_FAIL': {
      return { ...state, error: action.message };
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
        error: action.message,
      };
    }

    case 'GET_STORES': {
      return { ...state, error: undefined, loading: true };
    }
    case 'GET_STORES_SUCCESS': {
      return {
        ...state,
        error: undefined,
        stores: groupStores(action.stores, action.coordinates),
        loading: false,
      };
    }
    case 'GET_STORES_FAIL': {
      return {
        ...state,
        error: action.message,
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
        error: action.message,
        loading: false,
      };
    }

    case 'ADD_STORE': {
      return { ...state, error: undefined, loading: true };
    }

    case 'ADD_STORE_SUCCESS': {
      return {
        ...state,
        error: undefined,
        loading: false,
      };
    }

    case 'ADD_STORE_FAIL': {
      return {
        ...state,
        error: action.message,
        loading: false,
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

    default:
      return state;
  }
};
