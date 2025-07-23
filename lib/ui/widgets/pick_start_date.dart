import 'package:flutter/material.dart';

class PickStartDate extends StatefulWidget {
  final Function(DateTime?) onPickedDate;

  const PickStartDate({super.key, required this.onPickedDate});

  @override
  State<PickStartDate> createState() => _PickStartDateState();
}

class _PickStartDateState extends State<PickStartDate> {
  final _formKey = GlobalKey<FormState>();
  DateTime? selectedDate;

  Future<void> _selectDate() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (pickedDate != null) widget.onPickedDate(pickedDate);
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 20,
          children: <Widget>[
            OutlinedButton(
              onPressed: _selectDate,
              child: const Text("Choose your start date"),
            ),
          ],
        ),
      ),
    );
  }
}
