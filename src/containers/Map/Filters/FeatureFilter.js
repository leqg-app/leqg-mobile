import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAtom, useSetAtom } from 'jotai';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionButtons from '../../../components/ActionButtons';
import ActionSheet from '../../../components/ActionSheet';
import FeaturesList from '../../../components/FeaturesList';
import Filter from '../../../components/Filter';
import { sheetStoreState } from '../../../store/atoms';
import { featureFilterState } from '../../../store/filterAtoms';

function FeatureFilter() {
  const sheet = useRef();
  const setSheetStore = useSetAtom(sheetStoreState);
  const [featureFilter, setFeatureFilter] = useAtom(featureFilterState);
  const [filters, setFilters] = useState([]);
  const { bottom } = useSafeAreaInsets();

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

  return (
    <>
      <Filter
        onPress={openModal}
        onRemove={featureFilter && (() => setFeatureFilter(null))}>
        Caractéristique
      </Filter>
      <ActionSheet
        ref={sheet}
        onDismiss={closeModal}
        backdrop
        snaps={['80%']}
        footer={() => (
          <View style={[styles.footerSheet, { paddingBottom: bottom }]}>
            <ActionButtons
              onCancel={closeModal}
              onSubmit={submit}
              submitLabel="OK"
            />
          </View>
        )}>
        <ScrollView style={{ paddingHorizontal: 15 }}>
          <FeaturesList initialSelected={filters} onChange={setFilters} />
        </ScrollView>
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
});

export default FeatureFilter;
