import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { daysFull } from '../../constants';
import { minutesToTime } from '../../utils/time';

function Time({ schedule }) {
  const [open, close] = schedule;
  return !open ? '-' : `${minutesToTime(open)}-${minutesToTime(close)}`;
}

function DaySchedule({ day, hasSpecial }) {
  const { closed, opening, closing, openingSpecial, closingSpecial } = day;

  const style = [styles.hoursCell];
  const today = new Date().getDay() ? new Date().getDay() : 7;
  if (today === day.dayOfWeek) {
    style.push(styles.boldText);
  }

  if (closed) {
    if (hasSpecial) {
      style.push(styles.twoCol);
    }
    return (
      <>
        <Text style={style}>Fermé</Text>
        {hasSpecial && <View style={style} />}
      </>
    );
  }
  return (
    <>
      <Text style={style}>
        <Time schedule={[opening, closing]} />
      </Text>
      {hasSpecial && (
        <Text style={style}>
          <Time schedule={[openingSpecial, closingSpecial]} />
        </Text>
      )}
    </>
  );
}

function Schedules({ schedules }) {
  const days = schedules.reduce(
    (days, schedule) => ((days[schedule.dayOfWeek - 1] = schedule), days),
    Array(7)
      .fill(0)
      .map((_, i) => ({ dayOfWeek: i + 1, closed: false })),
  );
  const hasSchedule = days.some(day => day.opening || day.openingSpecial);
  const hasSpecial = hasSchedule && days.some(day => day.openingSpecial);
  const today = new Date().getDay() ? new Date().getDay() : 7;

  return (
    <View style={styles.table}>
      {hasSpecial && (
        <View style={styles.headTable}>
          <View style={styles.dayCell} />
          <Text style={styles.hoursCell}>Ouverture</Text>
          <Text style={styles.hoursCell}>Happy Hour</Text>
        </View>
      )}
      {days.map(day => (
        <View key={day.dayOfWeek} style={styles.scheduleDayRow}>
          <Text
            style={[
              styles.dayCell,
              today === day.dayOfWeek && styles.boldText,
            ]}>
            {daysFull[day.dayOfWeek - 1]}
          </Text>
          <DaySchedule day={day} hasSpecial={hasSpecial} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    display: 'flex',
    flex: 1,
  },
  headTable: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scheduleDayRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayCell: {
    width: 90,
  },
  hoursCell: {
    width: 90,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default Schedules;
