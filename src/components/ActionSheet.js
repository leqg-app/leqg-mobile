import React, { useMemo, useRef } from 'react';
import BottomSheet, {
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ActionSheet({ children }) {
  const bottomSheetRef = useRef();
  const { top } = useSafeAreaInsets();
  const topbarHeight = top + 50;

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      topInset={topbarHeight - 20}>
      <BottomSheetView onLayout={handleContentLayout}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

export default ActionSheet;
