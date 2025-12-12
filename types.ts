
export interface TransactionStep {
  stepName: string;
  status: 'pending' | 'success' | 'failed' | 'warning';
  timestamp: string;
  logSnippet: string;
  description: string;
  entity: string; // e.g., "Origin Bank", "Clearing House"
}

export interface AnalysisResult {
  transactionId: string;
  currencyPair: string;
  amount?: string;
  
  // Visual Flow
  steps: TransactionStep[];
  
  // Executive Data
  executiveSummary: string;
  failureTrace: string;
  technicalRecommendation: string;
  
  // Enterprise Metrics
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  businessImpact: string; // e.g., "SLA Breach - 500ms over limit"
  aiConfidence: number;   // 0-100%
  suggestedAction: string; // e.g., "Trigger Manual Refund"
  
  riskScore: number;
  complianceFlags: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  transferId: string;
  logs: string;
  flowChartSvg: string;
  // Enterprise Context
  customerTier: 'Standard' | 'Premium' | 'Enterprise';
  corridor: string; // e.g. "USD -> EUR"
  partner: string; // e.g. "Barclays"
}
