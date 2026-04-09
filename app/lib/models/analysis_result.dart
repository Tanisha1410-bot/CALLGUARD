class AnalysisResult {
  final String risk;
  final String reason;
  final int confidence;

  const AnalysisResult({
    required this.risk,
    required this.reason,
    required this.confidence,
  });
}
