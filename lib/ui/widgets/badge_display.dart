import 'package:flutter/material.dart' hide Badge;
import 'package:no_fap/core/constanrs.dart' show AppConstants;
import 'package:no_fap/ui/widgets/badge_title_box.dart';
import 'package:no_fap/ui/widgets/circular_image.dart';
import 'package:no_fap/data/models/badge.dart';

class BadgeDisplay extends StatelessWidget {
  final Badge badge;

  const BadgeDisplay({super.key, required this.badge});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 110),
          child: BadgeTitleBox(title: badge.title),
        ),
        Positioned(
          top: 0,
          child: CircularImage(
            imagePath: badge.imagePath,
            size: AppConstants.badgeImageSize,
          ),
        ),
      ],
    );
  }
}
