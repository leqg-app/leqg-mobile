import React from 'react';

import { StoreProvider } from './store/context';
import Map from './Map';

const App = () => {
  return (
    <StoreProvider>
      <Map />
    </StoreProvider>
  );
};

export default App;
