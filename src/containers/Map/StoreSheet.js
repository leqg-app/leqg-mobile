import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton, Portal, Title } from 'react-native-paper';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useStore } from '../../store/context';
import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';

const StoreSheet = () => {
  const sheet = useRef(null);
  const navigation = useNavigation();
  const [previewHeight, setPreviewHeight] = useState(0);
  const [state, actions] = useStore();
  const sheetPosition = useSharedValue(0);
  const { top, bottom } = useSafeAreaInsets();

  const topbarHeight = top + 50;
  const sheetHeight = bottom + 170;

  const initialSnapPoints = useMemo(() => [sheetHeight, '100%'], []);

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

  const getPreviewHeight = event =>
    setPreviewHeight(event.nativeEvent.layout.height - 40);

  const animatedContent = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          sheetPosition.value,
          [0.5, 1],
          [0, -previewHeight],
        ),
      },
    ],
    opacity: sheetPosition.value,
  }));
  const contentStyle = useMemo(
    () => [styles.sheetContent, animatedContent],
    [animatedContent],
  );

  useEffect(() => {
    if (!sheet.current) {
      return;
    }
    if (state.sheetStore) {
      actions.getStore(state.sheetStore.id);
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
  }, [state.sheetStore]); // eslint-disable-line react-hooks/exhaustive-deps

  const store = state.storesDetails[state.sheetStore?.id];
  return (
    <Portal>
      <Animated.View style={topBarStyle}>
        <IconButton
          size={30}
          style={styles.arrow}
          icon="chevron-down"
          onPress={() => sheet.current.snapToIndex(0)}
        />
      </Animated.View>
      <BottomSheet
        ref={sheet}
        index={-1}
        snapPoints={initialSnapPoints}
        animatedIndex={sheetPosition}
        topInset={topbarHeight - 20}
        enablePanDownToClose
        onClose={() => state.sheetStore && actions.setSheetStore()}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Pressable
            onPress={() => sheet.current.snapToIndex(1)}
            onLayout={getPreviewHeight}>
            <View style={styles.previewContainer}>
              <Title numberOfLines={1} style={styles.title}>
                {store?.name || state.sheetStore?.name}
              </Title>
              <View style={styles.preview}>
                <View style={styles.previewSchedules}>
                  {state.sheetStore?.schedules && (
                    <SchedulesPreview
                      schedules={store?.schedules || state.sheetStore.schedules}
                    />
                  )}
                </View>
                <Text numberOfLines={1}>
                  {store?.address || state.sheetStore?.address}
                </Text>
              </View>
            </View>
          </Pressable>
          <Animated.View style={contentStyle}>
            {store && <Store navigation={navigation} store={store} />}
          </Animated.View>
        </BottomSheetScrollView>
      </BottomSheet>
    </Portal>
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
  previewContainer: {
    minHeight: 93,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  preview: {
    marginHorizontal: 16,
    marginBottom: 15,
  },
  previewSchedules: {
    marginTop: 10,
    marginBottom: 17,
  },
  loading: {
    marginTop: 10,
  },
});

export default StoreSheet;
