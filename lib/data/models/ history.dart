import 'package:no_fap/data/models/history_record.dart';

class History {
  final List<HistoryRecord> records;
  final DateTime startDate;

  History({required this.records, required this.startDate});

  Map<String, dynamic> toJson() => {
    'startDate': startDate.toIso8601String(),
    'records': records.map((r) => r.toJson()).toList(),
  };

  factory History.fromJson(Map<String, dynamic> json) => History(
    startDate: DateTime.parse(json['startDate']),
    records: (json['records'] as List<dynamic>)
        .map((r) => HistoryRecord.fromJson(r))
        .toList(),
  );
}
