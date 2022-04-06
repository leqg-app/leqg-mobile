import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { daysFull } from '../../constants';
import { secondToTime } from '../../utils/time';

function Time({ schedule }) {
  const [open, close] = schedule;
  return !open ? '-' : `${secondToTime(open)}-${secondToTime(close)}`;
}

function DaySchedule({ day, hasSpecial }) {
  const { closed, opening, closing, openingSpecial, closingSpecial } = day;

  const style = [styles.hoursCell];
  const today = new Date().getDay() ? new Date().getDay() : 7;
  if (today === day.dayOfWeek) {
    style.push(styles.boldText);
  }

  if (closed) {
    style.push(styles.twoCol);
    return <Text style={style}>Fermé</Text>;
  }
  if (opening || openingSpecial) {
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
  return <Text style={style}>Ouvert</Text>;
}

function Schedules({ schedules }) {
  const days = schedules.reduce(
    (days, schedule) => ((days[schedule.dayOfWeek - 1] = schedule), days),
    [],
  );
  const hasSchedule = days.some(day => day.opening || day.openingSpecial);
  const hasSpecial = hasSchedule && days.some(day => day.openingSpecial);
  const today = new Date().getDay() ? new Date().getDay() : 7;

  return (
    <View style={styles.table}>
      {hasSpecial && (
        <View style={styles.flexRow}>
          <View style={styles.dayCell} />
          <Text style={styles.hoursCell}>Ouverture</Text>
          <Text style={styles.hoursCell}>Happy Hour</Text>
        </View>
      )}
      <View style={styles.infoText}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  table: { display: 'flex', flex: 1 },
  infoText: {
    marginVertical: 20,
  },
  scheduleDayRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  dayCell: {
    width: 70,
    flexGrow: 1,
  },
  hoursCell: {
    width: 90,
    textAlign: 'center',
    flexGrow: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  twoCol: {
    flexGrow: 6,
  },
});

export default Schedules;
