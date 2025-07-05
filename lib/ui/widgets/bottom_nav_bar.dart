import 'package:flutter/material.dart';

class AppBottomNavBar extends StatefulWidget {
  final int currentPageIndex;
  const AppBottomNavBar({super.key, required this.currentPageIndex});

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
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.history), label: 'History'),
        NavigationDestination(icon: Icon(Icons.group), label: 'Group'),
        NavigationDestination(icon: Icon(Icons.people), label: 'Community'),
        NavigationDestination(icon: Icon(Icons.chat), label: 'Chat'),
      ],
      selectedIndex: currentPageIndex,
      onDestinationSelected: (value) => setState(() {
        currentPageIndex = value;
        _changeTab(currentPageIndex);
      }),
    );
  }

  void _changeTab(int index) {
    setState(() {
      currentPageIndex = index;
    });

    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/history');
        break;
      case 2:
        Navigator.pushReplacementNamed(context, '/group');
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/community');
        break;
      case 4:
        Navigator.pushReplacementNamed(context, '/chat');
        break;
    }
  }
}
