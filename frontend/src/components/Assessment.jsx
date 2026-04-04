import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Timer, Brain } from 'lucide-react';

const Assessment = ({ skill, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Sample questions based on the skill (In a real app, fetch these from Flask)
  const questions = [
    { q: `Which of the following is a core principle of ${skill}?`, options: ["Abstraction", "Redundancy", "Linearity", "Staticity"], a: 0 },
    { q: `What is the primary use case for ${skill} in enterprise systems?`, options: ["UI Design", "Data Scaling", "Hardware Control", "Legacy Support"], a: 1 },
  ];

  const handleAnswer = (index) => {
    if (index === questions[currentStep].a) setScore(score + 1);
    
    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const finalScore = (score / questions.length) * 100;
    return (
      <div className="text-center p-8">
        <CheckCircle className="text-emerald-400 mx-auto mb-4" size={48} />
        <h3 className="text-2xl font-bold mb-2">Verification Complete</h3>
        <p className="text-slate-400 mb-6">You scored <span className="text-cyan-400 font-bold">{finalScore}%</span> in {skill}</p>
        <button 
          onClick={() => onComplete(finalScore)}
          className="px-8 py-3 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-500 transition-all"
        >
          Update My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Step {currentStep + 1} of {questions.length}</span>
        <div className="flex items-center gap-2 text-slate-400 text-xs"><Timer size={14} /> 45s</div>
      </div>
      <h3 className="text-xl font-bold mb-8">{questions[currentStep].q}</h3>
      <div className="grid grid-cols-1 gap-4">
        {questions[currentStep].options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-sm font-medium"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Assessment;