import 'package:flutter/material.dart';

/// Port de src/components/AnimatedText.js : compteur animé.
class AnimatedCountText extends StatelessWidget {
  final double initial;
  final double won;

  const AnimatedCountText({super.key, required this.initial, required this.won});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: initial, end: initial + won),
      duration: const Duration(milliseconds: 2000),
      curve: Curves.easeOut,
      builder: (context, value, _) => Text(
        value.round().toString(),
        textAlign: TextAlign.center,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w900,
          fontSize: 20,
        ),
      ),
    );
  }
}
