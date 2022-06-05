import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetFooter, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRecoilState, useSetRecoilState } from 'recoil';

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

  const renderFooter = useCallback(
    props => (
      <BottomSheetFooter {...props}>
        <View style={styles.actions}>
          <ActionButtons
            onCancel={closeModal}
            onSubmit={submit}
            submitLabel="OK"
          />
        </View>
      </BottomSheetFooter>
    ),
    [submit],
  );

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
        footer={renderFooter}>
        <BottomSheetScrollView>
          <View style={styles.sheet}>
            <FeaturesList initialSelected={filters} onChange={setFilters} />
          </View>
        </BottomSheetScrollView>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  actions: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
  actionButtons: {
    backgroundColor: 'white',
    marginTop: 15,
    marginBottom: 5,
  },
});

export default FeatureFilter;
