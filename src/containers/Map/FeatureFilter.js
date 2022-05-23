import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Title } from 'react-native-paper';
import { BottomSheetFooter } from '@gorhom/bottom-sheet';

import ActionButtons from '../../components/ActionButtons';
import ActionSheet from '../../components/ActionSheet';
import Badge from '../../components/Badge';
import { useStore } from '../../store/context';

function FeatureFilter({ visible, features, onClose, onChange }) {
  const sheet = useRef();
  const [state] = useStore();
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
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
  }, [visible]);

  const close = useCallback(() => {
    sheet.current.close();
    onClose();
  }, []);

  const selectFilter = id => {
    if (filters.includes(id)) {
      setFilters(filters.filter(featureId => featureId !== id));
    } else {
      setFilters(filters.concat(id));
    }
  };

  const submit = useCallback(() => {
    onChange(filters.length && filters);
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
        {state.features.map(({ name, features }) => (
          <View key={name}>
            <Title style={styles.title}>{name}</Title>
            <View style={styles.featureList}>
              {features.map(feature => (
                <Badge
                  key={feature.id}
                  selected={filters.includes(feature.id)}
                  onSelect={() => selectFilter(feature.id)}>
                  {feature.name}
                </Badge>
              ))}
            </View>
          </View>
        ))}
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
  title: {
    marginVertical: 10,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButtons: {
    backgroundColor: 'white',
    marginTop: 15,
    marginBottom: 5,
  },
});

export default FeatureFilter;
