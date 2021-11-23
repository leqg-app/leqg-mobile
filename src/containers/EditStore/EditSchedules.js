import React, { useLayoutEffect, useState } from 'react';
import { Text, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Portal,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { useStore } from '../../store/context';
import {
  secondToHour,
  secondToTime,
  toHours,
  toMinutes,
} from '../../utils/time';
import { daysFull, daysShort, theme } from '../../constants';

const newSchedule = () => ({
  closed: true,
  opening: 17 * 3600,
  closing: 23 * 3600,
  openingSpecial: null,
  closingSpecial: null,
});

function Time({ schedule }) {
  const [open, close] = schedule;
  return !open ? '-' : `${secondToTime(open)}-${secondToTime(close)}`;
}

const DaySchedule = ({ schedule }) => {
  if (!schedule || schedule.closed) {
    return <Text style={styles.hourCell}>Fermé</Text>;
  }
  const { opening, closing, openingSpecial, closingSpecial } = schedule;
  return (
    <>
      <Text style={styles.hourCell}>
        <Time schedule={[opening, closing]} />
      </Text>
      <Text style={styles.hourCell}>
        <Time schedule={[openingSpecial, closingSpecial]} />
      </Text>
    </>
  );
};

const EditSchedulesModal = props => {
  const { colors } = useTheme();
  const { editingDays, onEdited, onDismiss } = props;

  const [daysSelected, selectDays] = useState(editingDays);
  const [timePicker, setTimePicker] = useState(false);
  const [schedule, setSchedule] = useState(props.schedule || newSchedule());

  const onPressDay = day => {
    if (daysSelected.includes(day)) {
      selectDays(daysSelected.filter(selected => selected !== day));
    } else {
      selectDays([...daysSelected, day]);
    }
  };

  const { closed, opening, closing, openingSpecial, closingSpecial } = schedule;

  return (
    <Dialog visible={true} onDismiss={onDismiss}>
      <Dialog.Title>Sélectionner des jours et des horaires</Dialog.Title>
      <Dialog.Content>
        <ScrollView style={styles.modalScroll}>
          <View style={styles.dayButtons}>
            {daysShort.map((day, i) => (
              <Badge
                key={i}
                onPress={() => onPressDay(i)}
                size={35}
                style={
                  daysSelected.includes(i)
                    ? styles.dayButtonFilled
                    : styles.dayButtonEmpty
                }>
                {day}
              </Badge>
            ))}
          </View>
          <View style={styles.flex}>
            <View style={styles.flexCell}>
              <Checkbox
                status={closed ? 'checked' : 'unchecked'}
                color={colors.primary}
                onPress={() => setSchedule({ ...schedule, closed: !closed })}
              />
              <Text>Fermé</Text>
            </View>
          </View>
          {!closed && (
            <View>
              <View style={styles.flex}>
                <TextInput
                  mode="outlined"
                  label="Ouverture"
                  value={secondToHour(opening)}
                  onTouchStart={() => setTimePicker('opening')}
                  showSoftInputOnFocus={false}
                  style={styles.scheduleHourLeft}
                />
                <TextInput
                  mode="outlined"
                  label="Fermeture"
                  value={secondToHour(closing)}
                  onTouchStart={() => setTimePicker('closing')}
                  showSoftInputOnFocus={false}
                  style={styles.scheduleHourRight}
                />
              </View>
              <View style={styles.flex}>
                <TextInput
                  mode="outlined"
                  label="Début happy h"
                  value={secondToHour(openingSpecial)}
                  onTouchStart={() => setTimePicker('openingSpecial')}
                  showSoftInputOnFocus={false}
                  style={styles.scheduleHourLeft}
                />
                <TextInput
                  mode="outlined"
                  label="Fin happy hour"
                  value={secondToHour(closingSpecial)}
                  onTouchStart={() => setTimePicker('closingSpecial')}
                  showSoftInputOnFocus={false}
                  style={styles.scheduleHourRight}
                />
              </View>
              {timePicker && (
                <TimePickerModal
                  visible={!!timePicker}
                  onDismiss={() => setTimePicker(false)}
                  onConfirm={time => {
                    const seconds = time.hours * 3600 + time.minutes * 60;
                    setSchedule({
                      ...schedule,
                      [timePicker]: seconds,
                    });
                    setTimePicker(false);
                  }}
                  hours={toHours(schedule[timePicker])}
                  minutes={toMinutes(schedule[timePicker])}
                  locale="fr"
                  label=""
                  cancelLabel="Annuler"
                  confirmLabel="OK"
                  animationType="fade"
                />
              )}
            </View>
          )}
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Annuler</Button>
        <Button onPress={() => onEdited(daysSelected, schedule)}>OK</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const EditSchedules = ({ navigation }) => {
  const [state, actions] = useStore();
  const [schedules, setSchedules] = React.useState(
    state.storeEdition.schedules ||
      new Array(7).fill().map(() => newSchedule()),
  );
  const [editingDays, setEditingDay] = React.useState(false);

  const save = () => {
    actions.setStoreEdition({ schedules });
    navigation.goBack();
  };
  const goBack = () => {
    // TODO: ask to save or cancel
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction color="white" onPress={goBack} />,
      headerRight: () => (
        <IconButton color="white" icon="check" onPress={save} />
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {daysFull.map((day, i) => {
        return (
          <TouchableRipple
            key={day}
            onPress={() => setEditingDay([i])}
            rippleColor="#000">
            <View style={styles.dayRow}>
              <Text style={{ flex: 1 }}>{day}</Text>
              <DaySchedule schedule={schedules[i]} />
              <Avatar.Icon
                icon="pencil"
                size={20}
                color="#000"
                style={styles.editIcon}
              />
            </View>
          </TouchableRipple>
        );
      })}
      <Button
        mode="contained"
        compact={true}
        icon="pencil"
        uppercase={false}
        style={styles.buttonEditAll}
        onPress={() => setEditingDay(new Array(7).fill().map((_, i) => i))}>
        Tout modifier
      </Button>
      {editingDays !== false && (
        <Portal>
          <EditSchedulesModal
            schedule={schedules[editingDays[0]]}
            editingDays={editingDays}
            onEdited={(editedDays, schedule) => {
              const {
                closed,
                opening,
                closing,
                openingSpecial,
                closingSpecial,
              } = schedule;
              for (const editedDay of editedDays) {
                Object.assign(schedules[editedDay], {
                  closed,
                  opening,
                  closing,
                  openingSpecial,
                  closingSpecial,
                });
              }
              setEditingDay(false);
              setSchedules([...schedules]);
            }}
            onDismiss={() => setEditingDay(false)}
          />
        </Portal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    padding: 20,
  },
  dayRow: {
    height: 55,
    paddingHorizontal: 25,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editIcon: { backgroundColor: 'transparent' },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  hourCell: {
    width: 90,
    textAlign: 'center',
  },
  dayButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayButtonEmpty: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    color: theme.colors.primary,
  },
  dayButtonFilled: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    color: 'white',
  },
  scheduleHourLeft: {
    flex: 1,
    marginRight: 5,
    backgroundColor: 'white',
  },
  scheduleHourRight: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: 'white',
  },
  buttonEditAll: {
    margin: 30,
  },
  modalScroll: {
    maxHeight: 300,
  },
});

export default EditSchedules;
