import 'package:flutter/material.dart';

class ResetButton extends StatelessWidget {
  final VoidCallback onReset;

  const ResetButton({super.key, required this.onReset});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60,
      width: 60,
      child: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Reset Progress'),
              content: const Text(
                'Are you sure you want to reset your progress?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    onReset();
                    Navigator.pop(context);
                  },
                  child: const Text('Reset'),
                ),
              ],
            ),
          );
        },
        backgroundColor: Colors.transparent,
        elevation: 4.0,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            image: const DecorationImage(
              image: AssetImage("assets/images/loser.png"),
              fit: BoxFit.cover,
            ),
          ),
        ),
      ),
    );
  }
}
