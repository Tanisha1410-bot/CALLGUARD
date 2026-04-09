import 'package:callguard/core/app_text_styles.dart';
import 'package:flutter/material.dart';

class PulsingBadge extends StatefulWidget {
  final String text;
  final Color bgColor;
  final Color textColor;

  const PulsingBadge({
    super.key,
    required this.text,
    required this.bgColor,
    required this.textColor,
  });

  @override
  State<PulsingBadge> createState() => _PulsingBadgeState();
}

class _PulsingBadgeState extends State<PulsingBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _scale = Tween<double>(begin: 0.96, end: 1.08).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: widget.bgColor,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              offset: const Offset(4, 4),
              blurRadius: 0,
              color: widget.bgColor.withValues(alpha: 0.65),
            ),
          ],
        ),
        child: Text(
          widget.text,
          style: AppTextStyles.badge(color: widget.textColor).copyWith(fontSize: 12),
        ),
      ),
    );
  }
}
