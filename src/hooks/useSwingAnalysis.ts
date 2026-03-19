import { useState, useCallback } from 'react';

export interface AnalysisArea {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work';
  feedback: string;
  tipVideoId: string;
  tipVideoTitle: string;
}

export interface SwingAnalysis {
  overallScore: number;
  overallGrade: string;
  areas: AnalysisArea[];
  summary: string;
}

export interface SwingHistoryEntry {
  id: string;
  date: Date;
  results: SwingAnalysis;
  videoUrl: string | null;
}

const analysisPool: SwingAnalysis[] = [
  {
    overallScore: 72,
    overallGrade: 'B',
    summary: 'Your swing has solid fundamentals with room for improvement in hip rotation and follow-through. Focus on these areas to add distance and consistency.',
    areas: [
      {
        name: 'Grip',
        score: 82,
        status: 'good',
        feedback: 'Your grip pressure looks good, but consider strengthening your left hand slightly to prevent the club face from opening at impact.',
        tipVideoId: 'BBbSwvV3bJI',
        tipVideoTitle: 'Complete Driver Swing Guide – Rick Shiels',
      },
      {
        name: 'Backswing',
        score: 75,
        status: 'good',
        feedback: 'Your backswing plane is slightly steep. Try to keep the club more on plane by feeling like you\'re swinging around your body, not up and over.',
        tipVideoId: 'eJIO_sA3Hz0',
        tipVideoTitle: 'How to Swing a Golf Club – Rick Shiels',
      },
      {
        name: 'Hip Rotation',
        score: 58,
        status: 'needs-work',
        feedback: 'Your hips are not clearing fast enough through impact, causing you to lose power and push shots right. Focus on initiating the downswing with your lower body.',
        tipVideoId: 'Bld9Xo_OGJg',
        tipVideoTitle: 'Golf Hip Rotation for More Power',
      },
      {
        name: 'Impact Position',
        score: 70,
        status: 'good',
        feedback: 'You\'re making decent contact but your hands need to be slightly more ahead of the ball at impact for better compression.',
        tipVideoId: 'IvmHU5Hcs2k',
        tipVideoTitle: 'How to Hit a Golf Ball – Perfect Impact',
      },
      {
        name: 'Follow Through',
        score: 55,
        status: 'needs-work',
        feedback: 'Your follow-through is cutting short. Extend fully through the ball and finish with your belt buckle facing the target for better distance.',
        tipVideoId: 'xOUip3AL_gE',
        tipVideoTitle: 'How to Follow Through in Golf Swing',
      },
      {
        name: 'Tempo',
        score: 80,
        status: 'good',
        feedback: 'Good rhythm overall. Your transition from backswing to downswing is smooth, which is a strong foundation to build on.',
        tipVideoId: 'uLVIBabMgFU',
        tipVideoTitle: 'Perfect Golf Swing Tempo Drill',
      },
    ],
  },
  {
    overallScore: 85,
    overallGrade: 'A-',
    summary: 'Excellent swing mechanics overall! Your grip and tempo are outstanding. Minor adjustments to your stance width and weight transfer will take you to the next level.',
    areas: [
      {
        name: 'Grip',
        score: 92,
        status: 'excellent',
        feedback: 'Textbook neutral grip with proper V-formation. Great pressure control throughout the swing. Keep it up!',
        tipVideoId: 'BBbSwvV3bJI',
        tipVideoTitle: 'Complete Driver Swing Guide – Rick Shiels',
      },
      {
        name: 'Stance & Alignment',
        score: 68,
        status: 'needs-work',
        feedback: 'Your stance is slightly too narrow for a driver. Widen to shoulder width and ensure your feet, hips, and shoulders are parallel to the target line.',
        tipVideoId: 'LG1vJmafYHo',
        tipVideoTitle: 'Golf Setup and Stance for Beginners',
      },
      {
        name: 'Backswing',
        score: 88,
        status: 'excellent',
        feedback: 'Beautiful one-piece takeaway with a full shoulder turn. Your backswing positions are very solid.',
        tipVideoId: 'eJIO_sA3Hz0',
        tipVideoTitle: 'How to Swing a Golf Club – Rick Shiels',
      },
      {
        name: 'Weight Transfer',
        score: 65,
        status: 'needs-work',
        feedback: 'You\'re staying a bit too centered. Feel your weight shift to your trail foot on the backswing and drive toward the target on the downswing.',
        tipVideoId: 'BhB5EIKm2JA',
        tipVideoTitle: 'Golf Weight Transfer for Better Striking',
      },
      {
        name: 'Impact Position',
        score: 90,
        status: 'excellent',
        feedback: 'Excellent shaft lean at impact with great compression. Your divots are in front of the ball, which shows proper technique.',
        tipVideoId: 'IvmHU5Hcs2k',
        tipVideoTitle: 'How to Hit a Golf Ball – Perfect Impact',
      },
      {
        name: 'Tempo',
        score: 95,
        status: 'excellent',
        feedback: 'Outstanding tempo! Your 3:1 backswing-to-downswing ratio is right in line with tour players. This is your biggest strength.',
        tipVideoId: 'uLVIBabMgFU',
        tipVideoTitle: 'Perfect Golf Swing Tempo Drill',
      },
    ],
  },
  {
    overallScore: 61,
    overallGrade: 'C+',
    summary: 'Your swing shows potential but needs work in several key areas. Focus first on grip fundamentals and hip rotation — these two changes alone will dramatically improve your ball striking.',
    areas: [
      {
        name: 'Grip',
        score: 50,
        status: 'needs-work',
        feedback: 'Your grip is too strong (rotated too far to the right), causing a persistent hook. Move both hands slightly to the left on the club to neutralize.',
        tipVideoId: 'BBbSwvV3bJI',
        tipVideoTitle: 'Complete Driver Swing Guide – Rick Shiels',
      },
      {
        name: 'Posture',
        score: 72,
        status: 'good',
        feedback: 'Decent spine angle at address but you\'re losing it during the swing. Focus on maintaining your spine angle through impact.',
        tipVideoId: 'LG1vJmafYHo',
        tipVideoTitle: 'Golf Setup and Stance for Beginners',
      },
      {
        name: 'Backswing',
        score: 60,
        status: 'needs-work',
        feedback: 'Your backswing is too flat, causing an inside-out path. Feel the club working more upward in the backswing for a better plane.',
        tipVideoId: 'eJIO_sA3Hz0',
        tipVideoTitle: 'How to Swing a Golf Club – Rick Shiels',
      },
      {
        name: 'Hip Rotation',
        score: 48,
        status: 'needs-work',
        feedback: 'Major power leak here — your hips are sliding laterally instead of rotating. Practice keeping your trail hip back and rotating around your spine.',
        tipVideoId: 'Bld9Xo_OGJg',
        tipVideoTitle: 'Golf Hip Rotation for More Power',
      },
      {
        name: 'Follow Through',
        score: 65,
        status: 'needs-work',
        feedback: 'You\'re decelerating before impact and stopping your rotation early. Commit to a full finish with your weight on your lead foot.',
        tipVideoId: 'xOUip3AL_gE',
        tipVideoTitle: 'How to Follow Through in Golf Swing',
      },
      {
        name: 'Tempo',
        score: 70,
        status: 'good',
        feedback: 'Your tempo is slightly rushed in the transition. Try pausing briefly at the top of your backswing to smooth out the sequencing.',
        tipVideoId: 'uLVIBabMgFU',
        tipVideoTitle: 'Perfect Golf Swing Tempo Drill',
      },
    ],
  },
];

const HISTORY_KEY = 'swing-coach-history';

function loadHistory(): SwingHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as Array<Omit<SwingHistoryEntry, 'date'> & { date: string }>;
    return entries.map((e) => ({ ...e, date: new Date(e.date) }));
  } catch {
    return [];
  }
}

function saveHistory(entries: SwingHistoryEntry[]) {
  // Keep only the last 2
  const trimmed = entries.slice(-2);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function useSwingAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<SwingAnalysis | null>(null);
  const [history, setHistory] = useState<SwingHistoryEntry[]>(loadHistory);

  const analyze = useCallback((file: File | null) => {
    setAnalyzing(true);
    setResults(null);

    const videoUrl = file ? URL.createObjectURL(file) : null;

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * analysisPool.length);
      const analysisResults = analysisPool[randomIndex];
      setResults(analysisResults);
      setAnalyzing(false);

      const entry: SwingHistoryEntry = {
        id: Date.now().toString(),
        date: new Date(),
        results: analysisResults,
        videoUrl,
      };
      setHistory((prev) => {
        const updated = [...prev, entry].slice(-2);
        saveHistory(updated);
        return updated;
      });
    }, 3000);
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setAnalyzing(false);
  }, []);

  return { analyzing, results, analyze, reset, history };
}
