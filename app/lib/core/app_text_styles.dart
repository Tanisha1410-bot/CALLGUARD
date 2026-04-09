import 'package:callguard/core/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle display({Color? color}) => GoogleFonts.sora(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textDark,
      );

  static TextStyle heading({Color? color}) => GoogleFonts.sora(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textDark,
      );

  static TextStyle subHead({Color? color}) => GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: color ?? AppColors.textMuted,
      );

  static TextStyle body({Color? color}) => GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: color ?? AppColors.textMuted,
      );

  static TextStyle caption({Color? color}) => GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: color ?? AppColors.primary,
      );

  static TextStyle badge({Color? color}) => GoogleFonts.dmSans(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textMuted,
      );
}
