import React from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from './store/context';
import Routes from './Routes';
import { theme } from './constants';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StoreProvider>
        <PaperProvider theme={theme}>
          <Routes />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
