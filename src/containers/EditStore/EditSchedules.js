import React, { useLayoutEffect } from 'react';
import {
  Pressable,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Portal,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { useStore } from '../../store/context';
import formatHour from '../../utils/formatHour';
import { daysFull, daysShort, theme } from '../../constants';

const newTime = () => ({
  start: { hours: 17, minutes: 0 },
  end: { hours: 2, minutes: 0 },
});
const newSchedule = () => ({
  closed: true,
  alwaysOpen: false,
  schedules: [newTime()],
});

const DaySchedule = ({ schedule }) => {
  if (!schedule || schedule.closed) {
    return <Text>Fermé</Text>;
  }
  if (schedule.alwaysOpen) {
    return <Text>24h/24</Text>;
  }
  return schedule.schedules.map((s, i) => (
    <Text key={i}>
      {formatHour(s.start)} - {formatHour(s.end)}
    </Text>
  ));
};

const EditSchedulesModal = props => {
  const { colors } = useTheme();
  const { schedule, editingDay, onEdited, onDismiss } = props;
  const current = schedule || newSchedule();

  const [daysSelected, selectDays] = React.useState([editingDay]);
  const [timePicker, setTimePicker] = React.useState(false);

  const [closed, setClosed] = React.useState(current.closed);
  const [alwaysOpen, setAlwaysOpen] = React.useState(current.alwaysOpen);
  const [schedules, setSchedules] = React.useState(current.schedules);

  const onPressDay = day => {
    if (daysSelected.includes(day)) {
      selectDays(daysSelected.filter(selected => selected !== day));
    } else {
      selectDays([...daysSelected, day]);
    }
  };

  return (
    <Dialog visible={true} onDismiss={onDismiss}>
      <Dialog.Title>Sélectionner des jours et des horaires</Dialog.Title>
      <Dialog.Content>
        <ScrollView style={styles.modalScroll}>
          <View style={styles.flex}>
            {daysShort.map((day, i) => (
              <Pressable key={i} onPress={() => onPressDay(i)}>
                <Badge
                  size={35}
                  style={
                    daysSelected.includes(i)
                      ? styles.dayButtonFilled
                      : styles.dayButtonEmpty
                  }>
                  {day}
                </Badge>
              </Pressable>
            ))}
          </View>
          <View style={styles.flex}>
            <View style={styles.flexCell}>
              <Checkbox
                status={closed ? 'checked' : 'unchecked'}
                color={colors.primary}
                onPress={() => setClosed(!closed)}
              />
              <Text>Fermé</Text>
            </View>
            {!closed && (
              <View style={styles.flexCell}>
                <Checkbox
                  status={alwaysOpen ? 'checked' : 'unchecked'}
                  color={colors.primary}
                  onPress={() => setAlwaysOpen(!alwaysOpen)}
                />
                <Text>Ouvert 24h/24</Text>
              </View>
            )}
          </View>
          {!closed && !alwaysOpen && (
            <View>
              {schedules.map((schedule, i) => (
                <View key={i} style={styles.flex}>
                  <TextInput
                    mode="outlined"
                    label="Ouverture"
                    value={formatHour(schedule.start)}
                    onTouchStart={() => setTimePicker({ type: 'start', i })}
                    showSoftInputOnFocus={false}
                    style={{
                      flex: 1,
                      marginRight: 5,
                      backgroundColor: 'white',
                    }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Fermeture"
                    value={formatHour(schedule.end)}
                    onTouchStart={() => setTimePicker({ type: 'end', i })}
                    showSoftInputOnFocus={false}
                    style={{
                      flex: 1,
                      marginLeft: 5,
                      backgroundColor: 'white',
                    }}
                  />
                  <Pressable
                    onPress={() =>
                      setSchedules([
                        ...schedules.slice(0, i),
                        ...schedules.slice(i + 1),
                      ])
                    }>
                    <Text style={styles.removeSchedule}>x</Text>
                  </Pressable>
                </View>
              ))}
              {timePicker && (
                <TimePickerModal
                  visible={!!timePicker}
                  onDismiss={() => setTimePicker(false)}
                  onConfirm={time => {
                    const { i, type } = timePicker;
                    schedules[i] = { ...schedules[i], [type]: time };
                    setSchedules([...schedules]);
                    setTimePicker(false);
                  }}
                  hours={schedules[timePicker.i][timePicker.type].hours}
                  minutes={schedules[timePicker.i][timePicker.type].minutes}
                  locale="fr"
                  label=""
                  cancelLabel="Annuler"
                  confirmLabel="OK"
                  animationType="fade"
                />
              )}
              <Button onPress={() => setSchedules([...schedules, newTime()])}>
                Ajouter un horaire
              </Button>
            </View>
          )}
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Annuler</Button>
        <Button
          onPress={() =>
            onEdited(daysSelected, {
              closed,
              alwaysOpen,
              schedules,
            })
          }>
          OK
        </Button>
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
  const [editingDay, setEditingDay] = React.useState(false);

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
      headerRight: () => (
        <IconButton color="white" icon="check" onPress={save} />
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView>
      <View style={styles.box}>
        {daysFull.map((day, i) => {
          return (
            <View key={day} style={styles.dayRow}>
              <Text style={{ flex: 1 }}>{day}</Text>
              <View style={{ flex: 1 }}>
                <DaySchedule schedule={schedules[i]} />
              </View>
              <Pressable onPress={() => setEditingDay(i)}>
                <Avatar.Icon
                  icon="pencil"
                  size={20}
                  color="#000"
                  style={styles.editIcon}
                />
              </Pressable>
            </View>
          );
        })}
        <Button
          mode="contained"
          compact={true}
          icon="pencil"
          uppercase={false}
          style={styles.buttonEditAll}
          onPress={() => setEditingDay(0)}>
          Tout modifier
        </Button>
      </View>
      {editingDay !== false && (
        <Portal>
          <EditSchedulesModal
            schedule={schedules[editingDay]}
            editingDay={editingDay}
            onEdited={(editedDays, schedule) => {
              for (const editedDay of editedDays) {
                schedules[editedDay] = schedule;
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
  box: {
    padding: 20,
  },
  dayRow: {
    flexDirection: 'row',
    padding: 14,
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
  dayButtonEmpty: {
    marginRight: 7,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    color: theme.colors.primary,
  },
  dayButtonFilled: {
    marginRight: 7,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    color: 'white',
  },
  buttonEditAll: {
    marginTop: 30,
  },
  modalScroll: {
    maxHeight: 300,
  },
});

export default EditSchedules;
