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

    default:
      return state;
  }
};
