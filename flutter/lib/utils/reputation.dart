import '../constants.dart';

/// Port de src/utils/reputation.js.
int getLevel(double reputation) {
  return levels.indexWhere((step) => reputation < step);
}

double getReputationToNextLevel(double reputation) {
  final nextLevel = getLevel(reputation) + 1;
  return levels[nextLevel] - reputation;
}
