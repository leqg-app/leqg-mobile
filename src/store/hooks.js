import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { updateProfile } from '../api/users';
import { userState } from '../store/atoms';

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

export { useFavoriteState };
