import 'package:callguard/core/app_text_styles.dart';
import 'package:flutter/material.dart';

class ThreeDButton extends StatefulWidget {
  final String label;
  final Color bgColor;
  final Color shadowColor;
  final VoidCallback onPressed;
  final double? width;
  final IconData? icon;

  const ThreeDButton({
    super.key,
    required this.label,
    required this.bgColor,
    required this.shadowColor,
    required this.onPressed,
    this.width,
    this.icon,
  });

  @override
  State<ThreeDButton> createState() => _ThreeDButtonState();
}

class _ThreeDButtonState extends State<ThreeDButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final Offset shadowOffset = _pressed ? const Offset(2, 2) : const Offset(4, 4);
    final Offset translateOffset = _pressed ? const Offset(2, 2) : Offset.zero;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapCancel: () => setState(() => _pressed = false),
      onTapUp: (_) => setState(() => _pressed = false),
      onTap: widget.onPressed,
      child: Transform.translate(
        offset: translateOffset,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          height: 56,
          width: widget.width,
          decoration: BoxDecoration(
            color: widget.bgColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                offset: shadowOffset,
                blurRadius: 0,
                color: widget.shadowColor,
              ),
            ],
          ),
          alignment: Alignment.center,
          child: widget.icon == null
              ? Text(
                  widget.label,
                  style: AppTextStyles.body(color: Colors.white).copyWith(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(widget.icon, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      widget.label,
                      style: AppTextStyles.body(color: Colors.white).copyWith(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
