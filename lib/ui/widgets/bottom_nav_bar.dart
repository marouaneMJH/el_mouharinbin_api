import 'package:flutter/material.dart';

class AppBottomNavBar extends StatefulWidget {
  final int currentPageIndex;
  final ValueChanged<int> onTabChange;

  const AppBottomNavBar({
    super.key,
    required this.currentPageIndex,
    required this.onTabChange,
  });

  @override
  State<AppBottomNavBar> createState() => _AppBottomNavBarState();
}

class _AppBottomNavBarState extends State<AppBottomNavBar> {
  int currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    currentPageIndex = widget.currentPageIndex;
  }

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      onDestinationSelected: (index) {
        widget.onTabChange(index);
        setState(() {
          currentPageIndex = index;
        });
      },
      selectedIndex: currentPageIndex,
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.history), label: 'History'),
        NavigationDestination(icon: Icon(Icons.group), label: 'Group'),
        NavigationDestination(icon: Icon(Icons.people), label: 'Community'),
        NavigationDestination(icon: Icon(Icons.chat), label: 'Chat'),
      ],
    );
  }
}
