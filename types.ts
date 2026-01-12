export interface AssessmentSummary {
  cefr_level: string;
  ielts_band: number;
  short_comment: string;
}

export interface RadarChartData {
  fluency_score: number;
  vocabulary_score: number;
  grammar_score: number;
  pronunciation_score: number;
}

export interface DetailedDiagnosis {
  original_text: string;
  error_type: 'grammar' | 'vocabulary' | 'pronunciation';
  correction: string;
  explanation: string;
}

export interface PolishedVersion {
  original_segment: string;
  native_rewrite: string;
}

export interface EvidenceLog {
  detected_advanced_vocabulary: string[];
  detected_complex_grammar: string[];
}

export interface AnalysisResult {
  transcript: string;
  evidence_log: EvidenceLog;
  assessment_summary: AssessmentSummary;
  radar_chart_data: RadarChartData;
  detailed_diagnosis: DetailedDiagnosis[];
  polished_version: PolishedVersion;
}

export type AppState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'RESULTS' | 'ERROR';