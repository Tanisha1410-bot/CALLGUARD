import 'package:callguard/models/analysis_result.dart';
import 'package:callguard/services/callguard_ai_service.dart';

class AnalysisService {
  AnalysisService._();

  static Future<AnalysisResult> analyze() async {
    try {
      final data = await CallGuardAIService.analyzeTranscript(
        transcript: 'Sir aapka SBI account block hone wala hai, '
            'abhi OTP share karo nahi toh legal action hoga',
      );

      final risk = (data['risk'] ?? data['risk_level'] ?? data['label'] ?? 'SUSPICIOUS').toString();
      final reason =
          (data['reason'] ?? data['explanation'] ?? data['summary'] ?? 'Model analysis complete.').toString();
      final dynamic confRaw = data['confidence'] ?? data['score'] ?? data['probability'] ?? 60;
      final int confidence = (confRaw is num) ? confRaw.toInt() : int.tryParse(confRaw.toString()) ?? 60;

      return AnalysisResult(risk: risk, reason: reason, confidence: confidence);
    } catch (_) {
      return const AnalysisResult(
        risk: 'SUSPICIOUS',
        reason: 'Could not verify — be careful',
        confidence: 60,
      );
    }
  }
}
