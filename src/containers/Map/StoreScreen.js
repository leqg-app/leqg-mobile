import React, { useMemo, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Title } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';

import { useStore } from '../../store/context';
import StoreDetails from './StoreDetails';

const StoreScreen = props => {
  const [state, actions] = useStore();
  const fall = new Animated.Value(1);

  const animatedTitlePosition = Animated.interpolateNode(fall, {
    inputRange: [0, 0.5],
    outputRange: [50, 15],
    extrapolate: Animated.Extrapolate.CLAMP,
  });
  const animatedDetailsHeight = Animated.interpolateNode(fall, {
    inputRange: [0, 0.5],
    outputRange: [0, 50],
    extrapolate: Animated.Extrapolate.CLAMP,
  });

  useEffect(() => {
    if (props.store?.id) {
      actions.getStore(props.store?.id);
    }
  }, [props.store?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sheetSize = useMemo(
    () => (120 / Dimensions.get('window').height) * 100,
    [],
  );

  const renderContent = () => {
    const store = state.storesDetails[props.store?.id];
    if (!store) {
      return (
        <View style={styles.sheetContent}>
          <Animated.View style={{ marginTop: animatedTitlePosition }}>
            <Title style={styles.title}>{props.store?.name}</Title>
          </Animated.View>
          <ActivityIndicator style={styles.loading} />
        </View>
      );
    }
    return (
      <View style={styles.sheetContent}>
        <Animated.View style={{ marginTop: animatedTitlePosition }}>
          <Title numberOfLines={1} style={styles.title}>
            {store.name}
          </Title>
        </Animated.View>
        <Animated.View
          style={[styles.preview, { height: animatedDetailsHeight }]}>
          <Text style={styles.previewSchedules}>Ouvert</Text>
          <Text numberOfLines={1}>{store.address}</Text>
        </Animated.View>
        {store && <StoreDetails store={store} />}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={props.sheetRef}
      callbackNode={fall}
      snapPoints={['0%', `${sheetSize}%`, '100%']}
      borderRadius={10}
      renderContent={renderContent}
    />
  );
};

const styles = StyleSheet.create({
  sheetContent: { backgroundColor: 'white', minHeight: '100%' },
  title: {
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  preview: {
    marginHorizontal: 16,
    marginBottom: 15,
  },
  previewSchedules: {
    marginBottom: 7,
  },
  loading: {
    marginTop: 10,
  },
});

export default StoreScreen;
