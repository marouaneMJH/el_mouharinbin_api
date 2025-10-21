import 'package:flutter/material.dart';

/// App color constants and color scheme definitions
class AppColors {
  // Private constructor to prevent instantiation
  AppColors._();

  // Brand Colors - Primary: Deep Purple, Secondary: Vibrant Cyan
  static const Color primaryPurple = Color(0xFF6C5CE7);
  static const Color primaryPurpleLight = Color(0xFF8B7FE8);
  static const Color primaryPurpleDark = Color(0xFF5A4FCF);

  static const Color secondaryCyan = Color(0xFF00B4D8);
  static const Color secondaryCyanLight = Color(0xFF33C4E0);
  static const Color secondaryCyanDark = Color(0xFF009FBF);

  // Accent colors for highlights and special elements
  static const Color accentGold = Color(0xFFFDCB6E);
  static const Color accentPink = Color(0xFFE84393);
  static const Color accentMint = Color(0xFF00D2D3);

  // Semantic Colors
  static const Color success = Color(0xFF2ECC71);
  static const Color successLight = Color(0xFF58D68D);
  static const Color successDark = Color(0xFF27AE60);

  static const Color warning = Color(0xFFF39C12);
  static const Color warningLight = Color(0xFFF5B041);
  static const Color warningDark = Color(0xFFE67E22);

  static const Color error = Color(0xFFE74C3C);
  static const Color errorLight = Color(0xFFEC7063);
  static const Color errorDark = Color(0xFFC0392B);

  static const Color info = Color(0xFF3498DB);
  static const Color infoLight = Color(0xFF5DADE2);
  static const Color infoDark = Color(0xFF2980B9);

  // Light Theme Colors
  static const Color lightBackground = Color(0xFFFAFBFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceVariant = Color(0xFFF8F9FA);
  static const Color lightCard = Color(0xFFFFFFFF);

  // Dark Theme Colors - True Black Implementation
  static const Color darkBackground = Color(0xFF000000);
  static const Color darkBackgroundVariant = Color(0xFF0A0A0A);
  static const Color darkSurface = Color(0xFF121212);
  static const Color darkSurfaceVariant = Color(0xFF1E1E1E);
  static const Color darkCard = Color(0xFF1C1C1C);

  // Neutral Colors for Text and Borders
  static const Color textPrimary = Color(0xFF2C3E50);
  static const Color textSecondary = Color(0xFF7F8C8D);
  static const Color textTertiary = Color(0xFFBDC3C7);
  static const Color textDisabled = Color(0xFFECF0F1);

  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFFB0BEC5);
  static const Color textTertiaryDark = Color(0xFF78909C);
  static const Color textDisabledDark = Color(0xFF455A64);

  // Border Colors
  static const Color borderLight = Color(0xFFE5E7EB);
  static const Color borderMedium = Color(0xFFD1D5DB);
  static const Color borderDark = Color(0xFF9CA3AF);

  static const Color borderLightDark = Color(0xFF374151);
  static const Color borderMediumDark = Color(0xFF4B5563);
  static const Color borderDarkDark = Color(0xFF6B7280);

  // Glassmorphism Colors
  static const Color glassLight = Color(0x1AFFFFFF);
  static const Color glassMedium = Color(0x33FFFFFF);
  static const Color glassHeavy = Color(0x4DFFFFFF);

  static const Color glassDark = Color(0x1A000000);
  static const Color glassMediumDark = Color(0x33000000);
  static const Color glassHeavyDark = Color(0x4D000000);

  // Shadow Colors
  static const Color shadowLight = Color(0x0A000000);
  static const Color shadowMedium = Color(0x1A000000);
  static const Color shadowHeavy = Color(0x33000000);

  static const Color shadowDark = Color(0x1AFFFFFF);
  static const Color shadowMediumDark = Color(0x33FFFFFF);
  static const Color shadowHeavyDark = Color(0x4DFFFFFF);

  /// Gradient Definitions
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryPurple, primaryPurpleLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondaryCyan, secondaryCyanLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [accentGold, accentPink],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [success, successLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warningGradient = LinearGradient(
    colors: [warning, warningLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient errorGradient = LinearGradient(
    colors: [error, errorLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Background gradients
  static const LinearGradient lightBackgroundGradient = LinearGradient(
    colors: [lightBackground, lightSurfaceVariant],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient darkBackgroundGradient = LinearGradient(
    colors: [darkBackground, darkBackgroundVariant],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Glassmorphism gradients
  static const LinearGradient glassGradientLight = LinearGradient(
    colors: [glassLight, glassMedium],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient glassGradientDark = LinearGradient(
    colors: [glassDark, glassMediumDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // CTA (Call-to-Action) gradients
  static const LinearGradient ctaPrimaryGradient = LinearGradient(
    colors: [primaryPurple, secondaryCyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient ctaSecondaryGradient = LinearGradient(
    colors: [accentMint, secondaryCyanLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const RadialGradient ctaRadialGradient = RadialGradient(
    colors: [primaryPurpleLight, primaryPurple, primaryPurpleDark],
    stops: [0.0, 0.7, 1.0],
  );

  // Shimmer gradient for loading effects
  static const LinearGradient shimmerGradient = LinearGradient(
    colors: [Color(0xFFEBEBF4), Color(0xFFF4F4F4), Color(0xFFEBEBF4)],
    stops: [0.1, 0.3, 0.4],
    begin: Alignment(-1.0, -0.3),
    end: Alignment(1.0, 0.3),
    tileMode: TileMode.clamp,
  );

  static const LinearGradient shimmerGradientDark = LinearGradient(
    colors: [Color(0xFF2A2A2A), Color(0xFF3A3A3A), Color(0xFF2A2A2A)],
    stops: [0.1, 0.3, 0.4],
    begin: Alignment(-1.0, -0.3),
    end: Alignment(1.0, 0.3),
    tileMode: TileMode.clamp,
  );

  /// Helper methods for color manipulation
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }

  static Color lighten(Color color, [double amount = 0.1]) {
    final hsl = HSLColor.fromColor(color);
    final lightness = (hsl.lightness + amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }

  static Color darken(Color color, [double amount = 0.1]) {
    final hsl = HSLColor.fromColor(color);
    final lightness = (hsl.lightness - amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }

  static bool isDark(Color color) {
    return color.computeLuminance() < 0.5;
  }

  static Color getContrastingColor(Color color) {
    return isDark(color) ? Colors.white : Colors.black;
  }
}
