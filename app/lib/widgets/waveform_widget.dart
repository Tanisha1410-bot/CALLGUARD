import 'package:callguard/core/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class WaveformWidget extends StatelessWidget {
  const WaveformWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: const [
        _WaveBar(delayMs: 0),
        SizedBox(width: 10),
        _WaveBar(delayMs: 200),
        SizedBox(width: 10),
        _WaveBar(delayMs: 400),
      ],
    );
  }
}

class _WaveBar extends StatelessWidget {
  final int delayMs;

  const _WaveBar({required this.delayMs});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 6,
      height: 20,
      decoration: BoxDecoration(
        color: AppColors.raised,
        borderRadius: BorderRadius.circular(3),
      ),
    )
        .animate(
          onPlay: (controller) => controller.repeat(),
          delay: Duration(milliseconds: delayMs),
        )
        .scaleY(
          begin: 0.4,
          end: 1.0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          alignment: Alignment.bottomCenter,
        )
        .then()
        .scaleY(
          begin: 1.0,
          end: 0.4,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          alignment: Alignment.bottomCenter,
        );
  }
}
