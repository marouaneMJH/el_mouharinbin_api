import 'package:flutter/material.dart';
import 'package:no_fap/core/navigation/screen_registry.dart';
import 'package:no_fap/data/notifiers.dart';
import 'package:no_fap/services/local_storage.dart' show LocalStorage;
import 'package:no_fap/ui/components/badge_drawer.dart';
import 'package:no_fap/ui/pages/main/badge_overview.dart';
import 'package:no_fap/ui/widgets/bottom_nav_bar.dart';
import 'package:no_fap/ui/widgets/reset_button.dart' show ResetButton;

class MainScreen extends StatefulWidget {
  final int SCREEN_INDEX = 0; // Needed for the screen registry

  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late DateTime? startDate = null;
  int currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    LocalStorage.loadStartDate().then((date) {
      setState(() {
        startDate = date ?? DateTime(2025, 7, 2);
      });
    });
  }

  void resetStartDate() {
    setState(() {
      LocalStorage.resetStartDate();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (startDate == null) {
      return const Scaffold(body: Center(child: Text("Init Date")));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _getPageTitle(currentPageIndex),
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: _actions(),
      ),

      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: KeyedSubtree(
          key: ValueKey(
            currentPageIndex,
          ), // Important pour déclencher l’animation
          child: _getPageWidget(currentPageIndex),
        ),
      ),
      floatingActionButton: currentPageIndex == 0
          ? ResetButton(onReset: resetStartDate)
          : null,
      drawer: const BadgesDrawer(),
      bottomNavigationBar: AppBottomNavBar(
        currentPageIndex: currentPageIndex,
        onTabChange: _onTabChange(),
      ),
    );
  }

  String _getPageTitle(int pageIndex) {
    return appScreensPages[widget.SCREEN_INDEX].pages[pageIndex].title;
  }

  Widget _getPageWidget(int pageIndex) {
    return appScreensPages[widget.SCREEN_INDEX].pages[pageIndex].page;
  }

  ValueChanged<int> _onTabChange() {
    return (index) => setState(() {
      currentPageIndex = index;
    });
  }

  List<Widget> _actions() {
    return [
      ValueListenableBuilder(
        valueListenable: isDarkModeNotifier,
        builder: (context, isDarkMode, child) {
          return IconButton(
            onPressed: () {
              isDarkModeNotifier.value = !isDarkModeNotifier.value;
            },
            icon: Icon(isDarkMode ? Icons.dark_mode : Icons.light_mode),
          );
        },
      ),
    ];
  }
}
