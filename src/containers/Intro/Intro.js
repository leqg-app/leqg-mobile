import React, { useEffect } from 'react';
import AppIntro from 'react-native-intro-screens';
import RNBootSplash from 'react-native-bootsplash';
import { IconButton } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '../../constants';
import LocationPermission from './LocationPermission';

function Intro({ navigation }) {
  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  const next = async () => {
    navigation.navigate('LocationPermission');
  };

  const pages = [
    {
      title: 'Trouvez votre bar !',
      description: 'Selon le prix, le lieu, la bière, les horaires...',
      img: (
        <IconButton
          testID="map-search-icon"
          icon="map-search"
          color="white"
          size={70}
        />
      ),
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
      onDoneBtnClick={next}
      onSkipBtnClick={next}
      doneBtnLabel="OK"
      skipBtnLabel="Passer"
      pageArray={pages}
      showsPagination
    />
  );
}

const IntroStack = createNativeStackNavigator();

export default () => (
  <IntroStack.Navigator>
    <IntroStack.Screen
      options={{ headerShown: false }}
      name="Intro"
      component={Intro}
    />
    <IntroStack.Screen
      options={{ headerShown: false }}
      name="LocationPermission"
      component={LocationPermission}
    />
  </IntroStack.Navigator>
);
