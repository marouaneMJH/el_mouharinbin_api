import 'package:no_fap/data/models/badge.dart';
import 'package:no_fap/data/utils/badge_calculator.dart';

class HistoryRecord {
  late int strick; // Streak days count
  final DateTime startDate; // Date of starting the challenge
  final DateTime lastDate; // Last streak day
  final String reason; // Reason to cut the streak

  late Badge badge; // Last badge

  HistoryRecord({
    required this.startDate,
    required this.lastDate,
    required this.reason,
  }) {
    strick = _calculateDaysBetween(startDate, lastDate);
    badge = BadgeCalculator.calculateCurrentBadge(startDate);
  }

  /// History record data model class.
  ///
  /// Used to track and store history information.
  ///
  /// Calculates the difference between two dates to track duration.
  /// This is useful for features like tracking streaks or periods of time.
  //
  int _calculateDaysBetween(DateTime from, DateTime to) {
    final normalizedFrom = DateTime(from.year, from.month, from.day);
    final normalizedTo = DateTime(to.year, to.month, to.day);
    return normalizedTo.difference(normalizedFrom).inDays + 1;
  }
}
