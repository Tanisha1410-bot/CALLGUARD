import 'dart:convert';

import 'package:callguard/models/analysis_result.dart';
import 'package:http/http.dart' as http;

class AnalysisService {
  AnalysisService._();

  static Future<AnalysisResult> analyze() async {
    try {
      final client = http.Client();
      final response = await client
          .post(
            Uri.parse('https://NGROK_URL_HERE/analyze'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'transcript': 'Sir aapka SBI account block hone wala hai, '
                  'abhi OTP share karo nahi toh legal action hoga',
            }),
          )
          .timeout(const Duration(seconds: 5));
      client.close();

      if (response.statusCode == 200) {
        final dynamic data = jsonDecode(response.body);
        return AnalysisResult(
          risk: data['risk'] as String,
          reason: data['reason'] as String,
          confidence: (data['confidence'] as num).toInt(),
        );
      } else {
        throw Exception('Bad status');
      }
    } catch (_) {
      return const AnalysisResult(
        risk: 'SUSPICIOUS',
        reason: 'Could not verify — be careful',
        confidence: 60,
      );
    }
  }
}
