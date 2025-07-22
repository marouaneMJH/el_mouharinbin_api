import 'package:flutter/material.dart';
import 'package:no_fap/data/notifiers.dart';
import 'package:no_fap/routes/app_router.dart';
// import 'package:no_fap/ui/screens/main_screen.dart';

void main() => runApp(const MyApp());

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
                  : Brightness.dark, // debug turn it in top light
            ),
          ),
          initialRoute: '/',
          onGenerateRoute: AppRouter.generateRoute,
        );
      },
    );
  }
}
