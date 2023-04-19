import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionButtons from '../../../components/ActionButtons';
import ActionSheet from '../../../components/ActionSheet';
import FeaturesList from '../../../components/FeaturesList';
import Filter from '../../../components/Filter';
import { sheetStoreState } from '../../../store/atoms';
import { featureFilterState } from '../../../store/filterAtoms';

function FeatureFilter() {
  const sheet = useRef();
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [featureFilter, setFeatureFilter] = useRecoilState(featureFilterState);
  const [filters, setFilters] = useState([]);
  const { bottom } = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(117);

  const openModal = () => {
    setSheetStore();
    sheet.current?.snapToIndex?.(0);
  };

  const closeModal = () => {
    sheet.current?.close();
  };

  const submit = useCallback(() => {
    setFeatureFilter(filters.length && filters.map(({ id }) => id));
    closeModal();
  }, [filters]);

  const onLayoutFooter = event =>
    setFooterHeight(event.nativeEvent.layout.height);

  return (
    <>
      <Filter
        onPress={openModal}
        onRemove={featureFilter && (() => setFeatureFilter(null))}>
        Caractéristique
      </Filter>
      <ActionSheet ref={sheet} onDismiss={closeModal} backdrop snaps={['80%']}>
        <ScrollView
          style={{ paddingHorizontal: 15, marginBottom: footerHeight }}>
          <FeaturesList initialSelected={filters} onChange={setFilters} />
        </ScrollView>
        <View
          style={[styles.footerSheet, { paddingBottom: bottom }]}
          onLayout={onLayoutFooter}>
          <ActionButtons
            onCancel={closeModal}
            onSubmit={submit}
            submitLabel="OK"
          />
        </View>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  footerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
});

export default FeatureFilter;
