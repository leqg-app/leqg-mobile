import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inHours, secondToTime } from '../../utils/time';

function Open({ day }) {
  const { closing, openingSpecial, closingSpecial } = day;
  return (
    <View style={styles.infoScheduleState}>
      <Text>
        <Text style={styles.scheduleOpen}>Ouvert</Text>
        {closing && <Text> jusqu'à {secondToTime(closing)}</Text>}
        {openingSpecial && (
          <Text>
            {' '}
            - Happy hour de{' '}
            <Text
              style={
                inHours(openingSpecial, closingSpecial) && styles.boldText
              }>
              {secondToTime(openingSpecial)} à {secondToTime(closingSpecial)}
            </Text>
          </Text>
        )}
      </Text>
    </View>
  );
}

function Closed({ day }) {
  const { opening, closing } = day;
  return (
    <View style={styles.infoScheduleState}>
      <Text style={styles.scheduleClosed}>Fermé</Text>
      {opening && opening < closing && (
        <Text> - Ouvre à {secondToTime(opening)}</Text>
      )}
    </View>
  );
}

function SchedulesPreview({ schedules }) {
  const date = new Date();
  const today = date.getDay() || 7;
  const now = date.getHours() * 3600 + date.getMinutes() * 60;
  const day = schedules.find(schedule => schedule.dayOfWeek === today);
  const { closed, opening, closing } = day;

  if (closed) {
    return <Closed day={day} />;
  }
  if (opening) {
    if (inHours(opening, closing)) {
      return <Open day={day} />;
    }
    if (now < opening) {
      return <Closed day={day} />;
    }
    // TODO: find next day
    return <Closed day={day} />;
  }
  return <Open day={day} />;
}

const styles = StyleSheet.create({
  infoScheduleState: {
    display: 'flex',
    flexDirection: 'row',
  },
  scheduleOpen: {
    color: 'green',
  },
  scheduleClosed: {
    color: '#ff586b',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default SchedulesPreview;
