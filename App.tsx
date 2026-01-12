import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeAudio } from './services/geminiService';
import Recorder from './components/Recorder';
import TranscriptDisplay from './components/TranscriptDisplay';
import ScoreChart from './components/RadarChart';
import { Brain, Sparkles, RefreshCw, BarChart3, Quote, TrendingUp, Search, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRecordingComplete = async (base64Audio: string) => {
    if (topic.trim().length < 3) {
      setErrorMsg("Please enter a valid speaking topic first.");
      setState('ERROR');
      return;
    }
    setState('PROCESSING');
    setErrorMsg(null);
    try {
      const data = await analyzeAudio(base64Audio, topic);
      setResult(data);
      setState('RESULTS');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze audio. Please check your API connection and try again.");
      setState('ERROR');
    }
  };

  const handleReset = () => {
    setState('IDLE');
    setResult(null);
    setErrorMsg(null);
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">LinguistAI <span className="text-indigo-600 font-light">Evaluator</span></h1>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
             AI Examiner Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        
        {state === 'IDLE' && (
          <div className="max-w-2xl mx-auto mt-10 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-2">Speaking Assessment</h2>
                <p className="text-indigo-100 italic">"Step onto the stage and showcase your linguistic prowess."</p>
              </div>
              <div className="p-8">
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-500" />
                    Target Topic
                  </label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The role of Artificial Intelligence in medicine"
                    className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  />
                  {topic.length > 0 && topic.length < 5 && (
                    <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Topic is a bit short. Be more specific for better accuracy.
                    </p>
                  )}
                </div>
                
                <div className="border-t border-slate-100 pt-6">
                   <Recorder 
                    onRecordingComplete={handleRecordingComplete} 
                    isProcessing={false} 
                    disabled={topic.trim().length === 0}
                   />
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className="flex flex-col items-center justify-center mt-20 space-y-6">
             <Recorder onRecordingComplete={() => {}} isProcessing={true} disabled={true} />
             <div className="text-center">
               <p className="text-indigo-600 font-bold text-lg animate-pulse">Examiner is analyzing your evidence...</p>
               <p className="text-slate-400 text-sm mt-1">Transcribing and cross-referencing IELTS standards</p>
             </div>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="max-w-md mx-auto mt-20 text-center animate-in zoom-in duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analysis Interrupted</h3>
              <p className="text-slate-600 mb-6">{errorMsg}</p>
              <button 
                onClick={() => setState('IDLE')}
                className="w-full py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {state === 'RESULTS' && result && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Summary Card (Full Width) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {topic}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Assessment Summary</h2>
                <p className="text-slate-600 max-w-2xl text-xl leading-relaxed italic">
                  "{result.assessment_summary.short_comment}"
                </p>
              </div>
              
              <div className="flex gap-6">
                <div className="text-center p-5 bg-indigo-50 rounded-2xl border border-indigo-100 min-w-[130px] shadow-sm">
                  <p className="text-xs text-indigo-400 uppercase font-bold mb-1">CEFR Level</p>
                  <p className="text-5xl font-black text-indigo-600">{result.assessment_summary.cefr_level}</p>
                </div>
                <div className="text-center p-5 bg-purple-50 rounded-2xl border border-purple-100 min-w-[130px] shadow-sm">
                  <p className="text-xs text-purple-400 uppercase font-bold mb-1">IELTS Band</p>
                  <p className="text-5xl font-black text-purple-600">{result.assessment_summary.ielts_band}</p>
                </div>
              </div>
            </div>

            {/* Middle Analytics Row (3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Radar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800">Performance Matrix</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ScoreChart data={result.radar_chart_data} />
                </div>
              </div>

              {/* CENTER: Evidence Log */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-emerald-500">
                 <div className="flex items-center gap-2 mb-6">
                    <Search className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-800 text-lg">Examiner Evidence</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Detected Advanced Vocabulary</p>
                      <div className="flex flex-wrap gap-2">
                        {result.evidence_log?.detected_advanced_vocabulary?.length > 0 ? (
                          result.evidence_log.detected_advanced_vocabulary.map((word, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-100 shadow-sm">{word}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm italic">Minimal advanced vocabulary detected.</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Complex Grammar Structures</p>
                      <ul className="space-y-3">
                        {result.evidence_log?.detected_complex_grammar?.length > 0 ? (
                          result.evidence_log.detected_complex_grammar.map((sentence, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-3 leading-relaxed bg-slate-50 p-2 rounded-lg">
                               <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                               <span className="italic">"{sentence}"</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 text-sm italic">No complex structures identified.</li>
                        )}
                      </ul>
                    </div>
                  </div>
              </div>

              {/* Right: Polished Version */}
              <div className="bg-slate-900 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-indigo-300 mb-6 flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" /> Smart Level-Up (i + 1)
                  </h3>
                  <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-indigo-300 uppercase font-bold mb-2">Weakest Segment</p>
                    <p className="text-sm text-indigo-100 italic opacity-80 leading-relaxed">"{result.polished_version.original_segment}"</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-300 uppercase font-bold mb-2">Native-Level Refinement</p>
                    <div className="flex gap-3">
                      <Quote className="w-8 h-8 text-green-400 rotate-180 flex-shrink-0 opacity-50" />
                      <p className="text-xl font-serif text-white leading-relaxed">
                        {result.polished_version.native_rewrite}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Transcript (Full Width) */}
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-50 border-b border-slate-200 px-8 py-4">
                  <h3 className="text-lg font-bold text-slate-800">Detailed Feedback & Transcript</h3>
               </div>
               <div className="p-8">
                 <TranscriptDisplay 
                    transcript={result.transcript} 
                    diagnosis={result.detailed_diagnosis} 
                 />
               </div>
            </div>

            <div className="flex justify-center pt-8 pb-20">
              <button 
                onClick={handleReset}
                className="group flex items-center gap-3 px-10 py-4 bg-white border-2 border-slate-200 rounded-full shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-slate-700 font-bold text-lg"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                Start New Evaluation
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;