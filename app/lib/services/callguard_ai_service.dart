import 'dart:convert';

import 'package:callguard/supabase_config.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class CallGuardAIService {
  CallGuardAIService._();

  static Uri _endpoint() => Uri.parse('${SupabaseConfig.url}/functions/v1/callguard-ai');

  static Map<String, String> _headers() {
    final session = Supabase.instance.client.auth.currentSession;
    final bearer = session?.accessToken ?? SupabaseConfig.anonKey;

    return <String, String>{
      'Content-Type': 'application/json',
      'apikey': SupabaseConfig.anonKey,
      'Authorization': 'Bearer $bearer',
    };
  }

  static Future<Map<String, dynamic>> analyzeTranscript({
    required String transcript,
  }) async {
    final client = http.Client();
    try {
      final resp = await client
          .post(
            _endpoint(),
            headers: _headers(),
            body: jsonEncode(<String, dynamic>{'transcript': transcript}),
          )
          .timeout(const Duration(seconds: 12));

      final body = resp.body.isEmpty ? '{}' : resp.body;
      final dynamic decoded = jsonDecode(body);
      final Map<String, dynamic> json =
          decoded is Map<String, dynamic> ? decoded : <String, dynamic>{'data': decoded};

      if (resp.statusCode >= 200 && resp.statusCode < 300) {
        return json;
      }

      final message = json['error']?.toString() ??
          json['message']?.toString() ??
          'Edge function failed (${resp.statusCode})';
      throw Exception(message);
    } finally {
      client.close();
    }
  }
}

