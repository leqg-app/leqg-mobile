import 'package:flutter/material.dart';

/// Équivalent de react-native-rheostat (BarRheostat) : histogramme des
/// valeurs + double slider à crans.
class BarRheostat extends StatelessWidget {
  final List<double> values; // [min, max] en crans
  final int min;
  final int max;
  final List<num> svgData;
  final void Function(List<double> values) onValuesUpdated;

  const BarRheostat({
    super.key,
    required this.values,
    required this.min,
    required this.max,
    required this.svgData,
    required this.onValuesUpdated,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final maxData = svgData.isEmpty
        ? 0
        : svgData.reduce((a, b) => a > b ? a : b);
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        SizedBox(
          height: 150,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (var i = 0; i < svgData.length; i++)
                Expanded(
                  child: Container(
                    height: maxData == 0
                        ? 0
                        : 150 * (svgData[i] / maxData).clamp(0.0, 1.0),
                    margin: const EdgeInsets.symmetric(horizontal: 0.5),
                    color: i >= values[0] && i <= values[1]
                        ? colors.primary
                        : colors.primary.withValues(alpha: 0.25),
                  ),
                ),
            ],
          ),
        ),
        RangeSlider(
          values: RangeValues(values[0], values[1]),
          min: min.toDouble(),
          max: max.toDouble(),
          divisions: max - min,
          activeColor: colors.primary,
          onChanged: (range) =>
              onValuesUpdated([range.start.roundToDouble(), range.end.roundToDouble()]),
        ),
      ],
    );
  }
}
