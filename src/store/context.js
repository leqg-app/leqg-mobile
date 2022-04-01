import React, { createContext, useMemo, useContext, useReducer } from 'react';

import { reducer } from './reducer';
import { actionCreators } from './actions';

export function createStoreEdition() {
  return {
    name: '',
    products: [],
    schedules: new Array(7)
      .fill()
      .map((_, i) => ({ dayOfWeek: i + 1, closed: false })),
  };
}

export const initialState = {
  loading: false,
  user: {
    jwt: undefined,
  },
  rates: [],
  stores: [],
  storeEdition: createStoreEdition(),
  storesDetails: {},
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
