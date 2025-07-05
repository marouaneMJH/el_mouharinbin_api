import 'package:flutter/material.dart';
import 'package:no_fap/data/dummy/dummy_history.dart';
import 'package:no_fap/data/models/%20history.dart';
import 'package:no_fap/ui/widgets/history_list.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Get dummy history data
    final History history = DummyHistory.getDummyHistory();
    return history.records.isNotEmpty
        ? HistoryList(history: history)
        : Center(child: Text('No History'));
  }
}
