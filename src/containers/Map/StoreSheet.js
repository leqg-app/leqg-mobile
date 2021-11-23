import React, { useEffect, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Title } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';

import Header from '../../components/Header';
import { useStore } from '../../store/context';
import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';

const StoreSheet = props => {
  const [state, actions] = useStore();
  const fall = useRef(new Animated.Value(1)).current;

  const animatedTopbar = Animated.interpolateNode(fall, {
    inputRange: [0, 0.5],
    outputRange: [0, -120],
    extrapolate: Animated.Extrapolate.CLAMP,
  });
  const animatedDetails = Animated.interpolateNode(fall, {
    inputRange: [0, 0.5],
    outputRange: [-70, 0],
    extrapolate: Animated.Extrapolate.CLAMP,
  });

  useEffect(() => {
    if (props.store?.id) {
      actions.getStore(props.store?.id);
    }
  }, [props.store?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sheetSize = (() => {
    const { height } = Dimensions.get('window');
    const two = (120 / height) * 100;
    const three = 100 - 8000 / height;
    return ['0%', `${two}%`, `${three}%`];
  })();

  const renderContent = () => {
    const store = state.storesDetails[props.store?.id];
    return (
      <View style={styles.sheetContent}>
        <Pressable onPress={() => props.sheet.current.snapTo(2)}>
          <Title numberOfLines={1} style={styles.title}>
            {props.store?.name}
          </Title>
          {store ? (
            <View style={styles.preview}>
              <View style={styles.previewSchedules}>
                <SchedulesPreview schedules={store.schedules} />
              </View>
              <Text numberOfLines={1}>{store.address}</Text>
            </View>
          ) : (
            <ActivityIndicator style={styles.loading} />
          )}
        </Pressable>
        <Animated.View
          style={{ top: animatedDetails, backgroundColor: 'white' }}>
          {store && <Store store={store} />}
        </Animated.View>
      </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.topBarWrapper, { top: animatedTopbar }]}>
        <Header style={styles.topBar}>
          <Appbar.Action
            icon="chevron-down"
            onPress={() => props.sheet.current.snapTo(1)}
          />
        </Header>
      </Animated.View>
      <BottomSheet
        ref={props.sheet}
        callbackNode={fall}
        snapPoints={sheetSize}
        borderRadius={10}
        renderContent={renderContent}
      />
    </>
  );
};

const styles = StyleSheet.create({
  topBarWrapper: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  topBar: {
    backgroundColor: 'white',
  },
  sheetContent: { backgroundColor: 'white', minHeight: '100%' },
  title: {
    fontWeight: 'bold',
    marginTop: 15,
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

export default StoreSheet;
