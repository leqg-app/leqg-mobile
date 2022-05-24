import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton, Title } from 'react-native-paper';
import { theme } from '../../constants';

import { useStore } from '../../store/context';

function StoreFeatures({ features }) {
  const [state] = useStore();

  if (!features.length) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      {state.features.map(category => {
        const feats = category.features.filter(({ id }) =>
          features.includes(id),
        );
        if (!feats.length) {
          return;
        }
        return (
          <View key={category.name} style={styles.category}>
            <Title style={styles.categoryName}>{category.name}</Title>
            <View style={styles.features}>
              {feats.map(({ id, name }) => (
                <View key={id} style={styles.feature}>
                  <IconButton
                    size={18}
                    icon="check"
                    color={theme.colors.primary}
                  />
                  <Text>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  category: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 14,
  },
  features: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feature: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 10,
    paddingBottom: 2,
  },
});

export default StoreFeatures;
