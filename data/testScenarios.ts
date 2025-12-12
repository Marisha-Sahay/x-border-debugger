import { TestScenario } from '../types';

export const SCENARIOS: TestScenario[] = [
  {
    id: 's1',
    name: 'Scenario A: SWIFT MT103 Validation Failure',
    description: 'Critical failure in the European corridor due to invalid IBAN formatting in Field 59.',
    transferId: 'TRX_SWIFT_9921',
    customerTier: 'Enterprise',
    corridor: 'USD → EUR',
    partner: 'Deutsche Bank AG',
    logs: `2023-11-02T08:00:01.120Z [INFO] [GatewayService] [trace_id=a1b2] Received PaymentRequest: { "amount": 12500.00, "ccy": "EUR", "beneficiary": { "iban": "DE89370400440532013000" } }
2023-11-02T08:00:01.150Z [INFO] [GatewayService] [trace_id=a1b2] AuthContext validated: MerchantID=M_554
2023-11-02T08:00:01.200Z [INFO] [LedgerCore] [trace_id=a1b2] Reservation created for 12500.00 EUR. LedgerID: RES_998877
2023-11-02T08:00:01.400Z [INFO] [ComplianceScanner] [trace_id=a1b2] Sanctions List Check: CLEAR. RiskScore: 5.
2023-11-02T08:00:02.100Z [INFO] [SwiftFormatter] [trace_id=a1b2] Constructing MT103 Message...
2023-11-02T08:00:02.105Z [INFO] [SwiftFormatter] [trace_id=a1b2] Mapping Field 32A (Value/Amount): 231102EUR12500,
2023-11-02T08:00:02.110Z [INFO] [SwiftFormatter] [trace_id=a1b2] Mapping Field 50K (Ordering Customer): /1234567890
2023-11-02T08:00:02.120Z [ERROR] [SwiftFormatter] [trace_id=a1b2] ValidationException: ISO7064 Modulo 97 Check failed for IBAN in Field 59.
2023-11-02T08:00:02.125Z [ERROR] [SwiftFormatter] [trace_id=a1b2] Invalid IBAN: 'DE89370400440532013000'. Expected Checksum: 21, Actual: 89.
2023-11-02T08:00:02.150Z [WARN] [Orchestrator] [trace_id=a1b2] Step 'SWIFT_GEN' failed. Initiating compensation.
2023-11-02T08:00:02.200Z [INFO] [LedgerCore] [trace_id=a1b2] Releasing reservation RES_998877.
2023-11-02T08:00:02.300Z [INFO] [GatewayService] [trace_id=a1b2] Returning 422 Unprocessable Entity to client.`,
    flowChartSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
  <rect x="0" y="0" width="800" height="200" fill="#0f172a"/>
  <!-- Paths -->
  <line x1="100" y1="100" x2="250" y2="100" stroke="#475569" stroke-width="2" />
  <line x1="350" y1="100" x2="500" y2="100" stroke="#475569" stroke-width="2" />
  <line x1="600" y1="100" x2="750" y2="100" stroke="#475569" stroke-width="2" />
  
  <!-- Nodes -->
  <g transform="translate(50, 70)">
    <rect width="100" height="60" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="50" y="35" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="bold">Gateway</text>
  </g>
  <g transform="translate(250, 70)">
    <rect width="100" height="60" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="50" y="35" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="bold">Compliance</text>
  </g>
  <g transform="translate(500, 70)">
    <rect width="100" height="60" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="50" y="35" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="bold">SWIFT Gen</text>
  </g>
  <g transform="translate(700, 70)">
    <rect width="100" height="60" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="50" y="35" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="bold">Network</text>
  </g>
</svg>`
  },
  {
    id: 's2',
    name: 'Scenario B: Nostro Liquidity Failure',
    description: 'Settlement failure in UK corridor due to insufficient pre-funding (Nostro limit breach).',
    transferId: 'SETT_GBP_005',
    customerTier: 'Standard',
    corridor: 'USD → GBP',
    partner: 'Barclays UK',
    logs: `2023-11-02T09:15:00.000Z [INFO] [Orchestrator] [tx=SETT_GBP_005] Processing Payout Request. Target: GBP via SORT_CODE.
2023-11-02T09:15:00.200Z [INFO] [FXService] [tx=SETT_GBP_005] Rate locked: 1.15 USD/GBP. DealID: D_55102.
2023-11-02T09:15:01.000Z [INFO] [TreasurySystem] [tx=SETT_GBP_005] Allocating funds from Pool: POOL_US_CORP.
2023-11-02T09:15:01.500Z [INFO] [ClearingGate] [tx=SETT_GBP_005] Routing to Correspondent: BARCLAYS_UK via FPS (Faster Payments).
2023-11-02T09:15:02.000Z [INFO] [ClearingGate] [tx=SETT_GBP_005] Sending instruction to Downstream Provider...
2023-11-02T09:15:02.800Z [INFO] [ClearingGate] [tx=SETT_GBP_005] Provider Response: HTTP 202 Accepted.
2023-11-02T09:15:05.000Z [WARN] [WebhookListener] [tx=SETT_GBP_005] Callback received from Provider. Status: REJECTED.
2023-11-02T09:15:05.050Z [ERROR] [WebhookListener] [tx=SETT_GBP_005] Provider Error Code: LIQ_NOSTRO_LIMIT.
2023-11-02T09:15:05.055Z [ERROR] [WebhookListener] [tx=SETT_GBP_005] Message: "Insufficient funds in pre-funded account ending *8821. Shortfall: 450.00 GBP."
2023-11-02T09:15:05.200Z [INFO] [TreasurySystem] [tx=SETT_GBP_005] Alerting Treasury Ops: Top-up required for GBP Nostro.
2023-11-02T09:15:06.000Z [INFO] [Orchestrator] [tx=SETT_GBP_005] Transitioning transaction to state: HELD_FOR_LIQUIDITY.`,
    flowChartSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
  <rect x="0" y="0" width="800" height="200" fill="#0f172a"/>
  <!-- Connectors -->
  <path d="M 120 100 L 220 100" stroke="#64748b" stroke-width="2"/>
  <path d="M 320 100 L 420 100" stroke="#64748b" stroke-width="2"/>
  <path d="M 520 100 L 620 100" stroke="#64748b" stroke-width="2"/>
  
  <!-- Steps -->
  <circle cx="70" cy="100" r="30" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="70" y="105" text-anchor="middle" fill="white" font-size="10">FX</text>
  
  <circle cx="270" cy="100" r="30" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="270" y="105" text-anchor="middle" fill="white" font-size="10">Treasury</text>
  
  <circle cx="470" cy="100" r="30" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="470" y="105" text-anchor="middle" fill="white" font-size="10">Clearing</text>
  
  <rect x="620" y="70" width="100" height="60" fill="#1e293b" stroke="#475569" stroke-dasharray="4"/>
  <text x="670" y="105" text-anchor="middle" fill="white" font-size="10">Nostro (Ext)</text>
</svg>`
  },
  {
    id: 's3',
    name: 'Scenario C: Latency & Compliance Backlog',
    description: 'SLA Breach (45s) caused by Compliance Queue backlog. High churn risk for Mobile App users.',
    transferId: 'TX_SLOW_11',
    customerTier: 'Premium',
    corridor: 'USD -> MXN',
    partner: 'Banorte',
    logs: `2023-11-02T10:00:00.000Z [INFO] [Gateway] [tx=TX_SLOW_11] Inbound Request from MobileApp/v4.
2023-11-02T10:00:00.100Z [INFO] [Ledger] [tx=TX_SLOW_11] Funds debited.
2023-11-02T10:00:00.200Z [INFO] [Orchestrator] [tx=TX_SLOW_11] Pushing to Compliance Queue (Priority: HIGH).
2023-11-02T10:00:00.250Z [INFO] [ComplianceQueue] [tx=TX_SLOW_11] Enqueued. Position: 450.
2023-11-02T10:00:15.000Z [WARN] [ComplianceQueue] [tx=TX_SLOW_11] Still in queue. Position: 120. (Queue SLA Breached)
2023-11-02T10:00:30.000Z [WARN] [Gateway] [tx=TX_SLOW_11] Client connection closed (Client Timeout 30s).
2023-11-02T10:00:44.000Z [INFO] [ComplianceScanner] [tx=TX_SLOW_11] Dequeued. Starting scan.
2023-11-02T10:00:44.500Z [INFO] [ComplianceScanner] [tx=TX_SLOW_11] Scan Clean.
2023-11-02T10:00:45.000Z [INFO] [Orchestrator] [tx=TX_SLOW_11] Payment Submitted to Network. SUCCESS.
2023-11-02T10:00:45.100Z [ERROR] [NotificationSvc] [tx=TX_SLOW_11] Push Notification failed. Device token invalid or unreachable.`,
    flowChartSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
  <rect x="0" y="0" width="800" height="200" fill="#0f172a"/>
  <!-- Flow -->
  <line x1="80" y1="100" x2="200" y2="100" stroke="#475569" stroke-width="2"/>
  <line x1="280" y1="100" x2="400" y2="100" stroke="#475569" stroke-width="2"/>
  <line x1="480" y1="100" x2="600" y2="100" stroke="#475569" stroke-width="2"/>
  
  <rect x="40" y="80" width="40" height="40" fill="#1e293b" stroke="#cbd5e1"/> <!-- Gateway -->
  <rect x="200" y="70" width="80" height="60" fill="#1e293b" stroke="#cbd5e1"/>
  <text x="240" y="105" text-anchor="middle" fill="white" font-size="10">Compliance</text>
  
  <rect x="400" y="70" width="80" height="60" fill="#1e293b" stroke="#cbd5e1"/>
  <text x="440" y="105" text-anchor="middle" fill="white" font-size="10">Settlement</text>
  
  <rect x="600" y="70" width="80" height="60" fill="#1e293b" stroke="#cbd5e1"/>
  <text x="640" y="105" text-anchor="middle" fill="white" font-size="10">Network</text>
</svg>`
  }
];
