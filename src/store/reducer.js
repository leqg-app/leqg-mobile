export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOKEN': {
      return { ...state, token: action.token };
    }
    case 'SET_USER': {
      return { ...state, user: action.user };
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
