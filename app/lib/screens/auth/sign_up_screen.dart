import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/services/auth_service.dart';
import 'package:flutter/material.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _loading = false;
  String _error = '';
  String _message = '';

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _signUp() async {
    setState(() {
      _error = '';
      _message = '';
      _loading = true;
    });
    try {
      final res = await AuthService.signUpWithEmail(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
      );

      if (res.session != null) {
        return;
      }

      setState(() {
        _message = 'Sign up successful. Check your email to confirm, then sign in.';
      });
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
        title: Text('Create account', style: AppTextStyles.heading(color: Colors.white)),
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
              decoration: const InputDecoration(labelText: 'Password (min 6 chars)'),
            ),
            const SizedBox(height: 12),
            if (_error.isNotEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),
            if (_message.isNotEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(_message, style: const TextStyle(color: Colors.green)),
              ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _loading ? null : _signUp,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(_loading ? 'Creating…' : 'Sign up'),
                    ),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: _loading ? null : () => Navigator.pushReplacementNamed(context, '/login'),
              child: const Text('Already have an account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

