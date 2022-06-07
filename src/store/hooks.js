import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { addStore, editStore, getStoresVersion } from '../api/stores';
import { updateProfile } from '../api/users';
import { storesState, userState } from '../store/atoms';
import { getErrorMessage } from '../utils/errorMessage';
import { decompressStore, formatStoreToMap } from '../utils/formatStore';
import { storage } from './storage';

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

      const versions = storage.getObject('versions', {});
      const store = formatStoreToMap(response.store);

      if (versions.stores + 1 === response.version) {
        setStores(stores => {
          if (!storeEdition.id) {
            return stores.concat(store);
          }
          return stores
            .filter(({ id }) => id !== storeEdition.id)
            .concat(store);
        });
      } else {
        // Another changes were made before, get them all
        const { updated } = await getStoresVersion(
          versions.stores,
          response.version,
        );

        setStores(stores => {
          return stores
            .filter(store => updated.every(([id]) => store.id !== id))
            .concat(updated.map(decompressStore));
        });
      }

      storage.setObject('versions', {
        ...versions,
        stores: response.version,
      });

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
