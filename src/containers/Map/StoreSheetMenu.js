import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';

import { storeState } from '../../store/atoms';
import { useStoreActions } from '../../store/storeActions';
import { shareStore } from '../Store/Store';

const StoreSheetMenu = ({ id }) => {
  const [menu, setMenu] = useState(false);
  const { top } = useSafeAreaInsets();
  const { editStoreScreen } = useStoreActions();
  const store = useRecoilValue(storeState(id));

  return (
    <Menu
      visible={menu}
      onDismiss={() => setMenu(false)}
      style={{ marginTop: top }}
      anchor={
        <IconButton
          size={30}
          icon="dots-vertical"
          onPress={() => setMenu(true)}
        />
      }>
      <Menu.Item
        onPress={() => editStoreScreen(store)}
        title="Suggérer une modification"
      />
      <Menu.Item onPress={() => shareStore(store)} title="Partager le lieu" />
      {/* <Menu.Item onPress={() => {}} title="Signaler le lieu" /> */}
    </Menu>
  );
};

export default StoreSheetMenu;
