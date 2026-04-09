import 'package:callguard/core/app_theme.dart';
import 'package:callguard/screens/incoming_call_screen.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:callguard/screens/auth/phone_otp_screen.dart';
import 'package:callguard/screens/auth/sign_in_screen.dart';
import 'package:callguard/screens/auth/sign_up_screen.dart';
import 'package:callguard/services/auth_service.dart';
import 'package:callguard/supabase_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
  );

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
      routes: <String, WidgetBuilder>{
        '/login': (_) => const SignInScreen(),
        '/signup': (_) => const SignUpScreen(),
        '/phone': (_) => const PhoneOtpScreen(),
      },
      home: const _AuthGate(),
    );
  }
}

class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: AuthService.onAuthStateChange,
      initialData: AuthState(AuthChangeEvent.initialSession, AuthService.currentSession),
      builder: (context, snapshot) {
        final session = snapshot.data?.session ?? AuthService.currentSession;
        if (session != null) {
          return const IncomingCallScreen();
        }
        return const SignInScreen();
      },
    );
  }
}
