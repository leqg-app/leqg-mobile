import React, { useMemo, useRef } from 'react';
import BottomSheet, {
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ActionSheet = React.forwardRef(({ children }, ref) => {
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
      ref={ref}
      index={-1}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      topInset={topbarHeight - 20}>
      <BottomSheetView onLayout={handleContentLayout}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ActionSheet;
