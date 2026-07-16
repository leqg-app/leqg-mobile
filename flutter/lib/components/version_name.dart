import 'package:flutter/material.dart';

import '../constants.dart';

/// Port de src/components/VersionName.js.
class VersionName extends StatelessWidget {
  const VersionName({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(20),
      child: Text('Version $appVersion',
          style: TextStyle(color: Color(0xFF777777))),
    );
  }
}
