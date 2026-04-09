import 'package:callguard/core/app_colors.dart';
import 'package:callguard/core/app_text_styles.dart';
import 'package:callguard/services/auth_service.dart';
import 'package:flutter/material.dart';

class PhoneOtpScreen extends StatefulWidget {
  const PhoneOtpScreen({super.key});

  @override
  State<PhoneOtpScreen> createState() => _PhoneOtpScreenState();
}

class _PhoneOtpScreenState extends State<PhoneOtpScreen> {
  final _phoneCtrl = TextEditingController();
  final _tokenCtrl = TextEditingController();

  bool _loading = false;
  bool _sent = false;
  String _error = '';
  String _message = '';

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _tokenCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    setState(() {
      _loading = true;
      _error = '';
      _message = '';
    });
    try {
      await AuthService.sendPhoneOtp(phone: _phoneCtrl.text.trim());
      setState(() {
        _sent = true;
        _message = 'OTP sent. Enter the code from SMS.';
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

  Future<void> _verifyOtp() async {
    setState(() {
      _loading = true;
      _error = '';
      _message = '';
    });
    try {
      final res = await AuthService.verifyPhoneOtp(
        phone: _phoneCtrl.text.trim(),
        token: _tokenCtrl.text.trim(),
      );
      if (res.session == null) {
        throw Exception('OTP verified but no session returned.');
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
        title: Text('Phone OTP', style: AppTextStyles.heading(color: Colors.white)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone (E.164, e.g. +14155552671)',
              ),
            ),
            const SizedBox(height: 12),
            if (_sent)
              TextField(
                controller: _tokenCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'OTP code'),
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
                    onPressed: _loading ? null : (_sent ? _verifyOtp : _sendOtp),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        _loading
                            ? 'Working…'
                            : _sent
                                ? 'Verify OTP'
                                : 'Send OTP',
                      ),
                    ),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: _loading
                  ? null
                  : () {
                      setState(() {
                        _sent = false;
                        _tokenCtrl.text = '';
                        _error = '';
                        _message = '';
                      });
                    },
              child: const Text('Start over'),
            ),
            TextButton(
              onPressed: _loading ? null : () => Navigator.pushReplacementNamed(context, '/login'),
              child: const Text('Use email/password instead'),
            ),
          ],
        ),
      ),
    );
  }
}

