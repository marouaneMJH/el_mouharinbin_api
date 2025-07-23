import 'package:flutter/material.dart';
import 'package:no_fap/data/utils/badge_calculator.dart';
import 'package:no_fap/data/notifier/start_date_notifier.dart';
import 'package:no_fap/ui/pages/main/start_date_picker.dart';
import 'package:no_fap/ui/widgets/badge_display.dart';
import 'package:no_fap/ui/widgets/progress_counter.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final StartDateNotifier _startDateNotifier = StartDateNotifier();

  @override
  void initState() {
    super.initState();
    _startDateNotifier.addListener(_onStartDateChanged);
    // Load initial data if not already loaded
    if (_startDateNotifier.startDate == null) {
      _startDateNotifier.loadStartDate();
    }
  }

  @override
  void dispose() {
    _startDateNotifier.removeListener(_onStartDateChanged);
    super.dispose();
  }

  void _onStartDateChanged() {
    setState(() {
      // This will trigger a rebuild when the start date changes
    });
  }

  @override
  Widget build(BuildContext context) {
    final startDate = _startDateNotifier.startDate;

    if (startDate == null) {
      return StartDatePicker();
    } else {
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
}
