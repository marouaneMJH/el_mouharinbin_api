// Create a new file: lib/services/start_date_notifier.dart
import 'package:flutter/material.dart';
import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/services/local_storage.dart';

class HistoryNotifier extends ChangeNotifier {
  static final HistoryNotifier _instance = HistoryNotifier._internal();
  factory HistoryNotifier() => _instance;
  HistoryNotifier._internal();

  static HistoryNotifier get instance => _instance;

  History? _history;
  History? get history => _history;

  Future<void> loadHistory() async {
    _history = await LocalStorage.loadHistory();
    notifyListeners();
  }

  Future<void> resetHistory() async {
    await LocalStorage.resetHistory();
    loadHistory();
  }
}
