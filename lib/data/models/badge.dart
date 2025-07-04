class Badge {
  final String title;
  final String imagePath;
  final int days;
  final DateTime startDate;

  Badge({
    required this.title,
    required this.imagePath,
    required this.days,
    required this.startDate,
  });

  String get getTitle => title;
  String get getImagePath => imagePath;
  int get getDays => days;
  DateTime get getStartDate => startDate;
}
