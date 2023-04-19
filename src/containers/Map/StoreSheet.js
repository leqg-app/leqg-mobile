import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Portal, Text, Title, useTheme } from 'react-native-paper';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilState } from 'recoil';
import { ErrorBoundary } from 'react-error-boundary';

import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';
import { sheetStoreState } from '../../store/atoms';
import StoreSheetMenu from './StoreSheetMenu';

const StoreSheet = () => {
  const { colors } = useTheme();
  const sheet = useRef(null);
  const lastSheetStore = useRef(null);
  const [sheetStore, setSheetStore] = useRecoilState(sheetStoreState);
  const [previewHeight, setPreviewHeight] = useState(0);
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
  const topBarStyle = useMemo(() => animatedTopBar, [animatedTopBar]);

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
  const sheetStyle = { backgroundColor: colors.background, minHeight: '100%' };
  const contentStyle = useMemo(
    () => [sheetStyle, animatedContent],
    [animatedContent],
  );

  useEffect(() => {
    if (!sheet.current) {
      return;
    }
    if (sheetStore) {
      if (!lastSheetStore.current) {
        sheet.current.snapToIndex(0);
      }
    } else {
      sheet.current.close();
    }
    lastSheetStore.current = sheetStore;
  }, [sheetStore]);

  return (
    <Portal>
      <Animated.View
        style={[
          styles.topBarWrapper,
          topBarStyle,
          {
            height: topbarHeight,
            paddingTop: top,
            backgroundColor: colors.background,
          },
        ]}>
        <IconButton
          size={30}
          icon="chevron-down"
          onPress={() => sheet.current.snapToIndex(0)}
        />
        {sheetStore?.id && (
          <ErrorBoundary fallback={<></>}>
            <Suspense fallback={<></>}>
              {<StoreSheetMenu id={sheetStore.id} />}
            </Suspense>
          </ErrorBoundary>
        )}
      </Animated.View>
      <BottomSheet
        ref={sheet}
        index={-1}
        snapPoints={initialSnapPoints}
        animatedIndex={sheetPosition}
        topInset={topbarHeight - 20}
        handleStyle={{ backgroundColor: colors.background }}
        backgroundStyle={{ backgroundColor: colors.background }}
        enablePanDownToClose
        onClose={() => sheetStore && setSheetStore()}>
        <BottomSheetScrollView contentContainerStyle={sheetStyle}>
          <Pressable
            onPress={() => sheet.current.snapToIndex(1)}
            onLayout={getPreviewHeight}>
            <View style={styles.previewContainer}>
              <Title numberOfLines={1} style={styles.title}>
                {sheetStore?.name}
              </Title>
              <View style={styles.preview}>
                <View style={styles.previewSchedules}>
                  {sheetStore?.schedules && (
                    <SchedulesPreview schedules={sheetStore.schedules} />
                  )}
                </View>
                <Text numberOfLines={1}>{sheetStore?.address}</Text>
              </View>
            </View>
          </Pressable>
          <Animated.View style={contentStyle}>
            <Store />
          </Animated.View>
        </BottomSheetScrollView>
      </BottomSheet>
    </Portal>
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
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
