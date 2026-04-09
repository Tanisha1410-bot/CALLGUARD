import 'package:callguard/core/app_theme.dart';
import 'package:callguard/screens/incoming_call_screen.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const CallGuardApp());
}

class CallGuardApp extends StatelessWidget {
  const CallGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CallGuard',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const IncomingCallScreen(),
    );
  }
}
