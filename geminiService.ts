import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing in process.env");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

// 简单的连接测试函数
export const testAPIConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const ai = getAIClient();
    console.log("Testing connection with model: gemini-3-flash-preview");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: "Ping" }] }],
    });
    return { success: true, message: response.text || "OK" };
  } catch (error: any) {
    console.error("Connection Test Failed:", error);
    let msg = error.message || "Unknown Error";
    if (msg.includes("429")) msg = "Quota Exceeded (429) - Free tier limit reached or project restricted.";
    if (msg.includes("403")) msg = "Permission Denied (403) - API Key invalid or API not enabled in Google Cloud.";
    if (msg.includes("400")) msg = "Bad Request (400) - Model might not be available in your region.";
    return { success: false, message: msg };
  }
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    evidence_log: {
      type: Type.OBJECT,
      properties: {
        detected_advanced_vocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
        detected_complex_grammar: { type: Type.ARRAY, items: { type: Type.STRING } }
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
          error_type: { type: Type.STRING, enum: ["grammar", "vocabulary", "pronunciation"] },
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

export const analyzeAudio = async (audioBase64: string, topic: string): Promise<AnalysisResult> => {
  const systemPrompt = `You are a strict IELTS Examiner. Evaluate the speech for the topic: ${topic}. 
  Focus on IELTS 9-band criteria. Return valid JSON.`;

  try {
    const ai = getAIClient();
    console.log("Analyzing audio with gemini-3-flash-preview...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: systemPrompt,
      },
      contents: [{
        parts: [
          { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
          { text: `Evaluate this IELTS presentation.` }
        ]
      }]
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(response.text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // 如果是 429 错误
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    
    // 如果是 API Key 错误
    if (error.status === 403 || error.message?.includes("403")) {
      throw new Error("INVALID_API_KEY");
    }

    throw error;
  }
};