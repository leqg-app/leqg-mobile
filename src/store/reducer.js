export const reducer = (state, action) => {
  switch (action.type) {
    case 'GET_STORES': {
      return { ...state, loading: true };
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

    default:
      return state;
  }
};
