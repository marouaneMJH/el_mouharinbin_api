import 'package:flutter/material.dart';
import 'package:no_fap/services/local_storage.dart';

class StartDateNotifier extends ChangeNotifier {
  static final StartDateNotifier _instance = StartDateNotifier._internal();
  factory StartDateNotifier() => _instance;
  StartDateNotifier._internal();

  DateTime? _startDate;
  DateTime? get startDate => _startDate;

  Future<void> loadStartDate() async {
    _startDate = await LocalStorage.loadStartDate();
    notifyListeners();
  }

  Future<void> resetStartDate(String reason) async {
    if (_startDate != null) {
      await LocalStorage.resetStartDate(reason);

      await LocalStorage.saveStartDate(date: DateTime.now());

      loadStartDate();

      notifyListeners();
    }
  }

  Future<void> saveStartDate({DateTime? date, bool isNull = false}) async {
    await LocalStorage.saveStartDate(date: date, isNull: isNull);
    if (isNull) {
      _startDate = null;
    } else {
      _startDate = date;
    }
    notifyListeners();
  }
}
