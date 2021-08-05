import api from '../api/stores';

export const actionCreators = (dispatch, state) => {
  return {
    getStores: () => {
      dispatch({ type: 'GET_STORES' });
      api
        .getStores()
        .then(stores => dispatch({ type: 'GET_STORES_SUCCESS', stores }))
        .catch(err =>
          dispatch({ type: 'GET_STORES_FAIL', message: err.message }),
        );
    },

    addStore: details => {
      dispatch({ type: 'ADD_STORE' });
      api
        .addStore(details, { token: state.token })
        .then(store => dispatch({ type: 'ADD_STORE_SUCCESS', store }))
        .catch(err =>
          dispatch({ type: 'ADD_STORE_FAIL', message: err.message }),
        );
    },

    setToken: token => dispatch({ type: 'SET_TOKEN', token }),
    setCurrentUser: user => dispatch({ type: 'SET_USER', user }),
  };
};
