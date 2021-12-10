import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, IconButton, Title } from 'react-native-paper';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '../../store/context';
import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';

const StoreSheet = props => {
  const [state, actions] = useStore();
  const sheetPosition = useSharedValue(0);
  const { top } = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['CONTENT_HEIGHT', '100%'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(snapPoints);

  const topbarHeight = top + 50;

  const animatedTopBar = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          sheetPosition.value,
          [0.5, 1],
          [-topbarHeight, 0],
        ),
      },
    ],
    opacity: sheetPosition.value,
  }));
  const topBarStyle = useMemo(
    () => [styles.topBarWrapper, animatedTopBar, { height: topbarHeight }],
    [animatedTopBar],
  );

  const animatedContent = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(sheetPosition.value, [0.5, 1], [0, -60]),
      },
    ],
  }));
  const contentStyle = useMemo(
    () => [styles.sheetContent, animatedContent],
    [animatedContent],
  );

  useEffect(() => {
    if (props.store?.id) {
      actions.getStore(props.store?.id);
    }
  }, [props.store?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const store = state.storesDetails[props.store?.id];
  return (
    <>
      <Animated.View style={topBarStyle}>
        <IconButton
          size={30}
          style={styles.arrow}
          icon="chevron-down"
          onPress={() => props.sheet.current.snapToIndex(0)}
        />
      </Animated.View>
      <BottomSheet
        ref={props.sheet}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        animatedIndex={sheetPosition}
        topInset={topbarHeight - 20}
        onChange={position => position === -1 && props.dismissStore()}>
        <View style={styles.sheetContent}>
          <BottomSheetView onLayout={handleContentLayout}>
            <Pressable onPress={() => props.sheet.current.snapToIndex(1)}>
              <Title numberOfLines={1} style={styles.title}>
                {store?.name || props.store?.name}
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
          </BottomSheetView>
          <Animated.View style={contentStyle}>
            {store && <Store store={store} />}
          </Animated.View>
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  arrow: {
    marginLeft: 20,
    bottom: -10,
    position: 'absolute',
  },
  topBarWrapper: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
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
    marginVertical: 10,
  },
});

export default StoreSheet;
