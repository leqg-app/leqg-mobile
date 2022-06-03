import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { version } from '../../package.json';

const VersionName = () => {
  return <Text style={styles.versionName}>Version {version}</Text>;
};

const styles = StyleSheet.create({
  versionName: {
    padding: 20,
    color: '#777',
  },
});

export default VersionName;
