import 'package:flutter/material.dart';
import 'package:no_fap/core/navigation/screen_registry.dart';
import 'package:no_fap/services/local_storage.dart' show LocalStorage;
import 'package:no_fap/ui/components/badge_drawer.dart';
import 'package:no_fap/ui/widgets/bottom_nav_bar.dart';
import 'package:no_fap/ui/widgets/reset_button.dart';

class MainScreen extends StatefulWidget {
  final int SCREEN_INDEX = 0;

  MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  DateTime? startDate;
  int currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadStartDate();
  }

  // void _loadStartDate() async {
  //   LocalStorage.loadStartDate().then((date) {
  //     setState(() {
  //       startDate = null;
  //     });
  //   });
  // }

  void resetStartDate(String reason) {
    setState(() {
      LocalStorage.resetStartDate(reason);
    });
  }

  void refreshPage(int pageIndex, {bool reloadDate = false}) {
    setState(() {
      currentPageIndex = pageIndex;
    });
    if (reloadDate) {
      _loadStartDate();
    }
  }

  Future<void> _loadStartDate() async {
    final date = await LocalStorage.loadStartDate();
    setState(() {
      startDate = date;
      print(startDate);
      if (startDate == null) currentPageIndex = 5;
    });
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
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ResetButton(onReset: resetStartDate),
                const SizedBox(height: 8),
                FloatingActionButton.extended(
                  onPressed: () => setState(() {
                    LocalStorage.saveStartDate(isNull: true);
                    currentPageIndex = 5;
                  }),
                  label: const Text("Reset to Null"),
                  icon: const Icon(Icons.refresh),
                ),
              ],
            )
          : null,

      drawer: currentPageIndex != 5 ? const BadgesDrawer() : null,
      bottomNavigationBar: currentPageIndex != 5
          ? AppBottomNavBar(
              currentPageIndex: currentPageIndex,
              onTabChange: (index) {
                setState(() {
                  currentPageIndex = index;
                });
              },
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
}
