import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Play,
  RotateCw,
  Cpu,
  ShieldCheck,
  Globe,
  Upload,
  Image as ImageIcon,
  Hash,
  Terminal,
  Code2,
  FlaskConical,
  ChevronDown,
  Building2,
  Users,
  ArrowRight,
  Briefcase,
  AlertOctagon,
  Zap,
  Ticket
} from 'lucide-react';
import { analyzeTransactionLogs } from './services/geminiService';
import { AnalysisResult, TestScenario } from './types';
import { SCENARIOS } from './data/testScenarios';
import TransactionFlow from './components/TransactionFlow';
import LogViewer from './components/LogViewer';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [transferId, setTransferId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State for image preview
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<TestScenario | null>(null);

  // Effect to generate and cleanup image preview URL
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    // Cleanup memory when image changes or component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenario(scenario);
    setLogs(scenario.logs);
    setTransferId(scenario.transferId);
    setResult(null);
    setError(null);
    setIsScenarioMenuOpen(false);

    // Convert SVG string to File object
    const file = new File([scenario.flowChartSvg], `flow_diagram_${scenario.id}.svg`, {
      type: "image/svg+xml",
    });
    setSelectedImage(file);
  };

  const handleAnalyze = async () => {
    if (!logs.trim() || !transferId.trim()) {
      setError("Please provide both logs and a Transfer ID.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeTransactionLogs(logs, transferId, selectedImage);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze logs");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock data for the risk chart (recharts)
  const riskData = result ? [
    { name: 'Identity', score: 10 },
    { name: 'AML', score: result.riskScore > 50 ? result.riskScore - 10 : 5 },
    { name: 'Sanctions', score: 2 },
    { name: 'Technical', score: result.steps.some(s => s.status === 'failed') ? 95 : 10 },
    { name: 'Fraud', score: 15 },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 flex flex-col font-sans">
      
      {/* 1. ENTERPRISE HEADER */}
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">OpsCenter <span className="text-indigo-500">Prime</span></h1>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">V 2.5.1 | PROD-US-EAST-1</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400">System Healthy</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Globe size={14} />
                <span>Global Clearing</span>
             </div>
             <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Admin: J. Smith</span>
             </div>
          </div>
        </div>
      </header>

      {/* 2. CONTEXT BAR (If Scenario Active) */}
      {activeScenario && (
        <div className="bg-slate-900 border-b border-slate-800 py-3">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <Building2 size={14} className="text-indigo-400" />
               <span className="font-semibold text-slate-200">{activeScenario.partner}</span>
               <span className="text-slate-600">|</span>
               <span>Partner Bank</span>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <ArrowRight size={14} className="text-indigo-400" />
               <span className="font-semibold text-slate-200 tracking-wider font-mono">{activeScenario.corridor}</span>
               <span className="text-slate-600">|</span>
               <span>Corridor</span>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <Briefcase size={14} className="text-indigo-400" />
               <span className={`font-semibold px-2 py-0.5 rounded ${activeScenario.customerTier === 'Enterprise' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-200'}`}>
                 {activeScenario.customerTier}
               </span>
               <span className="text-slate-600">|</span>
               <span>Segment</span>
             </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Input */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2">
          
          <div className="bg-[#1e293b]/50 p-5 rounded-xl border border-slate-700/60 shadow-sm space-y-5">
            <div className="flex items-center justify-between relative z-20 mb-2">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <Terminal size={14} className="text-indigo-400" /> Diagnostic Input
              </h2>
              
              <div className="relative">
                <button 
                  onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 text-indigo-300 px-3 py-1.5 rounded-md transition-all border border-transparent shadow-sm ${isScenarioMenuOpen ? 'border-indigo-500/50 bg-slate-600 ring-2 ring-indigo-500/20' : ''}`}
                >
                  <FlaskConical size={12} /> 
                  Load Scenario
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isScenarioMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isScenarioMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsScenarioMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-slate-600 rounded-lg shadow-2xl shadow-black/80 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                       <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Incident Simulations
                       </div>
                       {SCENARIOS.map(scenario => (
                         <button 
                           key={scenario.id}
                           onClick={() => handleLoadScenario(scenario.id)}
                           className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-300 border-b border-slate-700/50 last:border-0 transition-colors group"
                         >
                           <div className="font-bold flex justify-between items-center text-sm">
                             {scenario.name}
                             <span className="opacity-0 group-hover:opacity-100 text-indigo-400 text-[10px] bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-500/30">LOAD</span>
                           </div>
                           <div className="text-[11px] text-slate-500 truncate mt-1">{scenario.description}</div>
                           <div className="flex gap-2 mt-2">
                              <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{scenario.corridor}</span>
                              <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{scenario.partner}</span>
                           </div>
                         </button>
                       ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide ml-0.5">Reference Diagram</label>
               <label className={`flex flex-col items-center justify-center w-full ${previewUrl ? 'h-40' : 'h-24'} bg-slate-900/50 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all group relative overflow-hidden`}>
                  {previewUrl ? (
                    <div className="w-full h-full relative p-2 flex items-center justify-center">
                       <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded opacity-80 group-hover:opacity-40 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-indigo-400 drop-shadow-lg" size={24} />
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400">
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-xs">Upload Architecture SVG/PNG</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*,image/svg+xml" onChange={handleImageChange} />
               </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide ml-0.5">Target Trace ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash size={14} className="text-slate-500" />
                </div>
                <input 
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2.5 pl-9 pr-3 text-sm font-mono text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. TRX_001"
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide ml-0.5">Raw Log Stream</label>
               <textarea 
                  className="w-full h-40 bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-[11px] font-mono leading-relaxed text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none custom-scrollbar transition-all"
                  placeholder="Paste splintered logs here..."
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
               />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !logs || !transferId}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {isAnalyzing ? <RotateCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              {isAnalyzing ? 'Running Forensic Analysis...' : 'Initiate Root Cause Analysis'}
            </button>
          </div>

          {/* Mini Log Viewer */}
          <div className="flex-1 min-h-0 bg-[#0d1117] rounded-xl border border-slate-700/50 overflow-hidden flex flex-col shadow-inner">
             <LogViewer logs={logs} highlightKeyword={transferId} />
          </div>

        </div>

        {/* RIGHT COLUMN: Analysis Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar h-[calc(100vh-140px)]">
          
          {error && (
            <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertOctagon className="text-rose-500 mt-1 shrink-0" size={20} />
              <div>
                <h3 className="text-rose-400 font-bold text-sm">Analysis Aborted</h3>
                <p className="text-rose-300/70 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!result && !isAnalyzing && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12 bg-slate-900/20">
              <Cpu size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-medium text-slate-500">Awaiting Telemetry</p>
              <p className="text-sm max-w-md text-center mt-3 text-slate-600">
                System is standby. Load a scenario or inject logs to begin forensic breakdown.
              </p>
            </div>
          )}

          {isAnalyzing && !result && (
             <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                   <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Activity size={24} className="text-indigo-500 animate-pulse" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <p className="text-slate-300 font-medium animate-pulse">Correlating Logs with Architecture...</p>
                   <p className="text-slate-500 text-xs font-mono">Scanning for Latency, ISO20022 Errors, and Liquidity Gaps</p>
                </div>
             </div>
          )}

          {result && (
            <>
              {/* 3. EXECUTIVE KPI ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Severity Card */}
                <div className={`p-4 rounded-lg border ${
                   result.severity === 'CRITICAL' ? 'bg-rose-950/30 border-rose-800/50' : 
                   result.severity === 'MAJOR' ? 'bg-amber-950/30 border-amber-800/50' : 
                   'bg-slate-800 border-slate-700'
                }`}>
                   <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <AlertTriangle size={10} /> Impact Severity
                   </div>
                   <div className={`text-xl font-black tracking-tight ${
                      result.severity === 'CRITICAL' ? 'text-rose-500' : 
                      result.severity === 'MAJOR' ? 'text-amber-500' : 'text-slate-200'
                   }`}>
                      {result.severity}
                   </div>
                   <div className="text-[10px] text-slate-500 mt-1 truncate">{result.businessImpact}</div>
                </div>

                {/* Status Card */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Transaction ID</div>
                  <div className="text-white font-mono text-sm truncate" title={result.transactionId}>
                    {result.transactionId}
                  </div>
                   <div className="flex items-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${result.steps.some(s => s.status === 'failed') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] text-slate-500">{result.steps.some(s => s.status === 'failed') ? 'Terminated' : 'Completed'}</span>
                   </div>
                </div>
                
                {/* Confidence Card */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                   <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">AI Confidence</div>
                   <div className="text-white font-bold text-xl">{result.aiConfidence}%</div>
                   <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{width: `${result.aiConfidence}%`}}></div>
                   </div>
                </div>

                 {/* Risk Card */}
                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Fraud/Risk Score</div>
                  <div className={`text-xl font-bold ${result.riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {result.riskScore}/100
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{result.riskScore > 50 ? 'Requires Manual Review' : 'Auto-Cleared'}</div>
                </div>
              </div>

              {/* 4. VISUAL FLOW (THE DIAGRAM) */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 shadow-lg">
                 <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700/30 bg-slate-800/50 rounded-t-lg">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Forensic Path Reconstruction</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">D3.js Visualization</span>
                 </div>
                 <div className="p-4">
                   <TransactionFlow steps={result.steps} />
                 </div>
              </div>

              {/* 5. ROOT CAUSE & ACTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                
                {/* Executive Summary */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 shadow-lg flex flex-col">
                   <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Activity size={14} /> Root Cause Analysis (Executive)
                   </h3>
                   <p className="text-slate-200 text-sm leading-relaxed flex-1">
                      {result.executiveSummary}
                   </p>
                </div>

                 {/* Actionable Next Step */}
                 <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 shadow-lg flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                      <CheckCircle2 size={80} />
                   </div>
                   <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Ticket size={14} /> Recommended Remediation
                   </h3>
                   <div className="text-slate-200 text-sm font-medium mb-4">
                      {result.suggestedAction}
                   </div>
                   
                   {/* Fake Action Buttons */}
                   <div className="mt-auto flex gap-2">
                      <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded transition-colors font-medium border border-slate-600">
                        Create Jira Ticket
                      </button>
                      <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded transition-colors font-medium border border-slate-600">
                        Notify Partner Bank
                      </button>
                   </div>
                </div>
              </div>

              {/* 6. TECHNICAL DEEP DIVE */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                 
                 {/* The Failure Trace */}
                 <div className="bg-slate-800/40 border-l-2 border-rose-500 rounded-r-xl p-5 border-y border-r border-slate-700/50">
                    <h3 className="text-rose-400 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Search size={14} /> Cross-Modal Technical Failure Trace
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                        {result.failureTrace}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Developer Fix */}
                    <div className="md:col-span-2 bg-[#0d1117] border border-slate-700 rounded-xl p-5">
                       <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                         <Code2 size={14} /> Engineering Patch
                       </h3>
                       <div className="font-mono text-xs text-emerald-100/90 leading-relaxed">
                         {result.technicalRecommendation}
                       </div>
                    </div>

                    {/* Risk Bar Chart */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col">
                       <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-4">Failure Vector</h3>
                       <div className="flex-1 min-h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={riskData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={70} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                              cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="score" radius={[0, 3, 3, 0]} barSize={12}>
                              {riskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score > 50 ? '#f43f5e' : '#6366f1'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                       </div>
                    </div>
                 </div>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;