import 'package:flutter/material.dart';

class AppConstants {
  // Private constructor to prevent instantiation
  AppConstants._();

  // App Info
  static const String appName = 'NoFap Journey';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Your companion for personal growth and self-control';
  
  // API Base URLs
  static const String devBaseUrl = 'http://localhost:3000';
  static const String prodBaseUrl = 'https://api.nofap.dev';
  static const String stagingBaseUrl = 'https://staging-api.nofap.dev';
  
  // Environment detection
  static const bool kIsProduction = bool.fromEnvironment('dart.vm.product');
  static String get baseUrl => kIsProduction ? prodBaseUrl : devBaseUrl;
  
  // API Timeout Durations (in milliseconds)
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  static const int sendTimeout = 30000; // 30 seconds
  static const int cacheTimeout = 300000; // 5 minutes
  
  // Animation Durations
  static const Duration fastAnimation = Duration(milliseconds: 150);
  static const Duration normalAnimation = Duration(milliseconds: 300);
  static const Duration slowAnimation = Duration(milliseconds: 500);
  static const Duration extraSlowAnimation = Duration(milliseconds: 800);
  
  // Specific animation durations
  static const Duration pageTransitionDuration = Duration(milliseconds: 300);
  static const Duration dialogAnimationDuration = Duration(milliseconds: 250);
  static const Duration bottomSheetDuration = Duration(milliseconds: 300);
  static const Duration fabAnimationDuration = Duration(milliseconds: 200);
  static const Duration rippleAnimationDuration = Duration(milliseconds: 150);
  static const Duration shimmerAnimationDuration = Duration(milliseconds: 1200);
  
  // Spacing Constants
  static const double spaceXXS = 2.0;
  static const double spaceXS = 4.0;
  static const double spaceSM = 8.0;
  static const double spaceMD = 16.0;
  static const double spaceLG = 24.0;
  static const double spaceXL = 32.0;
  static const double spaceXXL = 48.0;
  static const double spaceXXXL = 64.0;
  
  // Padding Constants
  static const EdgeInsets paddingXS = EdgeInsets.all(spaceXS);
  static const EdgeInsets paddingSM = EdgeInsets.all(spaceSM);
  static const EdgeInsets paddingMD = EdgeInsets.all(spaceMD);
  static const EdgeInsets paddingLG = EdgeInsets.all(spaceLG);
  static const EdgeInsets paddingXL = EdgeInsets.all(spaceXL);
  
  // Horizontal padding
  static const EdgeInsets paddingHorizontalSM = EdgeInsets.symmetric(horizontal: spaceSM);
  static const EdgeInsets paddingHorizontalMD = EdgeInsets.symmetric(horizontal: spaceMD);
  static const EdgeInsets paddingHorizontalLG = EdgeInsets.symmetric(horizontal: spaceLG);
  static const EdgeInsets paddingHorizontalXL = EdgeInsets.symmetric(horizontal: spaceXL);
  
  // Vertical padding
  static const EdgeInsets paddingVerticalSM = EdgeInsets.symmetric(vertical: spaceSM);
  static const EdgeInsets paddingVerticalMD = EdgeInsets.symmetric(vertical: spaceMD);
  static const EdgeInsets paddingVerticalLG = EdgeInsets.symmetric(vertical: spaceLG);
  static const EdgeInsets paddingVerticalXL = EdgeInsets.symmetric(vertical: spaceXL);

  // Border Radius Values
  static const double radiusXS = 4.0;
  static const double radiusSM = 8.0;
  static const double radiusMD = 12.0;
  static const double radiusLG = 16.0;
  static const double radiusXL = 20.0;
  static const double radiusXXL = 24.0;
  static const double radiusXXXL = 32.0;
  static const double radiusRound = 50.0;
  
  // Specific border radius
  static const double cardRadius = radiusLG;
  static const double buttonRadius = radiusMD;
  static const double inputRadius = radiusMD;
  static const double modalRadius = radiusXL;
  static const double bottomSheetRadius = radiusXL;
  
  // Elevation Values
  static const double elevationXS = 1.0;
  static const double elevationSM = 2.0;
  static const double elevationMD = 4.0;
  static const double elevationLG = 8.0;
  static const double elevationXL = 12.0;
  static const double elevationXXL = 16.0;
  
  // Icon Sizes
  static const double iconXS = 12.0;
  static const double iconSM = 16.0;
  static const double iconMD = 20.0;
  static const double iconLG = 24.0;
  static const double iconXL = 32.0;
  static const double iconXXL = 48.0;
  static const double iconXXXL = 64.0;
  
  // Typography Sizes
  static const double fontXS = 10.0;
  static const double fontSM = 12.0;
  static const double fontMD = 14.0;
  static const double fontLG = 16.0;
  static const double fontXL = 18.0;
  static const double fontXXL = 20.0;
  static const double fontXXXL = 24.0;
  static const double fontDisplay = 32.0;
  
  // Line Heights
  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.4;
  static const double lineHeightRelaxed = 1.6;
  static const double lineHeightLoose = 1.8;
  
  // Button Heights
  static const double buttonHeightSM = 32.0;
  static const double buttonHeightMD = 44.0;
  static const double buttonHeightLG = 52.0;
  static const double buttonHeightXL = 60.0;
  
  // Input Field Heights
  static const double inputHeightSM = 36.0;
  static const double inputHeightMD = 48.0;
  static const double inputHeightLG = 56.0;
  
  // Grid and Layout
  static const int gridColumns = 2;
  static const double gridSpacing = spaceMD;
  static const double listItemHeight = 72.0;
  static const double cardMinHeight = 120.0;
  
  // Glassmorphism Values
  static const double glassBlur = 20.0;
  static const double glassOpacity = 0.1;
  static const double glassBorderOpacity = 0.2;
  static const double glassElevation = 4.0;
  
  // Haptic Feedback Patterns
  static const Duration hapticFeedbackDelay = Duration(milliseconds: 50);
  
  // Animation Curves
  static const Curve defaultCurve = Curves.easeInOutCubic;
  static const Curve bounceCurve = Curves.elasticOut;
  static const Curve springCurve = Curves.bounceOut;
  static const Curve smoothCurve = Curves.easeInOut;
  
  // Breakpoints for Responsive Design
  static const double mobileBreakpoint = 480.0;
  static const double tabletBreakpoint = 768.0;
  static const double desktopBreakpoint = 1024.0;
  static const double largeDesktopBreakpoint = 1440.0;
  
  // Content Limits
  static const int maxUsernameLength = 30;
  static const int maxBioLength = 160;
  static const int maxJournalTitleLength = 100;
  static const int maxJournalContentLength = 5000;
  static const int maxCommentLength = 500;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache Keys
  static const String userCacheKey = 'user_data';
  static const String themeCacheKey = 'theme_mode';
  static const String onboardingCacheKey = 'onboarding_completed';
  static const String journalCacheKey = 'journal_entries';
  static const String challengesCacheKey = 'user_challenges';
  
  // Asset Paths
  static const String logoPath = 'assets/images/logo.png';
  static const String defaultAvatarPath = 'assets/images/default_avatar.png';
  static const String onboardingPath = 'assets/images/onboarding/';
  static const String iconsPath = 'assets/icons/';
  
  // Font Families
  static const String primaryFontFamily = 'Poppins';
  static const String secondaryFontFamily = 'Inter';
  static const String monoFontFamily = 'JetBrains Mono';
  
  // Regex Patterns
  static const String emailRegexPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String usernameRegexPattern = r'^[a-zA-Z0-9_]{3,30}$';
  static const String passwordRegexPattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$';
  
  // URLs
  static const String privacyPolicyUrl = 'https://nofap.dev/privacy';
  static const String termsOfServiceUrl = 'https://nofap.dev/terms';
  static const String supportUrl = 'https://nofap.dev/support';
  static const String communityGuidelinesUrl = 'https://nofap.dev/community-guidelines';
  
  // Social Media
  static const String twitterUrl = 'https://twitter.com/nofapdev';
  static const String instagramUrl = 'https://instagram.com/nofapdev';
  static const String discordUrl = 'https://discord.gg/nofapdev';
  
  // Support Contact
  static const String supportEmail = 'support@nofap.dev';
  static const String feedbackEmail = 'feedback@nofap.dev';
  static const String businessEmail = 'business@nofap.dev';
  
  // Feature Flags
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  static const bool enablePushNotifications = true;
  static const bool enableBiometricAuth = true;
  static const bool enableSocialFeatures = true;
  
  // Achievement Levels and Milestones
  static const Map<int, String> achievementMilestones = {
    1: 'First Day',
    3: 'Three Days Strong',
    7: 'One Week Warrior',
    14: 'Two Weeks Champion',
    21: 'Three Weeks Hero',
    30: 'One Month Master',
    60: 'Two Months Legend',
    90: 'Three Months Elite',
    180: 'Six Months Veteran',
    365: 'One Year Titan',
  };
  
  // Motivational Messages
  static const List<String> motivationalQuotes = [
    "Every moment is a fresh beginning.",
    "You are stronger than you think.",
    "Progress, not perfection.",
    "One day at a time.",
    "Your potential is endless.",
    "Believe in yourself and all that you are.",
    "The strongest people fight battles no one knows about.",
    "Today is the first day of your new life.",
  ];
  
  // App Store Information
  static const String appStoreId = '1234567890';
  static const String playStoreId = 'dev.nofap.app';
  static const String appStoreUrl = 'https://apps.apple.com/app/id$appStoreId';
  static const String playStoreUrl = 'https://play.google.com/store/apps/details?id=$playStoreId';
}

/// Helper class for responsive design
class ResponsiveBreakpoints {
  static bool isMobile(double width) => width < AppConstants.mobileBreakpoint;
  static bool isTablet(double width) => width >= AppConstants.mobileBreakpoint && width < AppConstants.tabletBreakpoint;
  static bool isDesktop(double width) => width >= AppConstants.tabletBreakpoint;
  static bool isLargeDesktop(double width) => width >= AppConstants.largeDesktopBreakpoint;
}