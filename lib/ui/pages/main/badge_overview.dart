import 'package:flutter/material.dart';
import 'package:no_fap/data/utils/badge_calculator.dart';
import 'package:no_fap/ui/widgets/badge_display.dart';
import 'package:no_fap/ui/widgets/progress_counter.dart';

class HomePage extends StatelessWidget {
  final DateTime startDate;

  const HomePage({super.key, required this.startDate});

  @override
  Widget build(BuildContext context) {
    final badge = BadgeCalculator.calculateCurrentBadge(startDate);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          BadgeDisplay(badge: badge),
          const SizedBox(height: 30),
          ProgressCounter(badge: badge),
        ],
      ),
    );
  }
}
