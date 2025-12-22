import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useAtom } from 'jotai';

import FeaturesList from '../../components/FeaturesList';
import { storeEditionState } from '../../store/atoms';

const EditFeatures = ({ navigation }) => {
  const [storeEdition, setStoreEdition] = useAtom(storeEditionState);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton color="white" icon="check" onPress={navigation.goBack} />
      ),
    });
  }, []);

  return (
    <>
      <View>
        <Text style={styles.helpText}>
          Sélectionnez des caractéristiques décrivant au mieux ce lieu
        </Text>
      </View>
      <ScrollView>
        <View style={styles.features}>
          <FeaturesList
            initialSelected={storeEdition.features}
            onChange={features =>
              setStoreEdition({ ...storeEdition, features })
            }
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  helpText: {
    fontSize: 15,
    padding: 15,
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  features: { marginHorizontal: 15, marginBottom: 15 },
});

export default EditFeatures;
