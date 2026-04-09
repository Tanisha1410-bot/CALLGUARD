import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/models/analysis_result.dart';
import 'package:callguard/services/analysis_service.dart';
import 'package:callguard/widgets/three_d_button.dart';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';

class RiskBottomSheet extends StatefulWidget {
  final VoidCallback onActionComplete;

  const RiskBottomSheet({super.key, required this.onActionComplete});

  @override
  State<RiskBottomSheet> createState() => _RiskBottomSheetState();
}

class _RiskBottomSheetState extends State<RiskBottomSheet>
    with SingleTickerProviderStateMixin {
  AnalysisResult? _result;
  late final AnimationController _opacityController;
  late final AnimationController _scamPulseController;

  @override
  void initState() {
    super.initState();
    _opacityController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _scamPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _runAnalysis();
  }

  Future<void> _runAnalysis() async {
    final AnalysisResult result = await AnalysisService.analyze();
    if (!mounted) return;
    setState(() {
      _result = result;
    });
    if (result.risk == 'SCAM') {
      _scamPulseController.repeat(reverse: true);
      final bool? canVibrate = await Vibration.hasVibrator();
      if (canVibrate == true) {
        await Vibration.vibrate(pattern: [0, 300, 200, 300, 200, 300]);
      }
    }
  }

  @override
  void dispose() {
    _opacityController.dispose();
    _scamPulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: _result == null ? _buildAnalyzing() : _buildResult(_result!),
      ),
    );
  }

  Widget _buildAnalyzing() {
    return Column(
      children: [
        _dragHandle(),
        const SizedBox(height: 20),
        FadeTransition(
          opacity: Tween<double>(begin: 0.45, end: 1).animate(_opacityController),
          child: const CircularProgressIndicator(
            color: AppColors.primary,
            strokeWidth: 3,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'CallGuard Analyzing...',
          style: AppTextStyles.subHead(color: AppColors.primary),
        ),
        const SizedBox(height: 8),
        Text(
          'Listening to conversation patterns',
          style: AppTextStyles.caption(color: AppColors.textMuted),
        ),
      ],
    );
  }

  Widget _buildResult(AnalysisResult result) {
    final _RiskStyle style = _riskStyle(result.risk);
    final String actionLabel = switch (result.risk) {
      'SCAM' => '⚠️ Drop Call Immediately',
      'SUSPICIOUS' => 'Stay Careful',
      _ => 'Continue Call',
    };

    Widget button = ThreeDButton(
      label: actionLabel,
      bgColor: style.primary,
      shadowColor: style.dark,
      width: double.infinity,
      onPressed: widget.onActionComplete,
    );

    if (result.risk == 'SCAM') {
      button = ScaleTransition(
        scale: Tween<double>(begin: 0.98, end: 1.04).animate(
          CurvedAnimation(
            parent: _scamPulseController,
            curve: Curves.easeInOut,
          ),
        ),
        child: button,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(alignment: Alignment.center, child: _dragHandle()),
        const SizedBox(height: 20),
        Center(
          child: Text(
            style.emoji,
            style: const TextStyle(fontSize: 44),
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Text(
            result.risk,
            style: AppTextStyles.heading(color: style.text),
          ),
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            value: result.confidence / 100,
            minHeight: 6,
            valueColor: AlwaysStoppedAnimation<Color>(style.primary),
            backgroundColor: style.border,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Confidence: ${result.confidence}%',
          style: AppTextStyles.caption(color: style.text),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: style.bg,
            border: Border.all(color: style.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            result.reason,
            style: AppTextStyles.body(color: AppColors.textMuted),
          ),
        ),
        const SizedBox(height: 20),
        button,
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _dragHandle() {
    return Container(
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: AppColors.raised,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  _RiskStyle _riskStyle(String risk) {
    switch (risk) {
      case 'SCAM':
        return const _RiskStyle(
          emoji: '🚨',
          bg: AppColors.scamBg,
          border: AppColors.scamBorder,
          text: AppColors.scamText,
          primary: AppColors.scamPrimary,
          dark: AppColors.scamDark,
        );
      case 'SAFE':
        return const _RiskStyle(
          emoji: '✅',
          bg: AppColors.safeBg,
          border: AppColors.safeBorder,
          text: AppColors.safeText,
          primary: AppColors.safePrimary,
          dark: AppColors.safeDark,
        );
      default:
        return const _RiskStyle(
          emoji: '⚠️',
          bg: AppColors.suspBg,
          border: AppColors.suspBorder,
          text: AppColors.suspText,
          primary: AppColors.suspPrimary,
          dark: AppColors.suspDark,
        );
    }
  }
}

class _RiskStyle {
  final String emoji;
  final Color bg;
  final Color border;
  final Color text;
  final Color primary;
  final Color dark;

  const _RiskStyle({
    required this.emoji,
    required this.bg,
    required this.border,
    required this.text,
    required this.primary,
    required this.dark,
  });
}
