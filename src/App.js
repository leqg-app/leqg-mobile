import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from './store/context';
import Routes from './Routes';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'green',
    accent: 'yellow',
  },
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <PaperProvider theme={theme}>
          <Routes />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
};

export default App;
