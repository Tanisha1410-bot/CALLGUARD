import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/models/call_log.dart';
import 'package:flutter/material.dart';

class CallLogTile extends StatelessWidget {
  final CallLog item;
  final VoidCallback onTap;

  const CallLogTile({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final _RiskPalette palette = _palette(item.risk);
    final String initial = item.name.isNotEmpty ? item.name[0].toUpperCase() : '?';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              offset: Offset(4, 4),
              blurRadius: 0,
              color: AppColors.cardBg,
            ),
          ],
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border(
              left: BorderSide(color: palette.primary, width: 4),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: palette.bg,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    initial,
                    style: AppTextStyles.heading(color: palette.text).copyWith(
                      fontSize: 16,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        style: AppTextStyles.body(color: AppColors.textDark).copyWith(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.number,
                        style: AppTextStyles.body(color: AppColors.textMuted).copyWith(
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.reason,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.body(color: AppColors.textMuted).copyWith(
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: palette.bg,
                        border: Border.all(color: palette.border),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        item.risk,
                        style: AppTextStyles.badge(color: palette.text),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.time,
                      style: AppTextStyles.caption(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  _RiskPalette _palette(String risk) {
    switch (risk) {
      case 'SCAM':
        return const _RiskPalette(
          bg: AppColors.scamBg,
          border: AppColors.scamBorder,
          text: AppColors.scamText,
          primary: AppColors.scamPrimary,
        );
      case 'SAFE':
        return const _RiskPalette(
          bg: AppColors.safeBg,
          border: AppColors.safeBorder,
          text: AppColors.safeText,
          primary: AppColors.safePrimary,
        );
      default:
        return const _RiskPalette(
          bg: AppColors.suspBg,
          border: AppColors.suspBorder,
          text: AppColors.suspText,
          primary: AppColors.suspPrimary,
        );
    }
  }
}

class _RiskPalette {
  final Color bg;
  final Color border;
  final Color text;
  final Color primary;

  const _RiskPalette({
    required this.bg,
    required this.border,
    required this.text,
    required this.primary,
  });
}
