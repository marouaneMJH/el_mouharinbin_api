import 'dart:async';

import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

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

      home: Scaffold(
        appBar: AppBar(
          title: Text('NO FAP!', style: TextStyle(fontWeight: FontWeight.bold)),
        ),

        body: HomePage(),
        backgroundColor: Colors.black,
        floatingActionButton: ResetToLoserButton(),
        drawer: DrawerAllBadges(),

        bottomNavigationBar: BottomNavBar(),
      ),
    );
  }
}

class CurrentBadgeImages extends StatelessWidget {
  final String imagePath;
  const CurrentBadgeImages({super.key, required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 150,
      height: 150,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        image: DecorationImage(image: AssetImage(imagePath), fit: BoxFit.cover),
        border: Border.all(color: Colors.black, width: 4),
      ),
    );
  }
}

class BadgeTitleBox extends StatelessWidget {
  final String title;
  final String subtitle;

  const BadgeTitleBox({
    super.key,
    this.title = "Absolute Chad",
    this.subtitle = "Current Badge",
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 350,
        height: 140,

        color: Colors.white,
        child: Column(
          spacing: 10,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: TextStyle(fontSize: 29, color: Colors.black)),
            Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.black)),
          ],
        ),
      ),
    );
  }
}

class ResetToLoserButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      width: 60,
      child: FittedBox(
        child: FloatingActionButton(
          onPressed: () {
            print("Button pressed");
          },
          backgroundColor: Colors.transparent,
          elevation: 4.0,
          child: Container(
            decoration: BoxDecoration(
              // shape: BoxShape.circle,
              borderRadius: BorderRadius.circular(20),
              image: DecorationImage(
                image: AssetImage("assets/images/loser.png"),
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CounterProgressCircle extends StatefulWidget {
  int currentDate;
  DateTime constantTime;
  CounterProgressCircle({super.key, this.currentDate = 95, DateTime? time})
    : constantTime = time ?? DateTime.now();

  @override
  State<CounterProgressCircle> createState() => _CounterProgressCircleState(
    currentDate: this.currentDate,
    time: this.constantTime,
  );
}

class _CounterProgressCircleState extends State<CounterProgressCircle> {
  int currentDate;
  DateTime constantTime;
  late double progress;

  // Constructor that initializes both currentDate and constantTime
  _CounterProgressCircleState({this.currentDate = 95, DateTime? time})
    : constantTime = time ?? DateTime.now();

  // Timer for updating the time every second
  late Timer timer;

  @override
  void initState() {
    super.initState();
    // Initialize progress
    progress = calculateProgress(constantTime);
    // Update time every second
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        constantTime = DateTime.now();
        progress = calculateProgress(constantTime);
      });
    });
  }

  @override
  void dispose() {
    timer.cancel(); // Cancel timer when widget is disposed
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Progress indicator
        SizedBox(
          height: 200,
          width: 200,
          child: CircularProgressIndicator(
            value: progress,
            strokeWidth: 5.0,
            backgroundColor: Colors.white,
            color: Colors.green.shade500,
          ),
        ),

        // Content container
        Container(
          height: 180,
          width: 180,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(90)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                currentDate.toString(),
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text("Days"),
              const SizedBox(height: 4),
              // Replace this line:
              // Text(DateTime.now().toString().substring(11, 19)),

              // With your constant time:
              Text(constantTime.toString().substring(11, 19)),
            ],
          ),
        ),
      ],
    );
  }
}

class BottomNavBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      destinations: [
        NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.history), label: 'History'),
        NavigationDestination(icon: Icon(Icons.people), label: 'Community'),
        NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
      ],
      onDestinationSelected: (value) {
        print(value);
      },
    );
  }
}

final List<Map<String, dynamic>> badgesData = [
  {"title": "Clown", "days": 10, "avatarImagePath": "assets/images/loser.png"},
  {
    "title": "Beginner",
    "days": 30,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Warrior",
    "days": 60,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Absolute Chad",
    "days": 90,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Absolute Chad",
    "days": 90,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Absolute Chad",
    "days": 90,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Absolute Chad",
    "days": 90,
    "avatarImagePath": "assets/images/loser.png",
  },
  {
    "title": "Absolute Chad",
    "days": 90,
    "avatarImagePath": "assets/images/loser.png",
  },
];

class DrawerAllBadges extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              'All Badges',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: badgesData.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.symmetric(
                    vertical: 8.0,
                    horizontal: 16.0,
                  ),
                  child: SingleBadge(
                    title: badgesData[index]["title"],
                    days: badgesData[index]["days"],
                    avatarImagePath: badgesData[index]["avatarImagePath"],
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

class SingleBadge extends StatelessWidget {
  final String title;
  final int days;
  final String avatarImagePath;

  const SingleBadge({
    super.key,
    this.title = "Clown",
    this.days = 10,
    this.avatarImagePath = "assets/images/loser.png",
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Avatar rond
        ClipOval(
          child: Image.asset(
            avatarImagePath,
            width: 60,
            height: 60,
            fit: BoxFit.cover,
          ),
        ),
        const SizedBox(width: 12),
        // Textes blancs en colonne
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

class HomePage extends StatelessWidget {
  DateTime? lastDateTime;
  late CompleteBadge completeBadge;
  HomePage({super.key, this.lastDateTime}) {
    completeBadge = calculateCompleteBadge(lastDateTime ?? DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        spacing: 30,

        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: 110), // Push the box down
                child: BadgeTitleBox(title: completeBadge.badgeTitle),
              ),
              Positioned(
                top: 0,
                child: CurrentBadgeImages(
                  imagePath: completeBadge.badgeAvatarPath,
                ),
              ),
            ],
          ),

          CounterProgressCircle(
            currentDate: completeBadge.days,
            time: completeBadge.time,
          ),
        ],
      ),
    );
  }
}

double calculateProgress(DateTime date) {
  // Calculate progress as a ratio of how far through the day we are
  // Returns a value between 0.0 and 1.0
  final now = DateTime.now();

  // Get seconds elapsed since the start of the day
  final secondsElapsed = now.hour * 3600 + now.minute * 60 + now.second;

  // Total seconds in a day
  const totalSecondsInDay = 24 * 3600;

  // Calculate progress (how far through the day we are)
  return secondsElapsed / totalSecondsInDay;
}

class CompleteBadge {
  String badgeTitle;
  String badgeAvatarPath;
  int days;
  DateTime time;

  CompleteBadge(this.badgeTitle, this.badgeAvatarPath, this.days, this.time);
}

// function that calculate the current user badge from a initial datetime
CompleteBadge calculateCompleteBadge(DateTime dateTime) {
  // Calculate number of days since the provided date
  final now = DateTime.now();
  final difference = now.difference(dateTime);
  final days = difference.inDays;

  // Determine badge based on the number of days
  String badgeTitle;
  String badgeAvatarPath = 'assets/images/loser.png';

  if (days >= 90) {
    badgeTitle = "Absolute Chad";
    badgeAvatarPath = 'assets/images/chad.png';
  } else if (days >= 60) {
    badgeTitle = "Warrior";
    badgeAvatarPath = 'assets/images/warrior.png';
  } else if (days >= 30) {
    badgeTitle = "Beginner";
    badgeAvatarPath = 'assets/images/beginner.png';
  } else {
    badgeTitle = "Clown";
  }

  return CompleteBadge(badgeTitle, badgeAvatarPath, days, dateTime);
}
