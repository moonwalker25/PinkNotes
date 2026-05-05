import React, { useState } from 'react';
import { Award } from 'lucide-react';

const Quiz = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

   const startQuiz = async () => {
    if (!selectedSubject) return;
  
    setLoading(true);
  
    setTimeout(() => {
      const quizzes = {
        mathematics: [
          { question: "2 + 2 = ?", options: ["2", "3", "4", "5"], correct: 2 },
          { question: "Square root of 16?", options: ["2", "4", "8", "16"], correct: 1 }
        ],
        physics: [
          { question: "Unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correct: 1 }
        ],
        chemistry: [
          { question: "Water formula?", options: ["CO2", "H2O", "O2", "NaCl"], correct: 1 }
        ]
      };
  
      setQuestions(quizzes[selectedSubject]);
      setQuizStarted(true);
      setLoading(false);
    }, 1000);
  };
  const handleAnswer = (index) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert(`Quiz completed! Your score: ${score + (index === questions[currentQuestion].correct ? 1 : 0)}/${questions.length}`);
      setQuizStarted(false);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedSubject('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Challenge</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Test your knowledge</p>
        </div>
      </div>

      {!quizStarted ? (
        <div className="space-y-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-pink-500 transition-all text-slate-900 dark:text-white"
          >
            <option value="">Choose a subject</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
          </select>
          <button
            onClick={startQuiz}
            disabled={!selectedSubject || loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Loading...' : 'Start Quiz'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
              Score: {score}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {questions[currentQuestion].question}
            </h3>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-4 text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-500 transition-all text-slate-900 dark:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
