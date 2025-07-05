import 'package:flutter/material.dart';

class PageDefinition {
  final String title;
  final int index;
  final Widget page;

  const PageDefinition({
    required this.title,
    required this.index,
    required this.page,
  });
}
