import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useStore } from '../../store/context';
import FeaturesList from '../../components/FeaturesList';

const EditFeatures = ({ navigation }) => {
  const [state, actions] = useStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton color="white" icon="send" onPress={navigation.goBack} />
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
        <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
          <FeaturesList
            initialSelected={state.storeEdition.features}
            onChange={features => actions.setStoreEdition({ features })}
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
});

export default EditFeatures;
