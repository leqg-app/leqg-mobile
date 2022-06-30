import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, Title } from 'react-native-paper';
import { useRecoilValue } from 'recoil';

import { theme } from '../../constants';
import { featuresState } from '../../store/atoms';

function StoreFeatures(props) {
  const features = useRecoilValue(featuresState);

  if (!features.length) {
    return <View />;
  }

  const featuresId = props.features.map(({ id }) => id);

  return (
    <View style={styles.container}>
      {features.map(category => {
        const categoryFeatures = category.features.filter(({ id }) =>
          featuresId.includes(id),
        );
        if (!categoryFeatures.length) {
          return;
        }
        return (
          <View key={category.name} style={styles.category}>
            <Title style={styles.categoryName}>{category.name}</Title>
            <View style={styles.features}>
              {categoryFeatures.map(({ id, name }) => (
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
