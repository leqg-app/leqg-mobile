import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

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
    <StoreProvider>
      <PaperProvider theme={theme}>
        <Routes />
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;
