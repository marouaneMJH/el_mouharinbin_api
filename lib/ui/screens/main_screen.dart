import 'package:flutter/material.dart';
import 'package:no_fap/data/notifiers.dart';
import 'package:no_fap/services/local_storage.dart' show LocalStorage;
import 'package:no_fap/ui/components/badge_drawer.dart';
import 'package:no_fap/ui/screens/home_screen.dart';
import 'package:no_fap/ui/widgets/bottom_nav_bar.dart';
import 'package:no_fap/ui/widgets/reset_button.dart' show ResetButton;

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late DateTime? startDate = null;
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
        title: const Text(
          'المحارب! ',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
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
        ],
      ),

      body: HomePage(startDate: startDate!),
      floatingActionButton: ResetButton(onReset: resetStartDate),
      drawer: const BadgesDrawer(),
      bottomNavigationBar: const AppBottomNavBar(),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: isDarkModeNotifier,
      builder: (context, isDarkMode, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blueGrey,
              brightness: isDarkModeNotifier.value
                  ? Brightness.dark
                  : Brightness.light,
            ),
          ),
          home: const MainScreen(),
        );
      },
    );
  }
}
