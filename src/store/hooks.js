import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { addStore, editStore } from '../api/stores';
import { updateProfile } from '../api/users';
import { storesState, userState } from '../store/atoms';
import { getErrorMessage } from '../utils/errorMessage';
import { formatStoreToMap } from '../utils/formatStore';

const useStoreState = () => {
  const user = useRecoilValue(userState);
  const setStores = useSetRecoilState(storesState);

  const save = storeEdition => {
    if (storeEdition.id) {
      return editStore(storeEdition.id, storeEdition, user).catch(err => ({
        error: err.message,
      }));
    } else {
      return addStore(storeEdition, user).catch(err => ({
        error: err.message,
      }));
    }
  };

  const saveStore = async storeEdition => {
    try {
      const response = await save(storeEdition);
      if (response.error) {
        return response;
      }
      const store = formatStoreToMap(response.store);
      setStores(stores => stores.concat(store));
      return { ...response, store };
    } catch (err) {
      return { error: err.message };
    }
  };

  return { saveStore };
};

const useFavoriteState = () => {
  const [loading, setLoading] = useState();
  const [user, setUser] = useRecoilState(userState);

  const addFavorite = async store => {
    if (!user || loading) {
      return;
    }
    setLoading(true);
    // Add store and get ids
    const favorites = [...user.favorites, store];
    setUser({ ...user, favorites });
    try {
      await updateProfile(user.jwt, {
        favorites: favorites.map(({ id }) => ({ id })),
      });
    } catch (err) {
      const error = getErrorMessage(err.message);
      setUser({
        ...user,
        favorites: user.favorites.filter(({ id }) => store.id !== id),
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async store => {
    if (!user || loading) {
      return;
    }
    setLoading(true);
    // Add store and get ids
    const favorites = user.favorites.filter(({ id }) => store.id !== id);
    setUser({ ...user, favorites });
    try {
      await updateProfile(user.jwt, {
        favorites: favorites.map(({ id }) => ({ id })),
      });
    } catch (err) {
      const error = getErrorMessage(err.message);
      setUser({
        ...user,
        favorites: [...user.favorites, store],
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { addFavorite, removeFavorite };
};

export { useStoreState, useFavoriteState };
