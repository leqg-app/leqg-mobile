import 'package:flutter/material.dart';

/// Port de src/components/Title.js.
class ScreenTitle extends StatelessWidget {
  final String text;
  final EdgeInsets margin;

  const ScreenTitle(this.text,
      {super.key,
      this.margin = const EdgeInsets.only(top: 20, left: 20, right: 20)});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: margin,
      child: Text(
        text,
        style: Theme.of(context)
            .textTheme
            .headlineLarge
            ?.copyWith(fontSize: 22),
      ),
    );
  }
}
