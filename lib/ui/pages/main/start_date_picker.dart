import 'package:flutter/material.dart';
import 'package:no_fap/data/globals.dart';
import 'package:no_fap/services/local_storage.dart';
import 'package:no_fap/ui/widgets/pick_start_date.dart';

class StartDatePicker extends StatelessWidget {
  const StartDatePicker({super.key});

  @override
  Widget build(BuildContext context) {
    return PickStartDate(
      onPickedDate: (DateTime? date) {
        _refreshOnPickedDate(date);
      },
    );
  }

  void _refreshOnPickedDate(DateTime? date) {
    if (date != null) {
      LocalStorage.saveStartDate(date);
      mainScreenKey.currentState?.refreshPage(0, reloadDate: true);
    }
  }
}
