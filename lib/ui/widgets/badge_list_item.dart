import 'package:flutter/material.dart';
import 'package:no_fap/core/constanrs.dart' show AppConstants;
import 'package:no_fap/ui/widgets/circular_image.dart' show CircularImage;

class BadgeListItem extends StatelessWidget {
  final String title;
  final int days;
  final String imagePath;

  const BadgeListItem({
    super.key,
    required this.title,
    required this.days,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircularImage(
          imagePath: imagePath,
          size: AppConstants.avatarSize,
          borderWidth: 0,
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '$days+ Days',
              style: const TextStyle(fontSize: 14, color: Colors.white70),
            ),
          ],
        ),
      ],
    );
  }
}
