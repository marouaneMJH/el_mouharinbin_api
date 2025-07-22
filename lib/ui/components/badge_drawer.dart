import 'package:flutter/material.dart';
import 'package:no_fap/core/constanrs.dart';
import 'package:no_fap/ui/widgets/badge_list_item.dart';

class BadgesDrawer extends StatelessWidget {
  const BadgesDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Drawer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'All Badges',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: AppConstants.badges.length,
                itemBuilder: (context, index) {
                  final badge = AppConstants.badges[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: 8.0,
                      horizontal: 16.0,
                    ),
                    child: BadgeListItem(
                      title: badge.title,
                      days: badge.days,
                      imagePath: badge.imagePath,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
