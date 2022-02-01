import React from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from './store/context';
import Routes from './Routes';
import { theme } from './constants';

// @gorhom/bottom-sheet@4.1.5
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

if (!__DEV__) {
  Sentry.init({
    dsn: 'https://247aa8fba4ca46688925bf9823ba239e@o1079194.ingest.sentry.io/6083816',
    tracesSampleRate: 1.0,
  });
}

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StoreProvider>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <Routes />
          </SafeAreaProvider>
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

export default Sentry.wrap(App);
