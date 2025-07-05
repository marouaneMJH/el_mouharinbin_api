import 'package:flutter/material.dart';
import 'package:no_fap/core/navigation/page_definition.dart';

class ScreenDefinition {
  final List<PageDefinition> pages;
  final Widget screen;

  const ScreenDefinition({required this.screen, required this.pages});
}
