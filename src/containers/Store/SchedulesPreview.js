import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { daysFull } from '../../constants';

import { inHours, secondToTime } from '../../utils/time';

function findNextOpenDay(schedules, currentDay) {
  const days = Array.from(schedules).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const nextDays = days.slice(currentDay).concat(days.slice(0, currentDay));
  return nextDays.find(schedule => !schedule.closed);
}

function Open({ today }) {
  const { closing = null, openingSpecial, closingSpecial } = today;
  return (
    <View>
      <Text>
        <Text style={styles.scheduleOpen}>Ouvert</Text>
        {closing !== null && (
          <Text> jusqu'à {secondToTime(closing, { short: true })}</Text>
        )}
      </Text>
      {openingSpecial && (
        <Text style={styles.schedules}>
          Happy hour de{' '}
          <Text
            style={inHours(openingSpecial, closingSpecial) && styles.boldText}>
            {secondToTime(openingSpecial)} à {secondToTime(closingSpecial)}
          </Text>
        </Text>
      )}
    </View>
  );
}

function Closed({ today, nextOpenDay }) {
  const { opening } = today;

  const date = new Date();
  const now = date.getHours() * 3600 + date.getMinutes() * 60;

  return (
    <View style={styles.flex}>
      <Text style={styles.scheduleClosed}>Fermé</Text>
      {opening && now < opening ? (
        <Text> – Ouvre à {secondToTime(opening, { short: true })}</Text>
      ) : (
        nextOpenDay && (
          <>
            <Text> – Ouvre {daysFull[nextOpenDay.dayOfWeek - 1]} prochain</Text>
            {nextOpenDay.opening && (
              <Text>
                {' '}
                à {secondToTime(nextOpenDay.opening, { short: true })}
              </Text>
            )}
          </>
        )
      )}
    </View>
  );
}

function SchedulesPreview({ schedules = [] }) {
  const date = new Date();

  const currentDay = date.getDay() || 7; // 0 is sunday

  const today = schedules.find(schedule => schedule.dayOfWeek === currentDay);
  const nextOpenDay = findNextOpenDay(schedules, currentDay);

  if (!today) {
    return <Open today={{}} />;
  }

  const { closed, opening, closing } = today;

  if (closed) {
    return <Closed today={today} nextOpenDay={nextOpenDay} />;
  }
  if (opening) {
    if (inHours(opening, closing)) {
      return <Open today={today} />;
    }
    return <Closed today={today} nextOpenDay={nextOpenDay} />;
  }
  return <Open today={today} />;
}

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  schedules: {
    marginTop: 4,
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
