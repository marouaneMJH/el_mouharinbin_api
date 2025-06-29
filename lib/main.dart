import 'dart:async';
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blueGrey,
          brightness: Brightness.dark,
        ),
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late DateTime startDate;

  @override
  void initState() {
    super.initState();
    startDate = DateTime(2024, 1, 1); // Default start date
  }

  void resetStartDate() {
    setState(() {
      startDate = DateTime.now();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'NO FAP!',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: HomePage(startDate: startDate),
      backgroundColor: Colors.black,
      floatingActionButton: ResetButton(onReset: resetStartDate),
      drawer: const BadgesDrawer(),
      bottomNavigationBar: const AppBottomNavBar(),
    );
  }
}

// Constants
class AppConstants {
  static const double badgeImageSize = 150;
  static const double avatarSize = 60;
  static const double progressCircleSize = 200;
  static const double progressStrokeWidth = 5.0;

  static const List<BadgeConfig> badges = [
    BadgeConfig(title: "Clown", days: 0, imagePath: "assets/images/loser.png"),
    BadgeConfig(
      title: "Beginner",
      days: 30,
      imagePath: "assets/images/loser.png",
    ),
    BadgeConfig(
      title: "Warrior",
      days: 60,
      imagePath: "assets/images/loser.png",
    ),
    BadgeConfig(
      title: "Absolute Chad",
      days: 90,
      imagePath: "assets/images/chad.png",
    ),
    BadgeConfig(title: "Broo", days: 500, imagePath: "assets/images/loser.png"),
  ];
}

class BadgeConfig {
  final String title;
  final int days;
  final String imagePath;

  const BadgeConfig({
    required this.title,
    required this.days,
    required this.imagePath,
  });
}

class Badge {
  final String title;
  final String imagePath;
  final int days;
  final DateTime startDate;

  Badge({
    required this.title,
    required this.imagePath,
    required this.days,
    required this.startDate,
  });
}

// Utilities
class BadgeCalculator {
  static Badge calculateCurrentBadge(DateTime startDate) {
    final daysSince = DateTime.now().difference(startDate).inDays;

    final config = AppConstants.badges.lastWhere(
      (badge) => daysSince >= badge.days,
      orElse: () => AppConstants.badges.first,
    );

    return Badge(
      title: config.title,
      imagePath: config.imagePath,
      days: daysSince,
      startDate: startDate,
    );
  }

  static double calculateDayProgress() {
    final now = DateTime.now();
    final secondsElapsed = now.hour * 3600 + now.minute * 60 + now.second;
    return secondsElapsed / (24 * 3600);
  }
}

// Widgets
class HomePage extends StatelessWidget {
  final DateTime startDate;

  const HomePage({super.key, required this.startDate});

  @override
  Widget build(BuildContext context) {
    final badge = BadgeCalculator.calculateCurrentBadge(startDate);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          BadgeDisplay(badge: badge),
          const SizedBox(height: 30),
          ProgressCounter(badge: badge),
        ],
      ),
    );
  }
}

class BadgeDisplay extends StatelessWidget {
  final Badge badge;

  const BadgeDisplay({super.key, required this.badge});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 110),
          child: BadgeTitleBox(title: badge.title),
        ),
        Positioned(
          top: 0,
          child: CircularImage(
            imagePath: badge.imagePath,
            size: AppConstants.badgeImageSize,
          ),
        ),
      ],
    );
  }
}

class CircularImage extends StatelessWidget {
  final String imagePath;
  final double size;
  final double borderWidth;

  const CircularImage({
    super.key,
    required this.imagePath,
    required this.size,
    this.borderWidth = 4,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        image: DecorationImage(image: AssetImage(imagePath), fit: BoxFit.cover),
        border: Border.all(color: Colors.black, width: borderWidth),
      ),
    );
  }
}

class BadgeTitleBox extends StatelessWidget {
  final String title;
  final String subtitle;

  const BadgeTitleBox({
    super.key,
    required this.title,
    this.subtitle = "Current Badge",
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      height: 140,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 29, color: Colors.black),
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 12, color: Colors.black),
          ),
        ],
      ),
    );
  }
}

class ProgressCounter extends StatefulWidget {
  final Badge badge;

  const ProgressCounter({super.key, required this.badge});

  @override
  State<ProgressCounter> createState() => _ProgressCounterState();
}

class _ProgressCounterState extends State<ProgressCounter> {
  late Timer _timer;
  late DateTime _currentTime;
  late double _progress;

  @override
  void initState() {
    super.initState();
    _currentTime = DateTime.now();
    _progress = BadgeCalculator.calculateDayProgress();

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _currentTime = DateTime.now();
        _progress = BadgeCalculator.calculateDayProgress();
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          height: AppConstants.progressCircleSize,
          width: AppConstants.progressCircleSize,
          child: CircularProgressIndicator(
            value: _progress,
            strokeWidth: AppConstants.progressStrokeWidth,
            backgroundColor: Colors.white,
            color: Colors.green.shade500,
          ),
        ),
        Container(
          height: 180,
          width: 180,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(90)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.badge.days.toString(),
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text("Days"),
              const SizedBox(height: 4),
              Text(_currentTime.toString().substring(11, 19)),
            ],
          ),
        ),
      ],
    );
  }
}

class ResetButton extends StatelessWidget {
  final VoidCallback onReset;

  const ResetButton({super.key, required this.onReset});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60,
      width: 60,
      child: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Reset Progress'),
              content: const Text(
                'Are you sure you want to reset your progress?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    onReset();
                    Navigator.pop(context);
                  },
                  child: const Text('Reset'),
                ),
              ],
            ),
          );
        },
        backgroundColor: Colors.transparent,
        elevation: 4.0,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            image: const DecorationImage(
              image: AssetImage("assets/images/loser.png"),
              fit: BoxFit.cover,
            ),
          ),
        ),
      ),
    );
  }
}

class AppBottomNavBar extends StatelessWidget {
  const AppBottomNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.history), label: 'History'),
        NavigationDestination(icon: Icon(Icons.people), label: 'Community'),
        NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
      ],
      onDestinationSelected: (value) => print('Selected: $value'),
    );
  }
}

class BadgesDrawer extends StatelessWidget {
  const BadgesDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'All Badges',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: AppConstants.badges.length,
              itemBuilder: (context, index) {
                final badge = AppConstants.badges[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(
                    vertical: 8.0,
                    horizontal: 16.0,
                  ),
                  child: BadgeListItem(
                    title: badge.title,
                    days: badge.days,
                    imagePath: badge.imagePath,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class BadgeListItem extends StatelessWidget {
  final String title;
  final int days;
  final String imagePath;

  const BadgeListItem({
    super.key,
    required this.title,
    required this.days,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircularImage(
          imagePath: imagePath,
          size: AppConstants.avatarSize,
          borderWidth: 0,
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '$days+ Days',
              style: const TextStyle(fontSize: 14, color: Colors.white70),
            ),
          ],
        ),
      ],
    );
  }
}
