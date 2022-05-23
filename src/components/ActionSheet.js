import React, { useEffect, useMemo, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from 'react-native-paper';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';

let currentIndex = -1;

const ActionSheet = React.forwardRef(
  ({ children, onDismiss = () => {}, backdrop, snaps, footer }, ref) => {
    const { top } = useSafeAreaInsets();

    const topbarHeight = useMemo(() => top + 30, []);
    const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

    const {
      animatedHandleHeight,
      animatedSnapPoints,
      animatedContentHeight,
      handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        function () {
          if (currentIndex !== -1) {
            ref.current.close();
            return true;
          }
          return false;
        },
      );
      return () => backHandler.remove();
    }, []);

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );
    const onChange = useCallback(index => (currentIndex = index), []);

    if (snaps) {
      return (
        <Portal>
          <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snaps}
            enablePanDownToClose
            onClose={onDismiss}
            onChange={onChange}
            backdropComponent={backdrop && renderBackdrop}
            topInset={topbarHeight}>
            <BottomSheetScrollView>{children}</BottomSheetScrollView>
          </BottomSheet>
        </Portal>
      );
    }

    return (
      <Portal>
        <BottomSheet
          ref={ref}
          index={-1}
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          enablePanDownToClose
          onClose={onDismiss}
          onChange={onChange}
          backdropComponent={backdrop && renderBackdrop}
          topInset={topbarHeight}>
          <BottomSheetView onLayout={handleContentLayout}>
            {children}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  },
);

export default ActionSheet;
