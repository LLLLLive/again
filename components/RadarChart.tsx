import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RadarChartData } from '../types';

interface ChartProps {
  data: RadarChartData;
}

const ScoreChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = [
    { subject: 'Fluency', A: data.fluency_score, fullMark: 9 },
    { subject: 'Vocabulary', A: data.vocabulary_score, fullMark: 9 },
    { subject: 'Grammar', A: data.grammar_score, fullMark: 9 },
    { subject: 'Pronunciation', A: data.pronunciation_score, fullMark: 9 },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 9]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="#6366f1"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
