import 'dart:async';

import 'package:flutter/material.dart' hide Badge;
import 'package:no_fap/core/constanrs.dart';
import 'package:no_fap/data/utils/badge_calculator.dart';
import 'package:no_fap/data/models/badge.dart' show Badge;

class ProgressCounter extends StatefulWidget {
  final Badge badge;

  const ProgressCounter({super.key, required this.badge});

  @override
  State<ProgressCounter> createState() => _ProgressCounterState();
}

class _ProgressCounterState extends State<ProgressCounter> {
  late Timer _timer;
  late DateTime _currentTime;
  late double _progress;

  @override
  void initState() {
    super.initState();
    _currentTime = DateTime.now();
    _progress = BadgeCalculator.calculateDayProgress();

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _currentTime = DateTime.now();
        _progress = BadgeCalculator.calculateDayProgress();
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          height: AppConstants.progressCircleSize,
          width: AppConstants.progressCircleSize,
          child: CircularProgressIndicator(
            value: _progress,
            strokeWidth: AppConstants.progressStrokeWidth,
          ),
        ),
        Container(
          height: 180,
          width: 180,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(90)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.badge.days.toString(),
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text("Days"),
              const SizedBox(height: 4),
              Text(_currentTime.toString().substring(11, 19)),
            ],
          ),
        ),
      ],
    );
  }
}
