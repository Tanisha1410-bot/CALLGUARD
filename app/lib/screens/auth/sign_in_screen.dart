import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/services/auth_service.dart';
import 'package:flutter/material.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _loading = false;
  String _error = '';

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    setState(() {
      _error = '';
      _loading = true;
    });
    try {
      final res = await AuthService.signInWithEmail(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
      );
      if (res.session == null) {
        throw Exception('No session returned. Check email/password.');
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: Text('Sign in', style: AppTextStyles.heading(color: Colors.white)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
            const SizedBox(height: 12),
            if (_error.isNotEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _loading ? null : _signIn,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(_loading ? 'Signing in…' : 'Sign in'),
                    ),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: _loading ? null : () => Navigator.pushNamed(context, '/signup'),
              child: const Text('Create account'),
            ),
            TextButton(
              onPressed: _loading ? null : () => Navigator.pushNamed(context, '/phone'),
              child: const Text('Use phone OTP instead'),
            ),
          ],
        ),
      ),
    );
  }
}

