import 'package:flutter/material.dart';

class BadgeTitleBox extends StatelessWidget {
  final String title;
  final String subtitle;

  const BadgeTitleBox({
    super.key,
    required this.title,
    this.subtitle = "Current Badge",
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      height: 140,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 29, color: Colors.black),
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 12, color: Colors.black),
          ),
        ],
      ),
    );
  }
}
