import 'package:flutter/material.dart';
import 'package:no_fap/core/navigation/screen_registry.dart';
import 'package:no_fap/services/local_storage.dart' show LocalStorage;
import 'package:no_fap/ui/components/badge_drawer.dart';
import 'package:no_fap/ui/widgets/bottom_nav_bar.dart';
import 'package:no_fap/ui/widgets/reset_button.dart';

class MainScreen extends StatefulWidget {
  final int SCREEN_INDEX = 0;

  const MainScreen({super.key});

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

  void _loadStartDate() {
    LocalStorage.loadStartDate().then((date) {
      setState(() {
        startDate = date;
      });
    });
  }

  void resetStartDate(String reason) {
    setState(() {
      LocalStorage.resetStartDate(reason);
      print(reason);
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
          ? ResetButton(onReset: resetStartDate)
          : null,
      drawer: const BadgesDrawer(),
      bottomNavigationBar: AppBottomNavBar(
        currentPageIndex: currentPageIndex,
        onTabChange: (index) {
          setState(() {
            currentPageIndex = index;
          });
        },
      ),
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
