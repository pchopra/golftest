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
        tipVideoId: 'jCxsqPaQ0Lg',
        tipVideoTitle: 'Perfect Golf Grip – Rick Shiels',
      },
      {
        name: 'Backswing',
        score: 75,
        status: 'good',
        feedback: 'Your backswing plane is slightly steep. Try to keep the club more on plane by feeling like you\'re swinging around your body, not up and over.',
        tipVideoId: 'aS-sPD7JPPU',
        tipVideoTitle: 'Fix Your Backswing Plane',
      },
      {
        name: 'Hip Rotation',
        score: 58,
        status: 'needs-work',
        feedback: 'Your hips are not clearing fast enough through impact, causing you to lose power and push shots right. Focus on initiating the downswing with your lower body.',
        tipVideoId: 'bVcEaAXSwJE',
        tipVideoTitle: 'Hip Rotation for Power – Athletic Motion Golf',
      },
      {
        name: 'Impact Position',
        score: 70,
        status: 'good',
        feedback: 'You\'re making decent contact but your hands need to be slightly more ahead of the ball at impact for better compression.',
        tipVideoId: 'FJL6MhHjSK0',
        tipVideoTitle: 'Perfect Impact Position',
      },
      {
        name: 'Follow Through',
        score: 55,
        status: 'needs-work',
        feedback: 'Your follow-through is cutting short. Extend fully through the ball and finish with your belt buckle facing the target for better distance.',
        tipVideoId: 'iwdGMjONaOQ',
        tipVideoTitle: 'Complete Your Follow Through',
      },
      {
        name: 'Tempo',
        score: 80,
        status: 'good',
        feedback: 'Good rhythm overall. Your transition from backswing to downswing is smooth, which is a strong foundation to build on.',
        tipVideoId: 'TG3SMpWfVCo',
        tipVideoTitle: 'Perfect Golf Swing Tempo',
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
        tipVideoId: 'jCxsqPaQ0Lg',
        tipVideoTitle: 'Perfect Golf Grip – Rick Shiels',
      },
      {
        name: 'Stance & Alignment',
        score: 68,
        status: 'needs-work',
        feedback: 'Your stance is slightly too narrow for a driver. Widen to shoulder width and ensure your feet, hips, and shoulders are parallel to the target line.',
        tipVideoId: 'dG1WMhJOGHs',
        tipVideoTitle: 'Perfect Golf Stance Setup',
      },
      {
        name: 'Backswing',
        score: 88,
        status: 'excellent',
        feedback: 'Beautiful one-piece takeaway with a full shoulder turn. Your backswing positions are very solid.',
        tipVideoId: 'aS-sPD7JPPU',
        tipVideoTitle: 'Fix Your Backswing Plane',
      },
      {
        name: 'Weight Transfer',
        score: 65,
        status: 'needs-work',
        feedback: 'You\'re staying a bit too centered. Feel your weight shift to your trail foot on the backswing and drive toward the target on the downswing.',
        tipVideoId: 'UiIb_lJNhFo',
        tipVideoTitle: 'Master Weight Transfer in Golf',
      },
      {
        name: 'Impact Position',
        score: 90,
        status: 'excellent',
        feedback: 'Excellent shaft lean at impact with great compression. Your divots are in front of the ball, which shows proper technique.',
        tipVideoId: 'FJL6MhHjSK0',
        tipVideoTitle: 'Perfect Impact Position',
      },
      {
        name: 'Tempo',
        score: 95,
        status: 'excellent',
        feedback: 'Outstanding tempo! Your 3:1 backswing-to-downswing ratio is right in line with tour players. This is your biggest strength.',
        tipVideoId: 'TG3SMpWfVCo',
        tipVideoTitle: 'Perfect Golf Swing Tempo',
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
        tipVideoId: 'jCxsqPaQ0Lg',
        tipVideoTitle: 'Perfect Golf Grip – Rick Shiels',
      },
      {
        name: 'Posture',
        score: 72,
        status: 'good',
        feedback: 'Decent spine angle at address but you\'re losing it during the swing. Focus on maintaining your spine angle through impact.',
        tipVideoId: 'B5dHyKBsFJE',
        tipVideoTitle: 'Perfect Golf Posture',
      },
      {
        name: 'Backswing',
        score: 60,
        status: 'needs-work',
        feedback: 'Your backswing is too flat, causing an inside-out path. Feel the club working more upward in the backswing for a better plane.',
        tipVideoId: 'aS-sPD7JPPU',
        tipVideoTitle: 'Fix Your Backswing Plane',
      },
      {
        name: 'Hip Rotation',
        score: 48,
        status: 'needs-work',
        feedback: 'Major power leak here — your hips are sliding laterally instead of rotating. Practice keeping your trail hip back and rotating around your spine.',
        tipVideoId: 'bVcEaAXSwJE',
        tipVideoTitle: 'Hip Rotation for Power – Athletic Motion Golf',
      },
      {
        name: 'Follow Through',
        score: 65,
        status: 'needs-work',
        feedback: 'You\'re decelerating before impact and stopping your rotation early. Commit to a full finish with your weight on your lead foot.',
        tipVideoId: 'iwdGMjONaOQ',
        tipVideoTitle: 'Complete Your Follow Through',
      },
      {
        name: 'Tempo',
        score: 70,
        status: 'good',
        feedback: 'Your tempo is slightly rushed in the transition. Try pausing briefly at the top of your backswing to smooth out the sequencing.',
        tipVideoId: 'TG3SMpWfVCo',
        tipVideoTitle: 'Perfect Golf Swing Tempo',
      },
    ],
  },
];

export function useSwingAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<SwingAnalysis | null>(null);

  const analyze = useCallback((_file: File | null) => {
    setAnalyzing(true);
    setResults(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * analysisPool.length);
      setResults(analysisPool[randomIndex]);
      setAnalyzing(false);
    }, 3000);
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setAnalyzing(false);
  }, []);

  return { analyzing, results, analyze, reset };
}
