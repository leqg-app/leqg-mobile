import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetFooter } from '@gorhom/bottom-sheet';
import { useSetRecoilState } from 'recoil';

import ActionButtons from '../../components/ActionButtons';
import ActionSheet from '../../components/ActionSheet';
import FeaturesList from '../../components/FeaturesList';
import { sheetStoreState } from '../../store/atoms';

function FeatureFilter({ visible, features, onClose, onChange }) {
  const sheet = useRef();
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    if (!features) {
      setFilters([]);
    }
  }, [features]);

  useEffect(() => {
    if (!sheet.current) {
      return;
    }
    if (visible) {
      setSheetStore();
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
  }, [visible]);

  const close = useCallback(() => {
    sheet.current.close();
    onClose();
  }, []);

  const submit = useCallback(() => {
    onChange(filters.length && filters.map(({ id }) => id));
    close();
  }, [filters]);

  const renderFooter = useCallback(
    props => (
      <BottomSheetFooter {...props}>
        <View style={styles.actions}>
          <ActionButtons onCancel={close} onSubmit={submit} submitLabel="OK" />
        </View>
      </BottomSheetFooter>
    ),
    [submit],
  );

  return (
    <ActionSheet
      ref={sheet}
      onDismiss={close}
      backdrop
      snaps={['80%']}
      footer={renderFooter}>
      <View style={styles.sheet}>
        <FeaturesList initialSelected={filters} onChange={setFilters} />
      </View>
    </ActionSheet>
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
