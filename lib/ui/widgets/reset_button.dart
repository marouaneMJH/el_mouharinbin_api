import 'package:flutter/material.dart';

class ResetButton extends StatelessWidget {
  final void Function(String reason) onReset;

  const ResetButton({super.key, required this.onReset});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60,
      width: 60,
      child: FloatingActionButton(
        onPressed: () {
          final TextEditingController reasonController =
              TextEditingController();

          showDialog(
            context: context,
            builder: (context) => StatefulBuilder(
              builder: (context, setState) {
                return AlertDialog(
                  title: const Text('Become a clown again?'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Reason:'),
                      const SizedBox(height: 8),
                      TextField(
                        controller: reasonController,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          hintText: 'Enter reason...',
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        final reason = reasonController.text.trim();
                        if (reason.isNotEmpty) {
                          onReset(reason);
                          Navigator.pop(context);
                        }
                      },
                      child: const Text('Reset'),
                    ),
                  ],
                );
              },
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
