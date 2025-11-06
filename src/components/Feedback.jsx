import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://localhost:5001/api/feedback', {
        feedback,
        rating
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setRating(0);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Help us improve</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-green-700 dark:text-green-400 font-semibold">
            Thank you for your feedback!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Rate your experience
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all resize-none text-slate-900 dark:text-white"
              placeholder="Share your thoughts..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export default Feedback;