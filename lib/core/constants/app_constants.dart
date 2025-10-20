import 'package:flutter/material.dart';

class AppConstants {
  // App Info
  static const String appName = 'NoFap Journey';
  static const String appVersion = '1.0.0';
  static const String appDescription =
      'Your companion for personal growth and self-control';

  // Design Constants
  static const double borderRadius = 16.0;
  static const double smallBorderRadius = 8.0;
  static const double largeBorderRadius = 24.0;

  static const double padding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double extraLargePadding = 32.0;

  static const double iconSize = 24.0;
  static const double smallIconSize = 16.0;
  static const double largeIconSize = 32.0;
  static const double extraLargeIconSize = 48.0;

  // Typography
  static const double headlineFontSize = 32.0;
  static const double titleFontSize = 24.0;
  static const double bodyFontSize = 16.0;
  static const double captionFontSize = 14.0;
  static const double smallFontSize = 12.0;

  // Elevation
  static const double cardElevation = 4.0;
  static const double bottomSheetElevation = 8.0;
  static const double appBarElevation = 0.0;

  // Glassmorphism
  static const double glassOpacity = 0.1;
  static const double glassBorderOpacity = 0.2;
  static const double glassBlur = 20.0;

  // Animation values
  static const double animationScale = 0.95;
  static const Curve animationCurve = Curves.easeInOutCubic;

  // Grid & List
  static const int gridCrossAxisCount = 2;
  static const double gridAspectRatio = 1.2;
  static const double listItemHeight = 80.0;

  // Images
  static const String defaultAvatar = 'assets/images/default_avatar.png';
  static const String appLogo = 'assets/images/logo.png';
  static const String backgroundPattern = 'assets/images/pattern.png';

  // URLs
  static const String privacyPolicyUrl = 'https://nofap.com/privacy';
  static const String termsOfServiceUrl = 'https://nofap.com/terms';
  static const String supportEmail = 'support@nofap.com';

  // Achievement levels
  static const Map<int, String> achievementLevels = {
    1: 'Beginner',
    7: 'First Week',
    30: 'One Month',
    90: 'Three Months',
    180: 'Half Year',
    365: 'One Year',
  };

  // Motivational quotes
  static const List<String> motivationalQuotes = [
    "Every moment is a fresh beginning.",
    "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
    "You are stronger than you think.",
    "Progress, not perfection.",
    "One day at a time.",
    "Your potential is endless.",
    "Believe in yourself and all that you are.",
    "The journey of a thousand miles begins with one step.",
  ];

  // Challenge difficulties
  static const Map<String, Color> challengeDifficulties = {
    'easy': Color(0xFF4CAF50),
    'medium': Color(0xFFFF9800),
    'hard': Color(0xFFF44336),
  };

  // Status colors
  static const Color successColor = Color(0xFF4CAF50);
  static const Color warningColor = Color(0xFFFF9800);
  static const Color errorColor = Color(0xFFF44336);
  static const Color infoColor = Color(0xFF2196F3);
}

class AppStrings {
  // Auth
  static const String signIn = 'Sign In';
  static const String signUp = 'Sign Up';
  static const String signOut = 'Sign Out';
  static const String forgotPassword = 'Forgot Password?';
  static const String resetPassword = 'Reset Password';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String username = 'Username';

  // Navigation
  static const String home = 'Home';
  static const String journal = 'Journal';
  static const String challenges = 'Challenges';
  static const String community = 'Community';
  static const String profile = 'Profile';
  static const String settings = 'Settings';

  // General
  static const String save = 'Save';
  static const String cancel = 'Cancel';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
  static const String add = 'Add';
  static const String ok = 'OK';
  static const String yes = 'Yes';
  static const String no = 'No';
  static const String loading = 'Loading...';
  static const String error = 'Error';
  static const String success = 'Success';
  static const String retry = 'Retry';

  // Errors
  static const String networkError = 'Network connection error';
  static const String serverError = 'Server error occurred';
  static const String validationError = 'Please check your input';
  static const String authError = 'Authentication failed';
  static const String permissionError = 'Permission denied';

  // Success messages
  static const String dataSaved = 'Data saved successfully';
  static const String profileUpdated = 'Profile updated successfully';
  static const String passwordChanged = 'Password changed successfully';

  // Journal
  static const String todayEntry = "Today's Entry";
  static const String addEntry = 'Add Entry';
  static const String editEntry = 'Edit Entry';
  static const String howAreYouFeeling = 'How are you feeling today?';
  static const String writeThoughts = 'Write your thoughts...';

  // Challenges
  static const String dailyChallenge = 'Daily Challenge';
  static const String weeklyChallenge = 'Weekly Challenge';
  static const String monthlyChallenge = 'Monthly Challenge';
  static const String customChallenge = 'Custom Challenge';
  static const String joinChallenge = 'Join Challenge';
  static const String startChallenge = 'Start Challenge';

  // Community
  static const String shareYourStory = 'Share your story';
  static const String supportOthers = 'Support others';
  static const String askQuestion = 'Ask a question';

  // Progress
  static const String daysClean = 'Days Clean';
  static const String currentStreak = 'Current Streak';
  static const String longestStreak = 'Longest Streak';
  static const String totalDays = 'Total Days';
}
