import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Info } from 'lucide-react';

interface RecorderProps {
  onRecordingComplete: (base64: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    if (disabled) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Content = base64String.split(',')[1];
          onRecordingComplete(base64Content);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for assessment. Please enable it in browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></div>
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || (disabled && !isRecording)}
          className={`
            relative z-10 flex items-center justify-center w-28 h-28 rounded-full transition-all duration-300 shadow-2xl
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : disabled && !isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-4 border-slate-100'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white'
            }
            ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10 fill-current" />
          ) : (
            <Mic className="w-12 h-12" />
          )}
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className="flex flex-col items-center gap-1">
          <h3 className={`text-xl font-bold ${disabled ? 'text-slate-400' : 'text-slate-800'}`}>
            {isProcessing 
              ? 'AI Score Calibration...' 
              : isRecording 
                ? 'Speaking Now' 
                : disabled 
                  ? 'Input Topic to Unlock' 
                  : 'Start Speaking'
            }
          </h3>
          {disabled && !isRecording && !isProcessing && (
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Info className="w-3 h-3" />
              <span>Enter at least 5 characters in the topic field</span>
            </div>
          )}
        </div>
        
        {isRecording && (
          <div className="bg-red-50 px-4 py-1 rounded-full border border-red-100 inline-block">
            <p className="text-2xl font-mono text-red-600 font-bold">
              {formatTime(duration)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;