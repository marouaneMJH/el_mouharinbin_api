import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/data/models/history_record.dart';

class DummyHistory {
  static History getDummyHistory() {
    // Create some sample history records
    final records = <HistoryRecord>[
      HistoryRecord(
        startDate: DateTime.now().subtract(const Duration(days: 120)),
        lastDate: DateTime.now().subtract(const Duration(days: 90)),
        reason: 'Lost focus during a stressful period at work',
      ),
      HistoryRecord(
        startDate: DateTime.now().subtract(const Duration(days: 89)),
        lastDate: DateTime.now().subtract(const Duration(days: 60)),
        reason: 'Was feeling lonely and had a moment of weakness',
      ),
      HistoryRecord(
        startDate: DateTime.now().subtract(const Duration(days: 59)),
        lastDate: DateTime.now().subtract(const Duration(days: 15)),
        reason: 'Boredom led to browsing inappropriate content',
      ),
      HistoryRecord(
        startDate: DateTime.now().subtract(const Duration(days: 14)),
        lastDate: DateTime.now().subtract(const Duration(days: 1)),
        reason: 'Social media triggered old habits',
      ),
    ];
    // Create a history object with these records
    return History(
      records: records,
      startDate: DateTime.now().subtract(const Duration(days: 120)),
    );
  }
}
