import 'dart:async';

import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/widgets/risk_bottom_sheet.dart';
import 'package:callguard/widgets/waveform_widget.dart';
import 'package:flutter/material.dart';

class CallActiveScreen extends StatefulWidget {
  const CallActiveScreen({super.key});

  @override
  State<CallActiveScreen> createState() => _CallActiveScreenState();
}

class _CallActiveScreenState extends State<CallActiveScreen>
    with TickerProviderStateMixin {
  Timer? _timer;
  int _elapsedSeconds = 0;
  bool _sheetShown = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
    Future<void>.delayed(const Duration(seconds: 3), _showRiskSheetIfNeeded);
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _elapsedSeconds++;
      });
    });
  }

  String _formattedTime() {
    final int minutes = _elapsedSeconds ~/ 60;
    final int seconds = _elapsedSeconds % 60;
    final String mm = minutes.toString().padLeft(2, '0');
    final String ss = seconds.toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  Future<void> _showRiskSheetIfNeeded() async {
    if (!mounted || _sheetShown) return;
    _sheetShown = true;
    final AnimationController animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
      reverseDuration: const Duration(milliseconds: 250),
    );

    await showModalBottomSheet<void>(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      transitionAnimationController: animationController,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => FractionallySizedBox(
        heightFactor: 0.55,
        child: RiskBottomSheet(
          onActionComplete: () {
            Navigator.pop(context);
          },
        ),
      ),
    );
    animationController.dispose();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(height: 60),
              Text(
                'Call Connected',
                style: AppTextStyles.heading(color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                _formattedTime(),
                style: AppTextStyles.display(color: AppColors.raised),
              ),
              const SizedBox(height: 40),
              const WaveformWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
