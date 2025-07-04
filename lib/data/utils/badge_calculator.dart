import 'package:no_fap/core/constanrs.dart';
import 'package:no_fap/data/models/badge.dart';

class BadgeCalculator {
  static Badge calculateCurrentBadge(DateTime startDate) {
    final daysSince = DateTime.now().difference(startDate).inDays;

    final config = AppConstants.badges.lastWhere(
      (badge) => daysSince >= badge.days,
      orElse: () => AppConstants.badges.first,
    );

    return Badge(
      title: config.title,
      imagePath: config.imagePath,
      days: daysSince,
      startDate: startDate,
    );
  }

  static double calculateDayProgress() {
    final now = DateTime.now();
    final secondsElapsed = now.hour * 3600 + now.minute * 60 + now.second;
    return secondsElapsed / (24 * 3600);
  }
}
