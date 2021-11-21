import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { daysFull } from '../../constants';
import { secondToTime } from '../../utils/time';

function Time({ schedule }) {
  const [open, close] = schedule;
  return !open ? '-' : `${secondToTime(open)}-${secondToTime(close)}`;
}

function DaySchedule({ day }) {
  const { closed, opening, closing, openingSpecial, closingSpecial } = day;

  const style = [styles.scheduleHourCell];
  const today = new Date().getDay() ? new Date().getDay() : 7;
  if (today === day.dayOfWeek) {
    style.push(styles.boldText);
  }

  if (closed) {
    return <Text style={style}>Fermé</Text>;
  }
  if (opening || openingSpecial) {
    return (
      <>
        <Text style={style}>
          <Time schedule={[opening, closing]} />
        </Text>
        <Text style={style}>
          <Time schedule={[openingSpecial, closingSpecial]} />
        </Text>
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
  const head = days.some(day => day.opening || day.openingSpecial);
  const today = new Date().getDay() ? new Date().getDay() : 7;

  return (
    <View style={{ display: 'flex', flex: 1 }}>
      {head && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 20,
          }}>
          <View style={{ width: '40%' }} />
          <Text style={styles.scheduleHourCell}>Ouverture</Text>
          <Text style={styles.scheduleHourCell}>Happy Hour</Text>
        </View>
      )}
      <View style={styles.infoText}>
        {days.map(day => (
          <View key={day.dayOfWeek} style={styles.scheduleDayRow}>
            <Text
              style={[
                styles.scheduleDayCell,
                today === day.dayOfWeek && styles.boldText,
              ]}>
              {daysFull[day.dayOfWeek - 1]}
            </Text>
            <View style={styles.scheduleHoursCell}>
              <DaySchedule day={day} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoText: {
    marginVertical: 20,
  },
  scheduleDayRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  scheduleDayCell: {
    width: '40%',
  },
  scheduleHoursCell: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  scheduleHourCell: {
    width: 90,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default Schedules;
