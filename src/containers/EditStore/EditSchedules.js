import React, { useLayoutEffect, useState } from 'react';
import { Text, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Dialog,
  IconButton,
  Portal,
  Switch,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRecoilState } from 'recoil';

import { minutesToTime } from '../../utils/time';
import { daysFull, daysShort, theme } from '../../constants';
import { storeEditionState } from '../../store/atoms';

const newSchedule = (_, i) => ({
  ...(i !== undefined && { dayOfWeek: i + 1 }),
  closed: false,
  opening: null,
  closing: null,
  openingSpecial: null,
  closingSpecial: null,
});

const defaultsHour = {
  opening: 17,
  closing: 2,
  openingSpecial: 18,
  closingSpecial: 20,
};

const scheduleTypes = [
  { name: 'Ouverture', type: 'opening' },
  { name: 'Fermeture', type: 'closing' },
  { name: 'Début Happy hour', type: 'openingSpecial' },
  { name: 'Fin Happy hour', type: 'closingSpecial' },
];

function Time({ schedule }) {
  const [open, close] = schedule;
  return !open ? '-' : `${minutesToTime(open)}-${minutesToTime(close)}`;
}

const DaySchedule = ({ schedule }) => {
  if (!schedule || schedule.closed) {
    return (
      <>
        <Text style={styles.hourCell}>Fermé</Text>
        <View style={styles.hourCell} />
      </>
    );
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

function getPickerValue(schedule, timePicker) {
  const date = new Date();
  if (schedule[timePicker] === null) {
    date.setHours(defaultsHour[timePicker], 0);
    return date;
  }
  date.setHours(schedule[timePicker] / 60, schedule[timePicker] % 60);
  return date;
}

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

  const { closed } = schedule;

  return (
    <Dialog visible={true} onDismiss={onDismiss}>
      <Dialog.Title>Sélectionner des jours et des horaires</Dialog.Title>
      <Dialog.Content>
        <ScrollView style={styles.modalScroll}>
          <View style={styles.dayButtons}>
            {daysShort.map((day, i) => {
              const selected = daysSelected.includes(i);
              return (
                <View
                  style={[
                    styles.dayButton,
                    selected && styles.dayButtonSelected,
                  ]}
                  key={i}>
                  <TouchableRipple
                    borderless
                    onPress={() => onPressDay(i)}
                    style={styles.dayButtonTouchable}>
                    <Text
                      style={[
                        styles.dayButtonText,
                        selected && styles.dayButtonTextSelected,
                      ]}>
                      {day}
                    </Text>
                  </TouchableRipple>
                </View>
              );
            })}
          </View>
          <View style={styles.flex}>
            <View style={styles.closedWrapper}>
              <Text
                onPress={() => setSchedule({ ...schedule, closed: !closed })}>
                Fermé
              </Text>
              <Switch
                style={styles.closedSwitch}
                value={closed}
                color={colors.primary}
                onValueChange={() =>
                  setSchedule({ ...schedule, closed: !closed })
                }
              />
            </View>
          </View>
          {!closed && (
            <View>
              {scheduleTypes.map(({ name, type }) => (
                <TouchableRipple key={name} onPress={() => setTimePicker(type)}>
                  <View style={styles.scheduleRow}>
                    <Text>{name}</Text>
                    <Text>
                      {schedule[type] !== null
                        ? minutesToTime(schedule[type])
                        : '-'}
                    </Text>
                  </View>
                </TouchableRipple>
              ))}
              {(schedule.openingSpecial || schedule.closingSpecial) && (
                <Button
                  onPress={() => {
                    setSchedule({
                      ...schedule,
                      openingSpecial: null,
                      closingSpecial: null,
                    });
                  }}
                  uppercase={false}>
                  Effacer l&apos;happy hour
                </Button>
              )}
              <DateTimePickerModal
                date={getPickerValue(schedule, timePicker)}
                mode="time"
                confirmTextIOS="Valider"
                cancelTextIOS="Annuler"
                isVisible={!!timePicker}
                is24Hour={true}
                onConfirm={time => {
                  setTimePicker(false);
                  const seconds = time.getHours() * 60 + time.getMinutes();
                  setSchedule({
                    ...schedule,
                    [timePicker]: seconds,
                  });
                }}
                onCancel={() => setTimePicker(false)}
              />
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

function getInitialSchedules({ schedules }) {
  if (!schedules) {
    return new Array(7).fill(0).map(newSchedule);
  }
  return Array.from(schedules).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

function EditSchedules({ navigation }) {
  const [storeEdition, setStoreEdition] = useRecoilState(storeEditionState);
  const [schedules, setSchedules] = useState(getInitialSchedules(storeEdition));
  const [editingDays, setEditingDay] = useState(false);

  const save = () => {
    setStoreEdition({ ...storeEdition, schedules });
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Appbar.BackAction color="white" onPress={navigation.goBack} />
      ),
      headerRight: () => (
        <IconButton color="white" icon="check" onPress={save} />
      ),
    });
  }, [navigation]);

  return (
    <ScrollView>
      {daysFull.map((day, i) => {
        return (
          <TouchableRipple
            key={day}
            onPress={() => setEditingDay([i])}
            rippleColor="#000">
            <View style={styles.dayRow}>
              <Text style={styles.container}>{day}</Text>
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
                  ...(closed
                    ? {
                        opening: null,
                        closing: null,
                        openingSpecial: null,
                        closingSpecial: null,
                      }
                    : {
                        opening,
                        closing,
                        openingSpecial,
                        closingSpecial,
                      }),
                });
              }
              setEditingDay(false);
              setSchedules([...schedules]);
            }}
            onDismiss={() => setEditingDay(false)}
          />
        </Portal>
      )}
    </ScrollView>
  );
}

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
  closedWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  closedSwitch: {
    marginLeft: 15,
  },
  hourCell: {
    width: 90,
    textAlign: 'center',
  },
  scheduleRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  dayButtonTouchable: {
    width: 30,
    height: 30,
    borderRadius: 20,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  buttonEditAll: {
    margin: 30,
  },
  modalScroll: {
    maxHeight: 350,
  },
});

export default EditSchedules;
