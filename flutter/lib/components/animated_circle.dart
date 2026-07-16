import 'dart:math';

import 'package:flutter/material.dart';

import '../constants.dart';
import '../utils/reputation.dart';

/// Port de src/components/AnimatedCircle.js : cercle de progression du
/// niveau de réputation, avec passage de niveau animé.
class AnimatedCircle extends StatefulWidget {
  final double initial;
  final double won;

  const AnimatedCircle({super.key, required this.initial, required this.won});

  @override
  State<AnimatedCircle> createState() => _AnimatedCircleState();
}

class _AnimatedCircleState extends State<AnimatedCircle> {
  late int level = getLevel(widget.initial);
  late double initialPercent = _percentage(widget.initial);

  double _percentage(double score) {
    final previousLevel = level > 0 ? levels[level - 1] : 0;
    return (score - previousLevel) / (levels[level] - previousLevel) * 100;
  }

  void _onComplete() {
    final finalScore = widget.initial + widget.won;
    if (level < getLevel(finalScore)) {
      setState(() {
        level = level + 1;
        initialPercent = 0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final finalScore = widget.initial + widget.won;
    final finalPercentage = _percentage(finalScore);

    return Stack(
      alignment: Alignment.center,
      children: [
        _CircleAnimate(
          initial: initialPercent,
          target: min(100, finalPercentage),
          text: '$level',
          onComplete: _onComplete,
        ),
        Icon(Icons.shield,
            color: Theme.of(context).colorScheme.primary, size: 40),
        Text(
          '$level',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 20,
          ),
        ),
      ],
    );
  }
}

class _CircleAnimate extends StatelessWidget {
  final double initial;
  final double target;
  final String text;
  final VoidCallback onComplete;
  final double radius = 40;
  final double strokeWidth = 10;

  const _CircleAnimate({
    required this.initial,
    required this.target,
    required this.text,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return SizedBox(
      width: radius * 2,
      height: radius * 2,
      child: TweenAnimationBuilder<double>(
        key: ValueKey('$initial-$target-$text'),
        tween: Tween(begin: initial, end: target),
        duration: const Duration(milliseconds: 1000),
        onEnd: onComplete,
        builder: (context, percentage, _) => CustomPaint(
          painter: _CirclePainter(
            percentage: percentage,
            color: color,
            strokeWidth: strokeWidth,
          ),
        ),
      ),
    );
  }
}

class _CirclePainter extends CustomPainter {
  final double percentage;
  final Color color;
  final double strokeWidth;

  _CirclePainter({
    required this.percentage,
    required this.color,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    final background = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius, background);

    final foreground = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      2 * pi * percentage / 100,
      false,
      foreground,
    );
  }

  @override
  bool shouldRepaint(_CirclePainter oldDelegate) =>
      oldDelegate.percentage != percentage;
}
