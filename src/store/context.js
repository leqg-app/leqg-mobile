import React, { createContext, useMemo, useContext, useReducer } from 'react';

import { reducer } from './reducer';
import { actionCreators } from './actions';

export const initialState = {
  loading: false,
  jwt: undefined,
  user: {},
  stores: [],
  storeEdition: {},
  products: [],
};

export const StoreContext = createContext(undefined);

export const StoreProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = actionCreators(dispatch, state);
  const value = useMemo(() => [state, actions], [state, actions]);
  return <StoreContext.Provider value={value} {...props} />;
};

export const useStore = () => {
  return useContext(StoreContext);
};
