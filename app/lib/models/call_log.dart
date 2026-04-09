class CallLog {
  final String name;
  final String number;
  final String risk;
  final String reason;
  final String time;

  const CallLog({
    required this.name,
    required this.number,
    required this.risk,
    required this.reason,
    required this.time,
  });

  static const List<CallLog> mockData = [
    CallLog(
      name: 'Unknown',
      number: '+91-98XX XXXX',
      risk: 'SCAM',
      reason: 'OTP + urgency detected',
      time: '10:32 AM',
    ),
    CallLog(
      name: 'Mom',
      number: '+91-70XX XXXX',
      risk: 'SAFE',
      reason: 'Normal conversation',
      time: '09:15 AM',
    ),
    CallLog(
      name: 'SBI Helpline',
      number: '+91-11XX XXXX',
      risk: 'SUSPICIOUS',
      reason: 'Financial keywords detected',
      time: '08:50 AM',
    ),
    CallLog(
      name: 'Unknown',
      number: '+91-88XX XXXX',
      risk: 'SCAM',
      reason: 'Government impersonation',
      time: 'Yesterday',
    ),
    CallLog(
      name: 'Rahul',
      number: '+91-99XX XXXX',
      risk: 'SAFE',
      reason: 'Normal conversation',
      time: 'Yesterday',
    ),
  ];
}
