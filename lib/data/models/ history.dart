import 'package:no_fap/data/models/history_record.dart';

class History {
  final List<HistoryRecord> records;
  final DateTime startDate;

  History({required this.records, required this.startDate});
}
