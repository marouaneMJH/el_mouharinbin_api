import 'package:flutter/material.dart';
import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/ui/widgets/history_card.dart';

class HistoryList extends StatelessWidget {
  final History history;

  const HistoryList({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: history.records.length,
      itemBuilder: (context, index) {
        final record = history.records[index];
        return HistoryCard(record: record);
      },
    );
  }
}
