import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/screens/call_active_screen.dart';
import 'package:callguard/screens/history_screen.dart';
import 'package:callguard/widgets/pulsing_badge.dart';
import 'package:callguard/widgets/three_d_button.dart';
import 'package:flutter/material.dart';

class IncomingCallScreen extends StatelessWidget {
  const IncomingCallScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final double buttonWidth = MediaQuery.of(context).size.width * 0.42;
    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const HistoryScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.history),
                  color: AppColors.raised,
                  iconSize: 28,
                ),
              ),
              const SizedBox(height: 60),
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  color: AppColors.darkCard,
                  shape: BoxShape.circle,
                  border: Border.fromBorderSide(
                    BorderSide(color: AppColors.raised, width: 2),
                  ),
                  boxShadow: [
                    BoxShadow(
                      offset: Offset(6, 6),
                      blurRadius: 0,
                      color: AppColors.darkRaised,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.phone,
                  size: 44,
                  color: AppColors.raised,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Unknown Number',
                style: AppTextStyles.display(color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                '+91-98XXXXXXXX',
                style: AppTextStyles.subHead(color: AppColors.raised),
              ),
              const SizedBox(height: 16),
              const PulsingBadge(
                text: '● Incoming Call',
                bgColor: AppColors.primary,
                textColor: Colors.white,
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ThreeDButton(
                    label: 'Answer',
                    bgColor: AppColors.safePrimary,
                    shadowColor: AppColors.safeDark,
                    icon: Icons.call,
                    width: buttonWidth,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) => const CallActiveScreen(),
                        ),
                      );
                    },
                  ),
                  ThreeDButton(
                    label: 'Decline',
                    bgColor: AppColors.scamPrimary,
                    shadowColor: AppColors.scamDark,
                    icon: Icons.call_end,
                    width: buttonWidth,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Call Declined')),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
