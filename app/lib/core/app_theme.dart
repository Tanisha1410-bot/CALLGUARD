import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.pageBg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
      ),
      textTheme: TextTheme(
        displayLarge: AppTextStyles.display(),
        headlineMedium: AppTextStyles.heading(),
        titleMedium: AppTextStyles.subHead(),
        bodyMedium: AppTextStyles.body(),
        bodySmall: AppTextStyles.caption(),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        centerTitle: false,
        titleTextStyle: AppTextStyles.heading(color: Colors.white),
        elevation: 0,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.textDark,
        contentTextStyle: AppTextStyles.body(color: Colors.white),
      ),
    );
  }
}
