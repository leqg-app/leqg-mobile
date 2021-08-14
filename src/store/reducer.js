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
      console.log(action.store);
      return {
        ...state,
        error: undefined,
        loading: false,
      };
    }

    case 'ADD_STORE_FAIL': {
      console.log(action.message);
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
