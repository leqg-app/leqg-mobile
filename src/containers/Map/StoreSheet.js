import React, { useEffect, useRef, Suspense } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { ErrorBoundary } from 'react-error-boundary';
import StarRating from 'react-native-star-rating-widget';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SchedulesPreview from '../Store/SchedulesPreview';
import Store from '../Store/Store';
import { sheetStoreState } from '../../store/atoms';
import StoreRateCount from './StoreRateCount';

const StoreSheet = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const sheet = useRef(null);
  const [sheetStore, setSheetStore] = useAtom(sheetStoreState);

  useFocusEffect(() => {
    const event = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (sheetStore) {
          sheet.current.dismiss();
          return true;
        }
        return false;
      },
    );
    return () => event.remove();
  });

  useEffect(() => {
    if (!sheet.current) {
      return;
    }
    if (sheetStore) {
      sheet.current.present(0);
    } else {
      sheet.current.dismiss();
    }
  }, [sheetStore]);

  return (
    <TrueSheet
      ref={sheet}
      detents={['0.4', '1']}
      scrollable
      onDidDismiss={() => setSheetStore()}
      maxHeight={Dimensions.get('window').height - insets.top}
      header={
        <View style={styles.previewHeader}>
          <Text variant="headlineLarge" style={styles.title}>
            {sheetStore?.name}
          </Text>
          <View style={styles.closeButtonWrapper}>
            <IconButton
              icon="close"
              size={20}
              style={styles.closeButton}
              onPress={() => setSheetStore()}
            />
          </View>
        </View>
      }>
      <ScrollView nestedScrollEnabled>
        <Pressable onPress={() => sheet.current.resize(1)}>
          <View>
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
                  color={colors.primary}
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
        <Store sheetStore={sheetStore} />
      </ScrollView>
    </TrueSheet>
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
  previewHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
  title: {
    marginTop: 5,
    marginLeft: 15,
    fontWeight: 'bold',
    lineHeight: 28,
    fontSize: 23,
    flex: 1,
  },
  rateRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginHorizontal: 15,
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
    marginBottom: 5,
  },
  previewSchedules: {
    marginBottom: 8,
  },
  loading: {
    marginTop: 10,
  },
  closeButtonWrapper: {
    alignItems: 'flex-end',
    marginRight: 15,
    minWidth: 60,
  },
  closeButton: {
    backgroundColor: '#eee',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
  },
});

export default StoreSheet;
