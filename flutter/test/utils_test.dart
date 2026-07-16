import 'package:flutter_test/flutter_test.dart';
import 'package:leqg/models/models.dart';
import 'package:leqg/utils/coordinates.dart';
import 'package:leqg/utils/format_store.dart';
import 'package:leqg/utils/price.dart';
import 'package:leqg/utils/reputation.dart';
import 'package:leqg/utils/schedule_filters.dart';
import 'package:leqg/utils/time.dart';
import 'package:leqg/utils/url.dart';

void main() {
  group('time', () {
    test('minutesToTime', () {
      expect(minutesToTime(0), '00:00');
      expect(minutesToTime(null), '00:00');
      expect(minutesToTime(0, short: true), '00h');
      expect(minutesToTime(1020), '17:00');
      expect(minutesToTime(1020, short: true), '17h');
      expect(minutesToTime(1050, short: true), '17:30');
      expect(minutesToTime(65), '01:05');
    });
  });

  group('price', () {
    test('displayPrice', () {
      expect(displayPrice(null), '');
      expect(displayPrice(5), '5');
      expect(displayPrice(5.0), '5');
      expect(displayPrice(5.5), '5,50');
      expect(displayPrice(5.55), '5,55');
    });

    test('parsePrice', () {
      expect(parsePrice(null), null);
      expect(parsePrice('5'), 5);
      expect(parsePrice('5,5'), 5.5);
      expect(parsePrice('5.5'), 5.5);
      expect(parsePrice('abc'), null);
    });
  });

  group('formatStore', () {
    test('getLowest ignore les valeurs nulles et zéro', () {
      expect(getLowest([]), 0);
      expect(getLowest([5, 3, 8]), 3);
      expect(getLowest([null, 4, 0, 2]), 2);
      expect(getLowest([null, 0]), 0);
    });

    test('decompressSchedules', () {
      final schedules = decompressSchedules([
        0,
        [
          [1020, 120],
          [1080, 1200]
        ],
        [
          [600, 1200]
        ],
      ]);
      expect(schedules[0].dayOfWeek, 1);
      expect(schedules[0].closed, true);
      expect(schedules[1].dayOfWeek, 2);
      expect(schedules[1].closed, false);
      expect(schedules[1].opening, 1020);
      expect(schedules[1].closing, 120);
      expect(schedules[1].openingSpecial, 1080);
      expect(schedules[1].closingSpecial, 1200);
      expect(schedules[2].opening, 600);
      expect(schedules[2].openingSpecial, null);
    });

    test('storesToDatabase décompresse un store', () {
      final store = storesToDatabase([
        12,
        'Le QG',
        '1 rue de la Soif, Paris',
        2.34,
        48.86,
        null,
        null,
        'EUR',
        [
          [3, 5.5, 4.0, 50]
        ],
        [
          [
            [1020, 120]
          ]
        ],
        [1, 4],
        4.2,
        17,
      ]);
      expect(store!.id, 12);
      expect(store.name, 'Le QG');
      expect(store.currencyCode, 'EUR');
      expect(store.productsById['3']!.price, 5.5);
      expect(store.productsById['3']!.specialPrice, 4.0);
      expect(store.schedules.first.opening, 1020);
      expect(store.features, [1, 4]);
      expect(store.rate, 4.2);
      expect(store.rateCount, 17);
    });
  });

  group('coordinates', () {
    test('distance Paris → Lyon ~392 km', () {
      final distance = getCoordinatesDistance(
        latitude1: 48.8566,
        longitude1: 2.3522,
        latitude2: 45.7640,
        longitude2: 4.8357,
      );
      expect(distance, closeTo(392, 5));
    });

    test('isStoreInBounds', () {
      final store = Store(
          id: 1, name: 'a', longitude: 2.0, latitude: 48.0);
      expect(
        isStoreInBounds(
            store,
            const MapBounds(
                northEast: [3, 49], southWest: [1, 47])),
        true,
      );
      expect(
        isStoreInBounds(
            store,
            const MapBounds(
                northEast: [3, 49], southWest: [2.5, 47])),
        false,
      );
      expect(isStoreInBounds(store, null), true);
    });
  });

  group('reputation', () {
    test('getLevel', () {
      expect(getLevel(0), 1);
      expect(getLevel(5), 1);
      expect(getLevel(10), 2);
      expect(getLevel(99), 2);
      expect(getLevel(100), 3);
    });
  });

  group('url', () {
    test('getUrlHost', () {
      expect(getUrlHost('https://leqg.app/page'), 'leqg.app');
      expect(getUrlHost('leqg.app'), '');
      expect(getUrlHost(null), '');
    });
  });

  group('storeCoversFilterTime', () {
    test('filtre avant minuit couvert par un store simple', () {
      // Store 17h-23h (1020-1380), filtre 19h-21h (1140-1260)
      expect(storeCoversFilterTime(1020, 1380, 1140, 1260), true);
      // Filtre 16h-21h : le store ouvre trop tard
      expect(storeCoversFilterTime(1020, 1380, 960, 1260), false);
    });

    test('store chevauchant minuit couvre le filtre du soir', () {
      // Store 22h-3h (1320-180), filtre 22h30-23h30 (1350-1410)
      expect(storeCoversFilterTime(1320, 180, 1350, 1410), true);
    });

    test('filtre après minuit', () {
      // Store 22h-3h, filtre 1h-2h le lendemain (1500-1560)
      expect(storeCoversFilterTime(1320, 180, 1500, 1560), true);
      // Store 20h-23h, filtre après minuit
      expect(storeCoversFilterTime(1200, 1380, 1500, 1560), false);
    });

    test('filtre chevauchant minuit', () {
      // Store 20h-3h (1200-180), filtre 22h-2h (1320-1560)
      expect(storeCoversFilterTime(1200, 180, 1320, 1560), true);
      // Store sans chevauchement ne peut pas couvrir
      expect(storeCoversFilterTime(1200, 1380, 1320, 1560), false);
    });
  });

  group('storeMatchesScheduleFilter', () {
    Store storeWith(List<Schedule> schedules) => Store(
        id: 1, name: 'a', longitude: 0, latitude: 0, schedules: schedules);

    test('sans filtre ou sans horaires → match', () {
      expect(storeMatchesScheduleFilter(storeWith([]), null), true);
      expect(
        storeMatchesScheduleFilter(
          storeWith([]),
          const ScheduleFilter(days: [1], startTime: 1140, endTime: 1260),
        ),
        true,
      );
    });

    test('match sur un jour ouvert aux bons horaires', () {
      final store = storeWith([
        const Schedule(dayOfWeek: 1, opening: 1020, closing: 1380),
        const Schedule(dayOfWeek: 2, closed: true),
      ]);
      expect(
        storeMatchesScheduleFilter(store,
            const ScheduleFilter(days: [1], startTime: 1140, endTime: 1260)),
        true,
      );
      expect(
        storeMatchesScheduleFilter(store,
            const ScheduleFilter(days: [2], startTime: 1140, endTime: 1260)),
        false,
      );
    });

    test('jour précédent chevauchant minuit pour un filtre après minuit', () {
      final store = storeWith([
        const Schedule(dayOfWeek: 5, opening: 1320, closing: 180),
      ]);
      // Filtre samedi 1h-2h du matin (jour 6, après minuit)
      expect(
        storeMatchesScheduleFilter(store,
            const ScheduleFilter(days: [6], startTime: 1500, endTime: 1560)),
        true,
      );
    });
  });

  group('isStoreOpenAt', () {
    final store = Store(
      id: 1,
      name: 'a',
      longitude: 0,
      latitude: 0,
      schedules: const [
        Schedule(dayOfWeek: 1, opening: 1020, closing: 120),
      ],
    );

    test('pendant les heures d\'ouverture', () {
      expect(isStoreOpenAt(store, 1, 1100), true);
      expect(isStoreOpenAt(store, 1, 900), false);
    });

    test('après minuit via le jour précédent', () {
      // Mardi 1h du matin (1440 + 60) : le store du lundi ferme à 2h
      expect(isStoreOpenAt(store, 2, 1500), true);
      expect(isStoreOpenAt(store, 2, 1600), false);
    });
  });
}
