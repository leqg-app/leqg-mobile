import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetFooter, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSetRecoilState } from 'recoil';

import ActionButtons from '../../components/ActionButtons';
import ActionSheet from '../../components/ActionSheet';
import { sheetStoreState } from '../../store/atoms';
import ProductsList from '../../components/ProductsList';

function ProductFilter({ visible, selected, onClose, onChange }) {
  const sheet = useRef();
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    if (!selected) {
      setFilters([]);
    }
  }, [selected]);

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
      <BottomSheetTextInput
        style={styles.textInput}
        placeholder="Rechercher une bière"
      />
      <ProductsList initialSelected={filters} onChange={setFilters} />
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
  textInput: {
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#EEE',
    textAlign: 'left',
  },
});

export default ProductFilter;
