import React, { useEffect } from 'react';
import AppIntro from 'react-native-intro-screens';
import RNBootSplash from 'react-native-bootsplash';
import { IconButton } from 'react-native-paper';

import { theme } from './constants';
import { storage } from './store/storage';
import { useStore } from './store/context';

function Splash() {
  const [, actions] = useStore();

  useEffect(() => {
    RNBootSplash.hide({ fade: true });
    Promise.all([
      actions.getStores(),
      actions.getProducts(),
      actions.getUser(),
    ]);
  }, []);

  const done = () => storage.setBool('firstOpen', true);

  const pages = [
    {
      title: 'Trouvez votre bar !',
      description: 'Selon le prix, le lieu, la bière, les horaires...',
      img: <IconButton icon="map-search" color="white" size={70} />,
      imgStyle: {
        height: 100,
        width: 100,
      },
      backgroundColor: theme.colors.primary,
      fontColor: '#fff',
      level: 10,
    },
    {
      title: 'Participez !',
      description: 'Ajoutez et modifiez les bars, aidez la communauté',
      img: <IconButton icon="account-group" color="white" size={70} />,
      imgStyle: {
        height: 100,
        width: 100,
      },
      backgroundColor: theme.colors.primary,
      fontColor: '#fff',
      level: 10,
    },
  ];
  return (
    <AppIntro
      onDoneBtnClick={done}
      onSkipBtnClick={done}
      doneBtnLabel="OK"
      skipBtnLabel="Passer"
      pageArray={pages}
      showsPagination
    />
  );
}

export default Splash;
