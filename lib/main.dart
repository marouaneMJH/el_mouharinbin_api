import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:no_fap/data/notifiers.dart';
import 'package:no_fap/routes/app_router.dart';
// import 'package:no_fap/ui/screens/main_screen.dart';

void main() async {
  await dotenv.load(fileName: '.env');
  runApp(const MyApp());
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
                  : dotenv.env['ENV_MODE'] == 'dev'
                  ? Brightness.dark
                  : Brightness.dark, // debug light
            ),
          ),
          initialRoute: '/',
          onGenerateRoute: AppRouter.generateRoute,
        );
      },
    );
  }
}
