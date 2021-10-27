import React, {
  createContext,
  useMemo,
  useContext,
  useReducer,
  useEffect,
} from 'react';

import { reducer } from './reducer';
import { actionCreators } from './actions';
import { storage } from './storage';
import { getVersion } from '../api/stores';

export const initialState = {
  loading: false,
  user: {
    jwt: undefined,
  },
  stores: [],
  storeEdition: {},
  storesDetails: {},
  products: [],
};

export const StoreContext = createContext(undefined);

export const StoreProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = actionCreators(dispatch, state);
  const value = useMemo(() => [state, actions], [state, actions]);

  const { user, stores } = state;
  useEffect(() => {
    getVersion().then(version => storage.setInt('version', version));
  }, [stores]);
  useEffect(() => {
    storage.setMap('user', user);
  }, [user]);

  return <StoreContext.Provider value={value} {...props} />;
};

export const useStore = () => {
  return useContext(StoreContext);
};
