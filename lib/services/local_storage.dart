import 'dart:convert';

import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/data/models/history_record.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const _startDateKey = 'startDate';
  static const _historyKey = 'history';

  static Future<void> saveStartDate({
    DateTime? date,
    bool isNull = false,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    if (isNull) {
      // Delete the old saved date value
      await prefs.remove(_startDateKey);
    } else {
      final dateToSave = date ?? DateTime.now();
      await prefs.setString(_startDateKey, dateToSave.toIso8601String());
    }
  }

  static Future<DateTime?> loadStartDate() async {
    final prefs = await SharedPreferences.getInstance();
    final dateStr = prefs.getString(_startDateKey);
    return dateStr != null ? DateTime.tryParse(dateStr) : null;
  }

  static Future<void> resetStartDate(String reason) async {
    DateTime? startDate = await loadStartDate();
    if (startDate == null) return;

    HistoryRecord newRecord = HistoryRecord(
      startDate: startDate,
      lastDate: DateTime.now(),
      reason: reason,
    );

    await appendHistoryRecord(newRecord);

    await saveStartDate(date: DateTime.now());
  }

  static Future<void> saveHistory(History history) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(history.toJson());
    await prefs.setString(_historyKey, jsonString);
  }

  static Future<History?> loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_historyKey);
    if (jsonString == null) return null;

    final Map<String, dynamic> json = jsonDecode(jsonString);
    print(json);
    return History.fromJson(json);
  }

  static Future<void> appendHistoryRecord(HistoryRecord newRecord) async {
    final prefs = await SharedPreferences.getInstance();

    // Step 1: Load existing history from SharedPreferences
    final jsonString = prefs.getString(_historyKey);
    History currentHistory;

    if (jsonString != null) {
      final json = jsonDecode(jsonString);
      currentHistory = History.fromJson(json);
    } else {
      // If there's no saved history, create a new one
      currentHistory = History(records: [], startDate: DateTime.now());
    }

    // Step 2: Append the new record to the existing list
    final updatedRecords = [...currentHistory.records, newRecord];

    // Step 3: Create a new History object (immutability)
    final updatedHistory = History(
      records: updatedRecords,
      startDate: currentHistory.startDate,
    );

    // Step 4: Save the updated object back to SharedPreferences
    await prefs.setString(_historyKey, jsonEncode(updatedHistory.toJson()));
  }

  // debug
  static resetHistory() async {
    final prefs = await SharedPreferences.getInstance();

    // Delete the old saved date value
    await prefs.remove(_historyKey);
  }
}
