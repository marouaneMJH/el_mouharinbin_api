import 'package:flutter/material.dart';

class CircularImage extends StatelessWidget {
  final String imagePath;
  final double size;
  final double borderWidth;

  const CircularImage({
    super.key,
    required this.imagePath,
    required this.size,
    this.borderWidth = 4,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        image: DecorationImage(image: AssetImage(imagePath), fit: BoxFit.cover),
        border: Border.all(color: Colors.black, width: borderWidth),
      ),
    );
  }
}
