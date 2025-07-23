import 'package:flutter/material.dart';
import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/ui/widgets/history_card.dart';

class HistoryList extends StatelessWidget {
  final History history;

  const HistoryList({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    final sortedRecords = List.of(history.records)
      ..sort((a, b) => b.lastDate.compareTo(a.lastDate));

    return ListView.builder(
      itemCount: sortedRecords.length,
      itemBuilder: (context, index) {
        final record = sortedRecords[index];
        return HistoryCard(record: record);
      },
    );
  }
}
