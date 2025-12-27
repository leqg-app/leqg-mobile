import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, Text, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarRheostat } from 'react-native-rheostat';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { BottomSheetFooter } from '@gorhom/bottom-sheet';

import Filter from '../../../components/Filter';
import ActionSheet from '../../../components/ActionSheet';
import ActionButtons from '../../../components/ActionButtons';
import { sheetStoreState, storesState } from '../../../store/atoms';
import {
  scheduleFilterState,
  mapBoundsState,
} from '../../../store/filterAtoms';
import { daysFull } from '../../../constants';
import { minutesToTime } from '../../../utils/time';
import { isStoreInBounds } from '../../../utils/coordinates';

let memoTimeValues = [];

// Slider (0-48) to minutes: 0 = 7h (420min), 48 = 7h next day (1860min)
function sliderToMinutes(value) {
  return 420 + value * 30;
}

function minutesToSlider(minutes) {
  return Math.round((minutes - 420) / 30);
}

function isStoreOpenAt(store, dayOfWeek, timeInMinutes) {
  if (!store.schedules || store.schedules.length === 0) {
    return false;
  }

  const normalizedTime =
    timeInMinutes >= 1440 ? timeInMinutes - 1440 : timeInMinutes;
  const isAfterMidnight = timeInMinutes >= 1440;

  const schedule = store.schedules.find(s => s.dayOfWeek === dayOfWeek);

  if (schedule && !schedule.closed) {
    if (schedule.opening && schedule.closing) {
      const { opening, closing } = schedule;
      if (opening <= closing) {
        if (
          !isAfterMidnight &&
          normalizedTime >= opening &&
          normalizedTime <= closing
        ) {
          return true;
        }
      } else {
        // Crosses midnight
        if (!isAfterMidnight && normalizedTime >= opening) {
          return true;
        }
        if (isAfterMidnight && normalizedTime <= closing) {
          return true;
        }
      }
    }

    // Happy hour
    if (schedule.openingSpecial && schedule.closingSpecial) {
      const { openingSpecial, closingSpecial } = schedule;
      if (openingSpecial <= closingSpecial) {
        if (
          !isAfterMidnight &&
          normalizedTime >= openingSpecial &&
          normalizedTime <= closingSpecial
        ) {
          return true;
        }
      } else {
        if (!isAfterMidnight && normalizedTime >= openingSpecial) {
          return true;
        }
        if (isAfterMidnight && normalizedTime <= closingSpecial) {
          return true;
        }
      }
    }
  }

  // Check previous day if looking after midnight
  if (isAfterMidnight) {
    const previousDay = dayOfWeek === 1 ? 7 : dayOfWeek - 1;
    const prevSchedule = store.schedules.find(s => s.dayOfWeek === previousDay);

    if (prevSchedule && !prevSchedule.closed) {
      if (
        prevSchedule.opening &&
        prevSchedule.closing &&
        prevSchedule.opening > prevSchedule.closing
      ) {
        if (normalizedTime <= prevSchedule.closing) {
          return true;
        }
      }

      if (
        prevSchedule.openingSpecial &&
        prevSchedule.closingSpecial &&
        prevSchedule.openingSpecial > prevSchedule.closingSpecial
      ) {
        if (normalizedTime <= prevSchedule.closingSpecial) {
          return true;
        }
      }
    }
  }

  return false;
}

function getPricesByTimeSlot(stores, selectedDays, bounds) {
  const priceData = new Array(49).fill(0);
  const countData = new Array(49).fill(0);

  for (let slotIndex = 0; slotIndex < 49; slotIndex++) {
    const timeInMinutes = sliderToMinutes(slotIndex);
    let totalPrice = 0;
    let storeCount = 0;

    for (const dayOfWeek of selectedDays) {
      for (const store of stores) {
        if (!isStoreInBounds(store, bounds)) {
          continue;
        }
        if (isStoreOpenAt(store, dayOfWeek, timeInMinutes) && store.price) {
          totalPrice += store.price;
          storeCount++;
        }
      }
    }

    if (storeCount > 0) {
      priceData[slotIndex] = totalPrice / storeCount;
      countData[slotIndex] = storeCount;
    }
  }

  return priceData;
}

function getFilterLabel(scheduleFilter) {
  if (!scheduleFilter) {
    return 'Horaires';
  }
  const { days, startTime, endTime } = scheduleFilter;
  if (days.length === 0) {
    return 'Horaires';
  }
  const normalizedStart = startTime % 1440;
  const normalizedEnd = endTime % 1440;

  if (days.length === 7) {
    return `${minutesToTime(normalizedStart, { short: true })}-${minutesToTime(normalizedEnd, { short: true })}`;
  }
  if (days.length === 1) {
    return `${daysFull[days[0] - 1].substring(0, 3)} ${minutesToTime(normalizedStart, { short: true })}-${minutesToTime(normalizedEnd, { short: true })}`;
  }
  return `${days.length}j ${minutesToTime(normalizedStart, { short: true })}-${minutesToTime(normalizedEnd, { short: true })}`;
}

function ScheduleFilter() {
  const { colors } = useTheme();
  const sheet = useRef();
  const setSheetStore = useSetAtom(sheetStoreState);
  const [scheduleFilter, setScheduleFilter] = useAtom(scheduleFilterState);
  const stores = useAtomValue(storesState);
  const mapBounds = useAtomValue(mapBoundsState);
  const { bottom } = useSafeAreaInsets();

  const [defaultValues] = useState(() => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay() || 7;
    const currentHour = currentDate.getHours();
    const currentMinutes = currentHour * 60 + currentDate.getMinutes();

    // Default: 19h-21h if < 19h, else current time + 1h/3h
    const defaultStartTime =
      currentHour < 19 ? 1140 : Math.min(currentMinutes + 60, 1740);
    const defaultEndTime =
      currentHour < 19 ? 1260 : Math.min(currentMinutes + 180, 1860);

    return {
      currentDay,
      defaultStartTime,
      defaultEndTime,
    };
  });

  const [selectedDays, setSelectedDays] = useState([defaultValues.currentDay]);
  const [timeValues, setTimeValues] = useState(() => {
    const initialValues = [
      minutesToSlider(defaultValues.defaultStartTime),
      minutesToSlider(defaultValues.defaultEndTime),
    ];
    memoTimeValues = initialValues;
    return initialValues;
  });

  useEffect(() => {
    if (!scheduleFilter) {
      const newValues = [
        minutesToSlider(defaultValues.defaultStartTime),
        minutesToSlider(defaultValues.defaultEndTime),
      ];
      memoTimeValues = newValues;
      setSelectedDays([defaultValues.currentDay]);
      setTimeValues(newValues);
    }
  }, [scheduleFilter, defaultValues]);

  const openModal = () => {
    setSheetStore();
    if (scheduleFilter) {
      const newValues = [
        minutesToSlider(scheduleFilter.startTime),
        minutesToSlider(scheduleFilter.endTime),
      ];
      memoTimeValues = newValues;
      setSelectedDays(scheduleFilter.days);
      setTimeValues(newValues);
    } else {
      const newValues = [
        minutesToSlider(defaultValues.defaultStartTime),
        minutesToSlider(defaultValues.defaultEndTime),
      ];
      memoTimeValues = newValues;
      setSelectedDays([defaultValues.currentDay]);
      setTimeValues(newValues);
    }
    sheet.current?.snapToIndex?.(0);
  };

  const closeModal = () => {
    sheet.current?.close();
  };

  const reset = () => {
    setScheduleFilter(null);
    closeModal();
  };

  const submit = useCallback(() => {
    if (selectedDays.length === 0) {
      setScheduleFilter(null);
    } else {
      setScheduleFilter({
        days: selectedDays,
        startTime: sliderToMinutes(timeValues[0]),
        endTime: sliderToMinutes(timeValues[1]),
      });
    }
    closeModal();
  }, [selectedDays, timeValues]);

  const toggleDay = day => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const startTime = sliderToMinutes(timeValues[0]);
  const endTime = sliderToMinutes(timeValues[1]);

  const priceData = useMemo(() => {
    if (selectedDays.length === 0 || stores.length === 0) {
      return new Array(49).fill(0);
    }
    return getPricesByTimeSlot(stores, selectedDays, mapBounds);
  }, [stores, selectedDays, mapBounds]);

  const footer = props => (
    <BottomSheetFooter {...props} bottomInset={bottom}>
      <View style={styles.footerSheet}>
        <ActionButtons
          onCancel={reset}
          onSubmit={submit}
          submitLabel="OK"
          cancelLabel="Réinitialiser"
        />
      </View>
    </BottomSheetFooter>
  );

  return (
    <>
      <Filter
        icon="clock-outline"
        onPress={openModal}
        onRemove={scheduleFilter && reset}>
        {getFilterLabel(scheduleFilter)}
      </Filter>
      <ActionSheet ref={sheet} onDismiss={closeModal} backdrop footer={footer}>
        <View style={styles.sheet}>
          <Text variant="titleMedium">Jours</Text>
          <View style={styles.daysContainer}>
            {daysFull.map((day, index) => {
              const dayOfWeek = index + 1;
              const isSelected = selectedDays.includes(dayOfWeek);
              return (
                <Chip
                  key={dayOfWeek}
                  mode={isSelected ? 'flat' : 'outlined'}
                  selected={isSelected}
                  onPress={() => toggleDay(dayOfWeek)}
                  style={styles.dayChip}
                  textStyle={styles.dayChipText}>
                  {day.substring(0, 3)}
                </Chip>
              );
            })}
          </View>

          <Text variant="titleMedium" style={styles.timeTitle}>
            Horaires
          </Text>
          <Text style={styles.timeText}>
            {minutesToTime(startTime % 1440)} - {minutesToTime(endTime % 1440)}
            {(startTime >= 1440 || endTime >= 1440) && ' (lendemain)'}
          </Text>

          <View style={styles.rheostatContainer}>
            <BarRheostat
              theme={{ rheostat: { themeColor: colors.primary } }}
              values={timeValues}
              min={0}
              max={48}
              snapPoints={new Array(49).fill().map((_, i) => i)}
              snap={true}
              svgData={priceData}
              onValuesUpdated={({ values }) => {
                if (
                  memoTimeValues[0] !== values[0] ||
                  memoTimeValues[1] !== values[1]
                ) {
                  memoTimeValues = values;
                  setTimeValues(values);
                }
              }}
            />
            <View style={styles.timeLabelsContainer}>
              <Text style={styles.timeLabel}>7h</Text>
              <Text style={styles.timeLabel}>12h</Text>
              <Text style={styles.timeLabel}>17h</Text>
              <Text style={styles.timeLabel}>22h</Text>
              <Text style={styles.timeLabel}>3h</Text>
              <Text style={styles.timeLabel}>7h</Text>
            </View>
          </View>
        </View>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },
  dayChip: {
    marginRight: 5,
    marginBottom: 5,
  },
  dayChipText: {
    fontSize: 12,
  },
  timeTitle: {
    marginTop: 10,
  },
  timeText: {
    fontSize: 17,
    marginTop: 10,
  },
  rheostatContainer: {
    height: 300,
    marginTop: 20,
  },
  timeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  timeLabel: {
    fontSize: 12,
    color: 'grey',
  },
  footerSheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
});

export default ScheduleFilter;
