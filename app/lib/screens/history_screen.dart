import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/models/call_log.dart';
import 'package:callguard/widgets/call_log_tile.dart';
import 'package:flutter/material.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        leading: const BackButton(color: Colors.white),
        title: Text(
          'Call History',
          style: AppTextStyles.heading(color: Colors.white),
        ),
      ),
      body: ListView.builder(
        itemCount: CallLog.mockData.length,
        itemBuilder: (context, index) {
          final CallLog item = CallLog.mockData[index];
          return CallLogTile(
            item: item,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(item.reason),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
