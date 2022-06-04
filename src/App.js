import React from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecoilRoot } from 'recoil';

import Routes from './Routes';
import { theme } from './constants';

// eslint-disable-next-line
if (!__DEV__) {
  Sentry.init({
    dsn: 'https://247aa8fba4ca46688925bf9823ba239e@o1079194.ingest.sentry.io/6083816',
    tracesSampleRate: 1.0,
  });
} else {
  // @gorhom/bottom-sheet@4.1.5
  LogBox.ignoreLogs([
    /ViewPropType/, // react-native-mapbox-gl
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  ]);
}

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <RecoilRoot>
            <Routes />
          </RecoilRoot>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Sentry.wrap(App);
