import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const _startDateKey = 'startDate';

  static Future<void> saveStartDate([DateTime? date]) async {
    final prefs = await SharedPreferences.getInstance();
    final dateToSave = date ?? DateTime.now();
    await prefs.setString(_startDateKey, dateToSave.toIso8601String());
  }

  static Future<DateTime?> loadStartDate() async {
    final prefs = await SharedPreferences.getInstance();
    final dateStr = prefs.getString(_startDateKey);
    return dateStr != null ? DateTime.tryParse(dateStr) : null;
  }

  static Future<void> resetStartDate() async {
    await saveStartDate(DateTime.now());
  }
}
