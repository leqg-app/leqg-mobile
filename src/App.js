import React from 'react';
import { LogBox, StyleSheet, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';

import Routes from './Routes';
import { CombinedDarkTheme, CombinedDefaultTheme } from './theme';

Sentry.init({
  dsn: 'https://247aa8fba4ca46688925bf9823ba239e@o1079194.ingest.sentry.io/6083816',
  tracesSampleRate: 1.0,
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
});

if (__DEV__) {
  // @gorhom/bottom-sheet@4.1.5
  LogBox.ignoreLogs([
    /ViewPropType/, // react-native-mapbox-gl
    /eglSwapBuffer/,
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  ]);
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer
            theme={theme}
            onReady={() => {
              BootSplash.hide();
            }}>
            <Routes />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Sentry.wrap(App);
