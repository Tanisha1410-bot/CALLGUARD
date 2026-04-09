import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  AuthService._();

  static SupabaseClient get _client => Supabase.instance.client;

  static User? get currentUser => _client.auth.currentUser;
  static Session? get currentSession => _client.auth.currentSession;

  static Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  static Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
  }) {
    return _client.auth.signUp(email: email, password: password);
  }

  static Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  static Future<void> sendPhoneOtp({
    required String phone,
  }) async {
    await _client.auth.signInWithOtp(phone: phone);
  }

  static Future<AuthResponse> verifyPhoneOtp({
    required String phone,
    required String token,
  }) {
    return _client.auth.verifyOTP(
      phone: phone,
      token: token,
      type: OtpType.sms,
    );
  }

  static Future<void> signOut() => _client.auth.signOut();
}

