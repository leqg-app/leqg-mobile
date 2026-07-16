import 'package:flutter/material.dart';

import 'feature_filter.dart';
import 'price_filter.dart';
import 'product_filter.dart';
import 'schedule_filter.dart';

/// Port de src/containers/Map/Filters/Filters.js : rangée horizontale des
/// 4 filtres.
class Filters extends StatelessWidget {
  const Filters({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Container(
        height: 33,
        margin: const EdgeInsets.only(top: 15, left: 20, right: 15),
        child: const Row(
          children: [
            PriceFilter(),
            ProductFilterButton(),
            ScheduleFilterButton(),
            FeatureFilter(),
          ],
        ),
      ),
    );
  }
}
