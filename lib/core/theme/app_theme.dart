import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import '../constants/app_constants.dart';

/// Comprehensive theme implementation with glassmorphism effects,
/// custom typography, and smooth animations
class AppTheme {
  AppTheme._();

  // Animation configurations
  static const Duration _transitionDuration = AppConstants.normalAnimation;

  /// Light theme configuration
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // Color scheme based on deep purple and vibrant cyan
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryPurple,
        primaryContainer: Color(0xFFE8E5FF),
        secondary: AppColors.secondaryCyan,
        secondaryContainer: Color(0xFFB8F5FF),
        tertiary: AppColors.accentGold,
        surface: AppColors.lightSurface,
        surfaceVariant: AppColors.lightSurfaceVariant,
        background: AppColors.lightBackground,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onTertiary: Colors.black87,
        onSurface: AppColors.textPrimary,
        onSurfaceVariant: AppColors.textSecondary,
        onBackground: AppColors.textPrimary,
        onError: Colors.white,
        outline: AppColors.borderLight,
        shadow: AppColors.shadowLight,
      ),

      // Typography with custom font families (Poppins/Inter)
      textTheme: _buildTextTheme(false),

      // AppBar theme with glassmorphism
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: AppColors.lightSurface.withOpacity(0.8),
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontXXL,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
        toolbarHeight: 64.0,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      ),

      // Card theme with glassmorphism effects
      cardTheme: CardThemeData(
        elevation: AppConstants.elevationMD,
        shadowColor: AppColors.shadowLight,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.cardRadius),
          side: BorderSide(
            color: AppColors.glassLight.withOpacity(0.3),
            width: 1,
          ),
        ),
        color: AppColors.lightSurface.withOpacity(0.9),
        margin: AppConstants.paddingMD,
      ),

      // Elevated button theme with gradients and haptic feedback
      elevatedButtonTheme: ElevatedButtonThemeData(
        style:
            ElevatedButton.styleFrom(
              elevation: AppConstants.elevationSM,
              shadowColor: AppColors.shadowMedium,
              surfaceTintColor: Colors.transparent,
              backgroundColor: AppColors.primaryPurple,
              foregroundColor: Colors.white,
              disabledBackgroundColor: AppColors.textTertiary,
              disabledForegroundColor: AppColors.textDisabled,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppConstants.buttonRadius),
              ),
              padding: AppConstants.paddingHorizontalLG.copyWith(
                top: AppConstants.spaceMD,
                bottom: AppConstants.spaceMD,
              ),
              minimumSize: const Size(0, AppConstants.buttonHeightMD),
              maximumSize: const Size(
                double.infinity,
                AppConstants.buttonHeightMD,
              ),
              textStyle: const TextStyle(
                fontFamily: AppConstants.primaryFontFamily,
                fontSize: AppConstants.fontLG,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
              ),
              animationDuration: _transitionDuration,
            ).copyWith(
              overlayColor: MaterialStateProperty.resolveWith<Color?>((states) {
                if (states.contains(MaterialState.pressed)) {
                  return Colors.white.withOpacity(0.1);
                }
                if (states.contains(MaterialState.hovered)) {
                  return Colors.white.withOpacity(0.05);
                }
                return null;
              }),
            ),
      ),

      // Outlined button theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.primaryPurple,
          disabledForegroundColor: AppColors.textTertiary,
          side: const BorderSide(color: AppColors.primaryPurple, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConstants.buttonRadius),
          ),
          padding: AppConstants.paddingHorizontalLG.copyWith(
            top: AppConstants.spaceMD,
            bottom: AppConstants.spaceMD,
          ),
          minimumSize: const Size(0, AppConstants.buttonHeightMD),
          textStyle: const TextStyle(
            fontFamily: AppConstants.primaryFontFamily,
            fontSize: AppConstants.fontLG,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
          animationDuration: _transitionDuration,
        ),
      ),

      // Text button theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          elevation: 0,
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.primaryPurple,
          disabledForegroundColor: AppColors.textTertiary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConstants.buttonRadius),
          ),
          padding: AppConstants.paddingHorizontalMD.copyWith(
            top: AppConstants.spaceSM,
            bottom: AppConstants.spaceSM,
          ),
          minimumSize: const Size(0, AppConstants.buttonHeightSM),
          textStyle: const TextStyle(
            fontFamily: AppConstants.primaryFontFamily,
            fontSize: AppConstants.fontMD,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
          animationDuration: _transitionDuration,
        ),
      ),

      // Input decoration theme with floating labels
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurface.withOpacity(0.8),
        contentPadding: AppConstants.paddingMD,

        // Floating label style
        floatingLabelStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.primaryPurple,
          letterSpacing: 0.2,
        ),

        // Label style
        labelStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontMD,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          letterSpacing: 0.2,
        ),

        // Hint style
        hintStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontMD,
          fontWeight: FontWeight.w400,
          color: AppColors.textTertiary,
          letterSpacing: 0.1,
        ),

        // Error style
        errorStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.error,
          letterSpacing: 0.1,
        ),

        // Border styles
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: BorderSide.none,
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(color: AppColors.borderLight, width: 1),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(
            color: AppColors.primaryPurple,
            width: 2,
          ),
        ),

        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),

        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),

        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(
            color: AppColors.borderLight,
            width: 0.5,
          ),
        ),
      ),

      // Bottom navigation bar theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        elevation: AppConstants.elevationMD,
        backgroundColor: Colors.transparent,
        selectedItemColor: AppColors.primaryPurple,
        unselectedItemColor: AppColors.textSecondary,
        selectedLabelStyle: TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
        ),
        type: BottomNavigationBarType.fixed,
        showSelectedLabels: true,
        showUnselectedLabels: true,
      ),

      // FloatingActionButton theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        elevation: AppConstants.elevationLG,
        backgroundColor: AppColors.primaryPurple,
        foregroundColor: Colors.white,
        splashColor: Colors.white24,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(AppConstants.radiusLG),
          ),
        ),
      ),

      // Dialog theme
      dialogTheme: DialogThemeData(
        elevation: AppConstants.elevationXL,
        backgroundColor: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        shadowColor: AppColors.shadowMedium,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.modalRadius),
        ),
        titleTextStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontXXL,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.3,
        ),
        contentTextStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontMD,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          height: AppConstants.lineHeightRelaxed,
        ),
      ),

      // Bottom sheet theme
      bottomSheetTheme: const BottomSheetThemeData(
        elevation: AppConstants.elevationXL,
        backgroundColor: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        shadowColor: AppColors.shadowMedium,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppConstants.bottomSheetRadius),
          ),
        ),
      ),

      // Icon theme
      iconTheme: const IconThemeData(
        color: AppColors.textSecondary,
        size: AppConstants.iconLG,
      ),

      // Primary icon theme
      primaryIconTheme: const IconThemeData(
        color: Colors.white,
        size: AppConstants.iconLG,
      ),

      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.lightSurfaceVariant,
        deleteIconColor: AppColors.textSecondary,
        disabledColor: AppColors.textDisabled,
        selectedColor: AppColors.primaryPurple.withOpacity(0.2),
        secondarySelectedColor: AppColors.secondaryCyan.withOpacity(0.2),
        shadowColor: AppColors.shadowLight,
        selectedShadowColor: AppColors.shadowMedium,
        labelStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        secondaryLabelStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        brightness: Brightness.light,
        elevation: AppConstants.elevationXS,
        pressElevation: AppConstants.elevationSM,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.radiusRound),
        ),
      ),

      // Divider theme
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
        space: AppConstants.spaceMD,
      ),

      // Switch theme
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.selected)) {
            return Colors.white;
          }
          return AppColors.textTertiary;
        }),
        trackColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.selected)) {
            return AppColors.primaryPurple;
          }
          return AppColors.borderMedium;
        }),
      ),

      // Slider theme
      sliderTheme: const SliderThemeData(
        activeTrackColor: AppColors.primaryPurple,
        inactiveTrackColor: AppColors.borderMedium,
        thumbColor: AppColors.primaryPurple,
        overlayColor: Color(0x1F6C5CE7),
        valueIndicatorColor: AppColors.primaryPurple,
        valueIndicatorTextStyle: TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),

      // Page transitions theme
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),

      // Visual density
      visualDensity: VisualDensity.adaptivePlatformDensity,

      // Material tap target size
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,

      // Splash factory
      splashFactory: InkRipple.splashFactory,
    );
  }

  /// Dark theme configuration with true black backgrounds
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,

      // Dark color scheme with true black backgrounds
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryPurple,
        primaryContainer: Color(0xFF4A4089),
        secondary: AppColors.secondaryCyan,
        secondaryContainer: Color(0xFF006B7A),
        tertiary: AppColors.accentGold,
        surface: AppColors.darkSurface,
        surfaceVariant: AppColors.darkSurfaceVariant,
        background: AppColors.darkBackground,
        error: AppColors.errorLight,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onTertiary: Colors.black87,
        onSurface: AppColors.textPrimaryDark,
        onSurfaceVariant: AppColors.textSecondaryDark,
        onBackground: AppColors.textPrimaryDark,
        onError: Colors.white,
        outline: AppColors.borderLightDark,
        shadow: AppColors.shadowDark,
      ),

      // Typography for dark theme
      textTheme: _buildTextTheme(true),

      // Dark AppBar theme
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: AppColors.darkSurface.withOpacity(0.8),
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.textPrimaryDark,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontXXL,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimaryDark,
          letterSpacing: -0.5,
        ),
        toolbarHeight: 64.0,
      ),

      // Dark card theme
      cardTheme: CardThemeData(
        elevation: AppConstants.elevationMD,
        shadowColor: AppColors.shadowDark,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.cardRadius),
          side: BorderSide(
            color: AppColors.glassDark.withOpacity(0.3),
            width: 1,
          ),
        ),
        color: AppColors.darkSurface.withOpacity(0.9),
        margin: AppConstants.paddingMD,
      ),

      // Dark input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface.withOpacity(0.8),
        contentPadding: AppConstants.paddingMD,

        floatingLabelStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.primaryPurple,
          letterSpacing: 0.2,
        ),

        labelStyle: const TextStyle(
          fontFamily: AppConstants.primaryFontFamily,
          fontSize: AppConstants.fontMD,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondaryDark,
          letterSpacing: 0.2,
        ),

        hintStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontMD,
          fontWeight: FontWeight.w400,
          color: AppColors.textTertiaryDark,
          letterSpacing: 0.1,
        ),

        errorStyle: const TextStyle(
          fontFamily: AppConstants.secondaryFontFamily,
          fontSize: AppConstants.fontSM,
          fontWeight: FontWeight.w500,
          color: AppColors.errorLight,
          letterSpacing: 0.1,
        ),

        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: BorderSide.none,
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(
            color: AppColors.borderLightDark,
            width: 1,
          ),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(
            color: AppColors.primaryPurple,
            width: 2,
          ),
        ),

        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(color: AppColors.errorLight, width: 1),
        ),

        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.inputRadius),
          borderSide: const BorderSide(color: AppColors.errorLight, width: 2),
        ),
      ),

      // Apply same configuration as light theme but with dark colors
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: AppConstants.elevationSM,
          shadowColor: AppColors.shadowMediumDark,
          surfaceTintColor: Colors.transparent,
          backgroundColor: AppColors.primaryPurple,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.textTertiaryDark,
          disabledForegroundColor: AppColors.textDisabledDark,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConstants.buttonRadius),
          ),
          padding: AppConstants.paddingHorizontalLG.copyWith(
            top: AppConstants.spaceMD,
            bottom: AppConstants.spaceMD,
          ),
          minimumSize: const Size(0, AppConstants.buttonHeightMD),
          maximumSize: const Size(double.infinity, AppConstants.buttonHeightMD),
          textStyle: const TextStyle(
            fontFamily: AppConstants.primaryFontFamily,
            fontSize: AppConstants.fontLG,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
          animationDuration: _transitionDuration,
        ),
      ),

      // Continue with other theme components...
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        elevation: AppConstants.elevationMD,
        backgroundColor: Colors.transparent,
        selectedItemColor: AppColors.primaryPurple,
        unselectedItemColor: AppColors.textSecondaryDark,
        type: BottomNavigationBarType.fixed,
      ),

      dialogTheme: DialogThemeData(
        elevation: AppConstants.elevationXL,
        backgroundColor: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        shadowColor: AppColors.shadowMediumDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.modalRadius),
        ),
      ),

      bottomSheetTheme: const BottomSheetThemeData(
        elevation: AppConstants.elevationXL,
        backgroundColor: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        shadowColor: AppColors.shadowMediumDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppConstants.bottomSheetRadius),
          ),
        ),
      ),

      iconTheme: const IconThemeData(
        color: AppColors.textSecondaryDark,
        size: AppConstants.iconLG,
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.borderLightDark,
        thickness: 1,
        space: AppConstants.spaceMD,
      ),

      visualDensity: VisualDensity.adaptivePlatformDensity,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      splashFactory: InkRipple.splashFactory,
    );
  }

  /// Build text theme with custom font families
  static TextTheme _buildTextTheme(bool isDark) {
    final Color primaryTextColor = isDark
        ? AppColors.textPrimaryDark
        : AppColors.textPrimary;
    final Color secondaryTextColor = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondary;

    return TextTheme(
      // Display styles
      displayLarge: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: 57,
        fontWeight: FontWeight.w700,
        height: AppConstants.lineHeightTight,
        letterSpacing: -1.5,
        color: primaryTextColor,
      ),

      displayMedium: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: 45,
        fontWeight: FontWeight.w700,
        height: AppConstants.lineHeightTight,
        letterSpacing: -1.2,
        color: primaryTextColor,
      ),

      displaySmall: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: 36,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightTight,
        letterSpacing: -1.0,
        color: primaryTextColor,
      ),

      // Headline styles
      headlineLarge: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontDisplay,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightTight,
        letterSpacing: -0.8,
        color: primaryTextColor,
      ),

      headlineMedium: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: 28,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightNormal,
        letterSpacing: -0.5,
        color: primaryTextColor,
      ),

      headlineSmall: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontXXXL,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightNormal,
        letterSpacing: -0.3,
        color: primaryTextColor,
      ),

      // Title styles
      titleLarge: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontXXL,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.0,
        color: primaryTextColor,
      ),

      titleMedium: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontXL,
        fontWeight: FontWeight.w500,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.1,
        color: primaryTextColor,
      ),

      titleSmall: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontLG,
        fontWeight: FontWeight.w500,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.1,
        color: secondaryTextColor,
      ),

      // Body styles
      bodyLarge: TextStyle(
        fontFamily: AppConstants.secondaryFontFamily,
        fontSize: AppConstants.fontLG,
        fontWeight: FontWeight.w400,
        height: AppConstants.lineHeightRelaxed,
        letterSpacing: 0.2,
        color: primaryTextColor,
      ),

      bodyMedium: TextStyle(
        fontFamily: AppConstants.secondaryFontFamily,
        fontSize: AppConstants.fontMD,
        fontWeight: FontWeight.w400,
        height: AppConstants.lineHeightRelaxed,
        letterSpacing: 0.2,
        color: primaryTextColor,
      ),

      bodySmall: TextStyle(
        fontFamily: AppConstants.secondaryFontFamily,
        fontSize: AppConstants.fontSM,
        fontWeight: FontWeight.w400,
        height: AppConstants.lineHeightRelaxed,
        letterSpacing: 0.3,
        color: secondaryTextColor,
      ),

      // Label styles
      labelLarge: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontMD,
        fontWeight: FontWeight.w600,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.4,
        color: primaryTextColor,
      ),

      labelMedium: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontSM,
        fontWeight: FontWeight.w500,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.4,
        color: secondaryTextColor,
      ),

      labelSmall: TextStyle(
        fontFamily: AppConstants.primaryFontFamily,
        fontSize: AppConstants.fontXS,
        fontWeight: FontWeight.w500,
        height: AppConstants.lineHeightNormal,
        letterSpacing: 0.5,
        color: secondaryTextColor,
      ),
    );
  }

  /// Get theme based on brightness
  static ThemeData getTheme(bool isDark) {
    return isDark ? darkTheme : lightTheme;
  }

  /// Create glassmorphism container decoration
  static BoxDecoration glassmorphism({
    bool isDark = false,
    double borderRadius = AppConstants.radiusLG,
    double blur = AppConstants.glassBlur,
    double opacity = AppConstants.glassOpacity,
  }) {
    return BoxDecoration(
      color: isDark
          ? AppColors.glassDark.withOpacity(opacity)
          : AppColors.glassLight.withOpacity(opacity),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: isDark
            ? AppColors.glassMediumDark.withOpacity(
                AppConstants.glassBorderOpacity,
              )
            : AppColors.glassMedium.withOpacity(
                AppConstants.glassBorderOpacity,
              ),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: isDark
              ? AppColors.shadowDark.withOpacity(0.1)
              : AppColors.shadowLight.withOpacity(0.1),
          blurRadius: blur,
          spreadRadius: 1,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  /// Create gradient button decoration
  static BoxDecoration gradientButton({
    Gradient? gradient,
    double borderRadius = AppConstants.buttonRadius,
  }) {
    return BoxDecoration(
      gradient: gradient ?? AppColors.ctaPrimaryGradient,
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: [
        BoxShadow(
          color: AppColors.shadowMedium.withOpacity(0.3),
          blurRadius: 8,
          spreadRadius: 0,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  /// Create card shadow decoration
  static BoxDecoration cardShadow({
    bool isDark = false,
    double borderRadius = AppConstants.cardRadius,
    double elevation = AppConstants.elevationMD,
  }) {
    return BoxDecoration(
      color: isDark ? AppColors.darkCard : AppColors.lightCard,
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: [
        BoxShadow(
          color: isDark
              ? AppColors.shadowDark.withOpacity(0.2)
              : AppColors.shadowLight.withOpacity(0.1),
          blurRadius: elevation * 2,
          spreadRadius: elevation / 4,
          offset: Offset(0, elevation),
        ),
      ],
    );
  }
}
