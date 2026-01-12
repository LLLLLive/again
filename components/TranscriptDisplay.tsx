import React, { useMemo, useState } from 'react';
import { DetailedDiagnosis } from '../types';
import { Info, XCircle, BookOpen, Volume2 } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  diagnosis: DetailedDiagnosis[];
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, diagnosis }) => {
  const [activeError, setActiveError] = useState<DetailedDiagnosis | null>(null);

  // Function to determine color classes based on error type
  const getErrorColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-red-100 text-red-800 border-b-2 border-red-300 decoration-red-500';
      case 'vocabulary': return 'bg-yellow-100 text-yellow-800 border-b-2 border-yellow-300 decoration-yellow-500';
      case 'pronunciation': return 'bg-purple-100 text-purple-800 border-b-2 border-purple-300 decoration-purple-500';
      default: return 'bg-gray-100';
    }
  };

  const getErrorIcon = (type: string) => {
     switch (type) {
      case 'grammar': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'vocabulary': return <BookOpen className="w-4 h-4 text-yellow-600" />;
      case 'pronunciation': return <Volume2 className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Memoized function to process text and insert spans
  // This is a simplified highlighter that splits by known error segments.
  // Note: This assumes unique substrings for simplicity. 
  // A production version would need index-based slicing from the API.
  const renderedText = useMemo(() => {
    if (!transcript) return null;

    // Create a map of text positions to avoid overlapping issues (basic implementation)
    // We sort diagnosis by length descending to match longest phrases first
    const sortedDiagnosis = [...diagnosis].sort((a, b) => b.original_text.length - a.original_text.length);

    // We will use a robust replacement strategy:
    // 1. Tokenize the string? No, simple replacement might break if words repeat.
    // 2. We'll split the string by the error texts. 
    // This is tricky if an error text appears twice but only one is an error.
    // Given the constraints, we will iterate and replace all occurrences 
    // (or arguably the first one found if we tracked indices, but Gemini didn't return indices).
    
    // Better approach for React rendering: 
    // We can't easily inject React components into a string safely without a parser.
    // We will map the transcript to segments.
    
    // For this specific MVP, let's look for the substrings and wrap them.
    let parts: (string | DetailedDiagnosis)[] = [transcript];

    sortedDiagnosis.forEach(error => {
      const newParts: (string | DetailedDiagnosis)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          // Try to split this string part by the error text
          // Case insensitive split to be safe? The API should return exact substring.
          const split = part.split(error.original_text);
          if (split.length > 1) {
            // Reassemble with the error object in between
            for (let i = 0; i < split.length; i++) {
              newParts.push(split[i]);
              if (i < split.length - 1) {
                newParts.push(error);
              }
            }
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return <span key={index}>{part}</span>;
      } else {
        const error = part as DetailedDiagnosis;
        return (
          <span
            key={index}
            className={`cursor-pointer px-0.5 rounded mx-0.5 ${getErrorColor(error.error_type)} transition-colors hover:brightness-95`}
            onClick={() => setActiveError(error)}
          >
            {error.original_text}
          </span>
        );
      }
    });
  }, [transcript, diagnosis]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
          Transcribed Speech
        </h3>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 leading-relaxed text-slate-700 text-lg">
          {renderedText}
        </div>
        <div className="mt-4 flex gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-200 rounded-full border border-red-400"></span> Grammar
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-200 rounded-full border border-yellow-400"></span> Vocabulary
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-200 rounded-full border border-purple-400"></span> Pronunciation
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`sticky top-6 transition-all duration-300 ${activeError ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4'}`}>
          {activeError ? (
            <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-start">
                <div className="flex items-center gap-2">
                   {getErrorIcon(activeError.error_type)}
                   <span className="font-bold text-slate-800 capitalize">{activeError.error_type} Issue</span>
                </div>
                <button onClick={() => setActiveError(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Original</p>
                  <p className="text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 inline-block">
                    "{activeError.original_text}"
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Correction</p>
                  <p className="text-green-700 font-medium bg-green-50 p-2 rounded border border-green-100 inline-block">
                    "{activeError.correction}"
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Examiner Note</p>
                  <p className="text-slate-600 text-sm italic">
                    {activeError.explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p>Click on any highlighted text in the transcript to view the examiner's diagnosis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptDisplay;
