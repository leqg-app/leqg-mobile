import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import * as db from './database';
import {
  sheetStoreState,
  storeEditionState,
  storesState,
  storeState,
  userState,
} from './atoms';
import { addStore, editStore, getStoresVersion } from '../api/stores';
import { storage } from './storage';
import { storeToDatabase, storesToDatabase } from '../utils/formatStore';

// write-only helper to update both the sheet store and the store family atom
const updateStoreAtom = atom(null, (get, set, { id, store }) => {
  set(sheetStoreState, store);
  set(storeState(id), store);
});

function useStoreActions() {
  const navigation = useNavigation();
  const setSheetStore = useSetAtom(sheetStoreState);
  const setStoreEdition = useSetAtom(storeEditionState);
  const setStores = useSetAtom(storesState);
  const user = useAtomValue(userState);
  const updateStoreState = useSetAtom(updateStoreAtom);

  const editStoreScreen = store => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour modifier ce bar',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('AccountTab');
              setSheetStore();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }
    setStoreEdition(store);
    navigation.navigate('EditStoreScreen', {
      screen: 'EditStore',
      params: { store },
    });
  };

  const saveStore = async storeEdition => {
    try {
      let response;
      if (storeEdition.id) {
        response = await editStore(storeEdition.id, storeEdition, user);
      } else {
        response = await addStore(storeEdition, user);
      }

      const versions = storage.getObject('versions', {});
      const store = storeToDatabase(response.store);

      if (versions.stores + 1 === response.version) {
        db.setStore(store);
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
        const versioned = await getStoresVersion(
          versions.stores,
          response.version,
        );

        if (versioned?.updated || versioned?.deleted) {
          const { updated = [], deleted = [] } = versioned;
          const updatedIds = updated.map(([id]) => id);
          setStores(stores => {
            return stores
              .filter(
                store =>
                  !updatedIds.includes(store.id) && !deleted.includes(store.id),
              )
              .concat(updated.map(storesToDatabase));
          });
        }
      }

      updateStoreState({ id: response.store.id, store: response.store });

      storage.setObject('versions', {
        ...versions,
        stores: response.version,
      });

      return { ...response, store };
    } catch (error) {
      return { error };
    }
  };

  return { editStoreScreen, saveStore };
}

export { useStoreActions };
