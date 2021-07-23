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
  };
};
