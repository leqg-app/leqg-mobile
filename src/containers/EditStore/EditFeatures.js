import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useRecoilState } from 'recoil';

import FeaturesList from '../../components/FeaturesList';
import { storeEditionState } from '../../store/atoms';

const EditFeatures = ({ navigation }) => {
  const [storeEdition, setStoreEdition] = useRecoilState(storeEditionState);

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
        <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
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
});

export default EditFeatures;
