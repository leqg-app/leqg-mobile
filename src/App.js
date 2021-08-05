import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import { StoreProvider } from './store/context';
import Routes from './Routes';

const App = () => {
  return (
    <StoreProvider>
      <PaperProvider>
        <Routes />
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;
