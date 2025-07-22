import 'package:flutter/material.dart';
import 'package:no_fap/data/utils/badge_calculator.dart';
import 'package:no_fap/services/local_storage.dart';
import 'package:no_fap/ui/pages/main/start_date_picker.dart';
import 'package:no_fap/ui/widgets/badge_display.dart';
import 'package:no_fap/ui/widgets/progress_counter.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  DateTime? startDate;

  @override
  void initState() {
    super.initState();
    _loadStartDate();
  }

  Future<void> _loadStartDate() async {
    final date = await LocalStorage.loadStartDate();
    setState(() {
      startDate = date;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (startDate == null) {
      return StartDatePicker();
    } else {
      final badge = BadgeCalculator.calculateCurrentBadge(startDate!);

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
