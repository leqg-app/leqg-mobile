import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Portal, Text, Title, useTheme } from 'react-native-paper';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ErrorBoundary } from 'react-error-boundary';
import StarRating from 'react-native-star-rating-widget';

import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';
import { sheetStoreState } from '../../store/atoms';
import StoreSheetMenu from './StoreSheetMenu';
import StoreRateCount from './StoreRateCount';

const StoreSheet = () => {
  const { colors } = useTheme();
  const sheet = useRef(null);
  const lastSheetStore = useRef(null);
  const [sheetStore, setSheetStore] = useAtom(sheetStoreState);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [show, setShow] = useState(false);
  const sheetPosition = useSharedValue(0);
  const { top, bottom } = useSafeAreaInsets();

  const topbarHeight = top + 50;
  const sheetHeight = bottom + 170;

  useFocusEffect(() => {
    const event = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (sheetStore) {
          setSheetStore();
          return true;
        }
        return false;
      },
    );
    return () => event.remove();
  });

  useEffect(() => {
    if (!sheet.current) {
      setShow(false);
      return;
    }
    if (sheetStore) {
      if (!lastSheetStore.current) {
        sheet.current.snapToIndex(0);
      }
      setTimeout(() => setShow(true), 300);
    } else {
      sheet.current.close();
      setShow(false);
    }
    lastSheetStore.current = sheetStore;
  }, [sheetStore]);

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
          [0, -previewHeight + (sheetStore?.rate ? 20 : -2)],
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

  return (
    <Portal>
      {show && (
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
                <StoreSheetMenu id={sheetStore.id} />
              </Suspense>
            </ErrorBoundary>
          )}
        </Animated.View>
      )}
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
              {sheetStore?.rate ? (
                <View style={styles.rateRow}>
                  <Text style={styles.rate}>
                    {sheetStore?.rate.toFixed(1).replace('.', ',')}
                  </Text>
                  <StarRating
                    rating={sheetStore?.rate}
                    starSize={15}
                    starStyle={styles.stars}
                    onChange={() => {}}
                  />
                  {sheetStore?.id && (
                    <ErrorBoundary fallback={<></>}>
                      <Suspense fallback={<></>}>
                        <StoreRateCount id={sheetStore.id} />
                      </Suspense>
                    </ErrorBoundary>
                  )}
                </View>
              ) : null}
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
          {show && (
            <Animated.View style={contentStyle}>
              <Store sheetStore={sheetStore} />
            </Animated.View>
          )}
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
  rateRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 5,
  },
  rate: {
    color: 'grey',
    fontSize: 14,
    marginRight: 6,
  },
  stars: {
    marginHorizontal: 0,
  },
  preview: {
    marginHorizontal: 16,
    marginBottom: 15,
  },
  previewSchedules: {
    marginTop: 6,
    marginBottom: 8,
  },
  loading: {
    marginTop: 10,
  },
});

export default StoreSheet;
