import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:no_fap/core/navigation/screen_registry.dart';
import 'package:no_fap/data/notifier/history_notifier.dart';
import 'package:no_fap/data/notifier/start_date_notifier.dart';
import 'package:no_fap/ui/components/badge_drawer.dart';
import 'package:no_fap/ui/widgets/bottom_nav_bar.dart';
import 'package:no_fap/ui/widgets/reset_button.dart';

/**
 * 
 * Is the first showen screen to the user
 * the main screen contain all the main pages
 */
class MainScreen extends StatefulWidget {
  final int SCREEN_INDEX = 0;

  MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  final StartDateNotifier _startDateNotifier = StartDateNotifier();
  final HistoryNotifier _historyNotifier = HistoryNotifier.instance;

  int currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    _startDateNotifier.loadStartDate();
    _startDateNotifier.addListener(_onStartDateChanged);
    _historyNotifier.addListener(_onHistoryChanged);
  }

  @override
  void dispose() {
    _startDateNotifier.removeListener(_onStartDateChanged);
    _historyNotifier.removeListener(_onHistoryChanged);

    // _historyNotifier.removeListener(_onPressResetHistoryButton);
    super.dispose();
  }

  void _onHistoryChanged() {
    // This will be called when history is updated
    // You can add any UI updates here if needed
  }

  void _onStartDateChanged() {
    setState(() {
      if (_startDateNotifier.startDate == null) {
        currentPageIndex = 5;
      }
    });
  }

  void resetStartDate(String reason) async {
    await _startDateNotifier.resetStartDate(reason);
  }

  void refreshPage(int pageIndex, {bool reloadDate = false}) {
    setState(() {
      currentPageIndex = pageIndex;
    });
    if (reloadDate) {
      _startDateNotifier.loadStartDate();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _getPageTitle(currentPageIndex),
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: _actions(),
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) =>
              FadeTransition(opacity: animation, child: child),
          child: KeyedSubtree(
            key: ValueKey(currentPageIndex),
            child: _getPageWidget(currentPageIndex),
          ),
        ),
      ),
      floatingActionButton: currentPageIndex == 0
          ? (dotenv.env['ENV_MODE'] == 'dev'
                ? Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ResetButton(onReset: resetStartDate),
                      const SizedBox(height: 8),
                      FloatingActionButton.extended(
                        onPressed: _onPressResetButton,
                        label: const Text("Reset to NULL"),
                        icon: const Icon(Icons.refresh),
                      ),
                    ],
                  )
                : ResetButton(onReset: resetStartDate))
          : (currentPageIndex == 1
                ? FloatingActionButton.extended(
                    onPressed: _onPressResetHistoryButton,
                    label: const Text("Reset the History"),
                    icon: const Icon(Icons.refresh),
                  )
                : null),

      drawer: currentPageIndex != 5 ? const BadgesDrawer() : null,
      bottomNavigationBar: currentPageIndex != 5
          ? AppBottomNavBar(
              currentPageIndex: currentPageIndex,
              onTabChange: _onTabChange(),
            )
          : null,
    );
  }

  String _getPageTitle(int pageIndex) {
    return appScreensPages[widget.SCREEN_INDEX].pages[pageIndex].title;
  }

  Widget _getPageWidget(int pageIndex) {
    return appScreensPages[widget.SCREEN_INDEX].pages[pageIndex].page;
  }

  List<Widget>? _actions() {
    return null;
  }

  Function(int) _onTabChange() {
    return (index) {
      setState(() {
        currentPageIndex = index;
      });
    };
  }

  // debug
  _onPressResetButton() async {
    await _startDateNotifier.saveStartDate(isNull: true);
    setState(() {
      currentPageIndex = 5;
    });
  }

  _onPressResetHistoryButton() async {
    await _historyNotifier.resetHistory();
    // print("History reset completed");
  }
}
