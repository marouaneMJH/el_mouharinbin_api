import 'package:flutter/material.dart' hide Badge;
import 'package:no_fap/core/constanrs.dart';
import 'package:no_fap/data/models/badge.dart';

import 'package:no_fap/data/models/history_record.dart';
import 'package:no_fap/ui/widgets/circular_image.dart';

class HistoryCard extends StatelessWidget {
  final HistoryRecord record;

  const HistoryCard({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4.0,
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${record.strick} Days',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                _buildBadgeIcon(record.badge),
              ],
            ),
            const SizedBox(height: 12.0),
            _buildDateRow('Started', record.startDate),
            _buildDateRow('Ended', record.lastDate),
            const Divider(height: 24.0),
            Text('Reason:', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4.0),
            Text(record.reason, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }

  Widget _buildBadgeIcon(Badge badge) {
    return CircularImage(
      imagePath: badge.getImagePath,
      size: AppConstants.avatarSmallSize,
    );
  }

  Widget _buildDateRow(String label, DateTime date) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w500)),
          Text('${date.day}/${date.month}/${date.year}'),
        ],
      ),
    );
  }
}
