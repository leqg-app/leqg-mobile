export const reducer = (state, action) => {
  switch (action.type) {
    case 'AUTH': {
      return { ...state, user: {} };
    }
    case 'AUTH_SUCCESS': {
      return { ...state, user: action.user };
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
    case 'RESET_STORE_EDITION': {
      return {
        ...state,
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
      };
    }

    default:
      return state;
  }
};
