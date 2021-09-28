import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Linking,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Caption,
  Divider,
  Title,
  TouchableRipple,
} from 'react-native-paper';
import { daysFull } from './constants';

import { useStore } from './store/context';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

function Schedules({ schedules }) {
  const days = schedules.reduce(
    (days, schedule) => ((days[schedule.dayOfWeek] = schedule), days),
    {},
  );
  console.log(days);
  return (
    <View style={styles.infoText}>
      {daysFull.map((day, i) => (
        <View key={day} style={styles.scheduleRow}>
          <Text style={styles.scheduleRowDay}>{day}</Text>
          <Text style={styles.scheduleRowDay}>
            {days[i + 1].alwaysOpen ? 'Ouvert' : 'Fermé'}
          </Text>
        </View>
      ))}
    </View>
  );
}

const StoreDetails = ({ navigation, route }) => {
  const { params } = route;
  const [state] = useStore();
  const store = state.storesDetails[params.store.id];

  console.log(store);

  const [expandSchedules, setExpandSchedules] = React.useState(false);

  const openAddress = () => {
    const { name, latitude, longitude } = store;
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${name}@${latLng}`,
      android: `${scheme}${latLng}(${name.replace(/ /g, '+')})`,
    });

    Linking.openURL(url);
  };

  return (
    <ScrollView>
      <Appbar.Header style={styles.header}>
        <Appbar.Action icon="close" onPress={() => navigation.goBack()} />
        <Appbar.Content />
        <Appbar.Action icon={MORE_ICON} onPress={() => {}} />
      </Appbar.Header>
      <Title style={styles.title}>{store.name}</Title>
      <Divider />
      <View style={styles.actionsBar}>
        <TouchableRipple
          borderless
          centered
          onPress={() => openAddress()}
          rippleColor="rgba(0, 0, 0, .25)">
          <View>
            <Avatar.Icon style={styles.action} size={45} icon="google-maps" />
            <Caption>Itinéraire</Caption>
          </View>
        </TouchableRipple>
        <View>
          <Avatar.Icon style={styles.action} size={45} icon="share-variant" />
          <Caption>Partager</Caption>
        </View>
        {/* <View>
          <Avatar.Icon style={styles.action} size={45} icon="phone" />
          <Caption>Appeler</Caption>
        </View> */}
        <View>
          <Avatar.Icon style={styles.action} size={45} icon="check-all" />
          <Caption>Confirmer</Caption>
        </View>
      </View>
      <Divider />
      <TouchableRipple
        onPress={() => openAddress()}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="map-marker"
            color="green"
          />
          <Text style={styles.infoText}>{store.address}</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <TouchableRipple
        onPress={() => setExpandSchedules(!expandSchedules)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="clock"
            color="green"
          />
          {!expandSchedules ? (
            <Text style={styles.infoText}>Ouvert </Text>
          ) : (
            <Schedules schedules={store.schedules} />
          )}
        </View>
      </TouchableRipple>
      {expandSchedules && (
        <Button mode="text" uppercase={false}>
          Ajouter ou modifier ces horaires
        </Button>
      )}
      <Divider />
      <TouchableRipple
        onPress={() => openAddress()}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="earth"
            color="green"
          />
          <Text style={styles.infoText}>https://google.com/</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <TouchableRipple
        onPress={() => openAddress()}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="pencil"
            color="green"
          />
          <Text style={styles.infoText}>Suggérer une modification</Text>
        </View>
      </TouchableRipple>
      <Divider />
      {/* <Subheading>Résumé des avis</Subheading>
      <Divider />
      <Subheading>Donner une note et un avis</Subheading>
      <Text>
        Partagez votre expérience pour aider les autres utilisateurs dans leurs
        recherches
      </Text>
      <View style={styles.infoRow}>
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: 'transparent', elevation: 0 },
  title: {
    fontWeight: 'bold',
    margin: 15,
    marginBottom: 10,
  },
  actionsBar: {
    marginHorizontal: 30,
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  infoIcon: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    marginVertical: 20,
  },
  scheduleRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  scheduleRowDay: {
    width: '50%',
  },
});

export default StoreDetails;
