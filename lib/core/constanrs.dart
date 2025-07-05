import 'package:no_fap/data/models/badge_config.dart' show BadgeConfig;

class AppConstants {
  static const double badgeImageSize = 150;
  static const double avatarSize = 60;
  static const double avatarSmallSize = 60;
  static const double progressCircleSize = 200;
  static const double progressStrokeWidth = 5.0;

  static const List<BadgeConfig> badges = [
    BadgeConfig(title: "عيان", days: 0, imagePath: "assets/images/loser.png"),
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
