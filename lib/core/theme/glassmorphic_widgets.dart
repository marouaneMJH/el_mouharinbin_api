import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../constants/app_constants.dart';

/// A widget that creates a glassmorphism effect with blur and transparency
class GlassmorphicContainer extends StatelessWidget {
  const GlassmorphicContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.borderRadius = AppConstants.radiusLG,
    this.blur = AppConstants.glassBlur,
    this.opacity = AppConstants.glassOpacity,
    this.border,
    this.gradient,
    this.padding,
    this.margin,
    this.alignment,
    this.clipBehavior = Clip.antiAlias,
  });

  final Widget child;
  final double? width;
  final double? height;
  final double borderRadius;
  final double blur;
  final double opacity;
  final Border? border;
  final Gradient? gradient;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final AlignmentGeometry? alignment;
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: width,
      height: height,
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        clipBehavior: clipBehavior,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            width: width,
            height: height,
            alignment: alignment,
            padding: padding ?? AppConstants.paddingMD,
            decoration: BoxDecoration(
              gradient: gradient ?? _getDefaultGradient(isDark),
              borderRadius: BorderRadius.circular(borderRadius),
              border: border ?? _getDefaultBorder(isDark),
            ),
            child: child,
          ),
        ),
      ),
    );
  }

  Gradient _getDefaultGradient(bool isDark) {
    if (isDark) {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          AppColors.glassDark.withOpacity(opacity),
          AppColors.glassMediumDark.withOpacity(opacity * 0.8),
        ],
      );
    } else {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          AppColors.glassLight.withOpacity(opacity),
          AppColors.glassMedium.withOpacity(opacity * 0.8),
        ],
      );
    }
  }

  Border _getDefaultBorder(bool isDark) {
    return Border.all(
      color: isDark
          ? AppColors.glassMediumDark.withOpacity(
              AppConstants.glassBorderOpacity,
            )
          : AppColors.glassMedium.withOpacity(AppConstants.glassBorderOpacity),
      width: 1,
    );
  }
}

/// A glassmorphic app bar with blur effect
class GlassmorphicAppBar extends StatelessWidget
    implements PreferredSizeWidget {
  const GlassmorphicAppBar({
    super.key,
    this.title,
    this.leading,
    this.actions,
    this.backgroundColor,
    this.elevation = 0,
    this.toolbarHeight = kToolbarHeight,
    this.blur = AppConstants.glassBlur,
    this.opacity = AppConstants.glassOpacity,
  });

  final Widget? title;
  final Widget? leading;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final double elevation;
  final double toolbarHeight;
  final double blur;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: AppBar(
          title: title,
          leading: leading,
          actions: actions,
          elevation: elevation,
          scrolledUnderElevation: 0,
          backgroundColor:
              backgroundColor ??
              (isDark
                  ? AppColors.darkSurface.withOpacity(opacity)
                  : AppColors.lightSurface.withOpacity(opacity)),
          surfaceTintColor: Colors.transparent,
          toolbarHeight: toolbarHeight,
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(toolbarHeight);
}

/// A glassmorphic bottom navigation bar
class GlassmorphicBottomNavBar extends StatelessWidget {
  const GlassmorphicBottomNavBar({
    super.key,
    required this.items,
    this.currentIndex = 0,
    this.onTap,
    this.backgroundColor,
    this.selectedItemColor,
    this.unselectedItemColor,
    this.blur = AppConstants.glassBlur,
    this.opacity = AppConstants.glassOpacity,
    this.height = 80.0,
  });

  final List<BottomNavigationBarItem> items;
  final int currentIndex;
  final ValueChanged<int>? onTap;
  final Color? backgroundColor;
  final Color? selectedItemColor;
  final Color? unselectedItemColor;
  final double blur;
  final double opacity;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          height: height,
          decoration: BoxDecoration(
            color:
                backgroundColor ??
                (isDark
                    ? AppColors.darkSurface.withOpacity(opacity)
                    : AppColors.lightSurface.withOpacity(opacity)),
            border: Border(
              top: BorderSide(
                color: isDark
                    ? AppColors.borderLightDark.withOpacity(0.3)
                    : AppColors.borderLight.withOpacity(0.3),
                width: 1,
              ),
            ),
          ),
          child: BottomNavigationBar(
            items: items,
            currentIndex: currentIndex,
            onTap: onTap,
            backgroundColor: Colors.transparent,
            elevation: 0,
            selectedItemColor: selectedItemColor ?? AppColors.primaryPurple,
            unselectedItemColor:
                unselectedItemColor ??
                (isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondary),
            type: BottomNavigationBarType.fixed,
            showSelectedLabels: true,
            showUnselectedLabels: true,
          ),
        ),
      ),
    );
  }
}

/// A glassmorphic card widget
class GlassmorphicCard extends StatelessWidget {
  const GlassmorphicCard({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius = AppConstants.cardRadius,
    this.blur = AppConstants.glassBlur,
    this.opacity = AppConstants.glassOpacity,
    this.onTap,
    this.gradient,
  });

  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final double blur;
  final double opacity;
  final VoidCallback? onTap;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    final card = GlassmorphicContainer(
      width: width,
      height: height,
      borderRadius: borderRadius,
      blur: blur,
      opacity: opacity,
      padding: padding ?? AppConstants.paddingLG,
      margin: margin,
      gradient: gradient,
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: card,
      );
    }

    return card;
  }
}

/// A glassmorphic floating action button
class GlassmorphicFAB extends StatelessWidget {
  const GlassmorphicFAB({
    super.key,
    required this.onPressed,
    required this.child,
    this.backgroundColor,
    this.foregroundColor,
    this.elevation = AppConstants.elevationLG,
    this.blur = AppConstants.glassBlur,
    this.opacity = 0.2,
    this.size = 56.0,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double elevation;
  final double blur;
  final double opacity;
  final double size;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      width: size,
      height: size,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: FloatingActionButton(
            onPressed: onPressed,
            backgroundColor:
                backgroundColor ??
                (isDark
                    ? AppColors.darkSurface.withOpacity(opacity)
                    : AppColors.lightSurface.withOpacity(opacity)),
            foregroundColor: foregroundColor ?? AppColors.primaryPurple,
            elevation: elevation,
            child: child,
          ),
        ),
      ),
    );
  }
}

/// A glassmorphic dialog
class GlassmorphicDialog extends StatelessWidget {
  const GlassmorphicDialog({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.borderRadius = AppConstants.modalRadius,
    this.blur = AppConstants.glassBlur,
    this.opacity = 0.15,
  });

  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final double blur;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: GlassmorphicContainer(
        width: width,
        height: height,
        borderRadius: borderRadius,
        blur: blur,
        opacity: opacity,
        padding: padding ?? AppConstants.paddingXL,
        child: child,
      ),
    );
  }
}

/// Helper functions for creating glassmorphic effects
class GlassmorphicHelpers {
  GlassmorphicHelpers._();

  /// Create a glassmorphic decoration
  static BoxDecoration decoration({
    bool isDark = false,
    double borderRadius = AppConstants.radiusLG,
    double opacity = AppConstants.glassOpacity,
    Gradient? gradient,
    Border? border,
  }) {
    return BoxDecoration(
      gradient:
          gradient ??
          (isDark ? AppColors.glassGradientDark : AppColors.glassGradientLight),
      borderRadius: BorderRadius.circular(borderRadius),
      border:
          border ??
          Border.all(
            color: isDark
                ? AppColors.glassMediumDark.withOpacity(
                    AppConstants.glassBorderOpacity,
                  )
                : AppColors.glassMedium.withOpacity(
                    AppConstants.glassBorderOpacity,
                  ),
            width: 1,
          ),
    );
  }

  /// Create a glassmorphic shadow
  static List<BoxShadow> shadows({
    bool isDark = false,
    double blur = 20.0,
    double spread = 0.0,
    Offset offset = const Offset(0, 8),
  }) {
    return [
      BoxShadow(
        color: isDark
            ? AppColors.shadowDark.withOpacity(0.1)
            : AppColors.shadowMedium.withOpacity(0.15),
        blurRadius: blur,
        spreadRadius: spread,
        offset: offset,
      ),
    ];
  }

  /// Create a backdrop filter with blur
  static Widget backdropFilter({
    required Widget child,
    double blur = AppConstants.glassBlur,
  }) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
      child: child,
    );
  }
}
