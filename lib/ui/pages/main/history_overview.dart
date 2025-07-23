import 'package:flutter/material.dart';
import 'package:no_fap/data/models/ history.dart';
import 'package:no_fap/data/notifier/history_notifier.dart';
import 'package:no_fap/services/local_storage.dart';
import 'package:no_fap/ui/widgets/history_list.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  final HistoryNotifier _historyNotifier = HistoryNotifier.instance;

  History? _history;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _historyNotifier.addListener(_onHistoryUpdated);
    _loadHistory();
  }

  @override
  void dispose() {
    _historyNotifier.removeListener(_onHistoryUpdated);

    super.dispose();
  }

  void _loadHistory() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _historyNotifier.loadHistory();
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onHistoryUpdated() {
    setState(() {
      _history = _historyNotifier.history;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text('Erreur : $_error'));
    }

    if (_history == null || _history!.records.isEmpty) {
      return const Center(child: Text('Aucun historique'));
    }

    return HistoryList(history: _history!);
  }
}
