import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.STRING,
      description: "The verbatim transcript of the audio provided."
    },
    evidence_log: {
      type: Type.OBJECT,
      properties: {
        detected_advanced_vocabulary: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of C1/C2 words or idiomatic phrases found."
        },
        detected_complex_grammar: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of sentences containing complex structures (conditionals, passive, inversion)."
        }
      },
      required: ["detected_advanced_vocabulary", "detected_complex_grammar"]
    },
    assessment_summary: {
      type: Type.OBJECT,
      properties: {
        cefr_level: { type: Type.STRING },
        ielts_band: { type: Type.NUMBER },
        short_comment: { type: Type.STRING },
      },
      required: ["cefr_level", "ielts_band", "short_comment"]
    },
    radar_chart_data: {
      type: Type.OBJECT,
      properties: {
        fluency_score: { type: Type.NUMBER },
        vocabulary_score: { type: Type.NUMBER },
        grammar_score: { type: Type.NUMBER },
        pronunciation_score: { type: Type.NUMBER },
      },
      required: ["fluency_score", "vocabulary_score", "grammar_score", "pronunciation_score"]
    },
    detailed_diagnosis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original_text: { type: Type.STRING },
          error_type: { 
            type: Type.STRING, 
            enum: ["grammar", "vocabulary", "pronunciation"] 
          },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["original_text", "error_type", "correction", "explanation"]
      }
    },
    polished_version: {
      type: Type.OBJECT,
      properties: {
        original_segment: { type: Type.STRING },
        native_rewrite: { type: Type.STRING },
      },
      required: ["original_segment", "native_rewrite"]
    }
  },
  required: ["transcript", "evidence_log", "assessment_summary", "radar_chart_data", "detailed_diagnosis", "polished_version"]
};

export const analyzeAudio = async (
  audioBase64: string, 
  topic: string
): Promise<AnalysisResult> => {
  
  const systemPrompt = `
    Role & Objective
    You are an expert IELTS Examiner. Your task is to evaluate a spoken presentation transcript.
    **CRITICAL RULE**: You must reward **Linguistic Capability** even if short. 

    Evaluation Process (Chain of Thought)
    STEP 1: Evidence Extraction (Detect C1/C2 vocab and complex grammar).
    STEP 2: Scoring Logic.
    
    **MANDATORY SCORE MAPPING (STRICT ADHERENCE)**:
    You MUST ensure the 'cefr_level' and 'ielts_band' follow this mapping exactly:
    - IELTS 8.5 - 9.0  => CEFR C2
    - IELTS 7.0 - 8.0  => CEFR C1
    - IELTS 5.5 - 6.5  => CEFR B2
    - IELTS 4.0 - 5.0  => CEFR B1
    - IELTS < 4.0      => CEFR A2 or A1

    Detailed Ceiling Breaker:
    - If found >2 examples of C1/C2 vocab -> Vocabulary Score MUST be ≥ 7.5.
    - If found >2 error-free complex sentences -> Grammar Score MUST be ≥ 7.5.
    - Do not average down criteria.

    Polishing Rule (i + 1 Principle):
    - 'native_rewrite' MUST be ONE CEFR level higher than student's current level.

    Output Rules:
    - Return a SINGLE JSON object.
    - 'transcript' must be verbatim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: systemPrompt,
      },
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "audio/webm", 
                data: audioBase64
              }
            },
            {
              text: `Evaluate this IELTS speaking presentation. Topic: ${topic}`
            }
          ]
        }
      ]
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};