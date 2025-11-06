import React, { useState, useEffect } from 'react';
import { Upload, BookOpen, MessageSquare, Brain, Award, Menu, X, Sun, Moon, Bell, User, TrendingUp } from 'lucide-react';
import axios from 'axios';
import UploadNotes from './components/UploadNotes.jsx';
import BrowseNotes from './components/BrowseNotes.jsx';
import AIDoubtSolver from './components/AIDoubtSolver.jsx';
import Quiz from './components/Quiz.jsx';
import Feedback from './components/Feedback.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import StatsCard from './components/StatsCard.jsx';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch notes from backend
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/notes');
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    
    // Check for saved dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'browse', label: 'Browse', icon: BookOpen },
    { id: 'ai-solver', label: 'AI Solver', icon: Brain },
    { id: 'quiz', label: 'Quiz', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Top Navigation Bar */}
        <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    PinkNotes
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all z-40 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
            {activeTab === 'dashboard' ? (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back! 👋
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage your notes and enhance your learning
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard 
                    icon={BookOpen} 
                    title="Total Notes" 
                    value={notes.length.toString()} 
                    change={12} 
                    color="bg-gradient-to-br from-blue-500 to-cyan-500" 
                  />
                  <StatsCard 
                    icon={Upload} 
                    title="Uploads" 
                    value="45" 
                    change={8} 
                    color="bg-gradient-to-br from-green-500 to-emerald-500" 
                  />
                  <StatsCard 
                    icon={Award} 
                    title="Quizzes" 
                    value="23" 
                    change={-3} 
                    color="bg-gradient-to-br from-purple-500 to-pink-500" 
                  />
                  <StatsCard 
                    icon={Brain} 
                    title="AI Queries" 
                    value="89" 
                    change={15} 
                    color="bg-gradient-to-br from-orange-500 to-red-500" 
                  />
                </div>

                {/* Upload & Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UploadNotes onUploadSuccess={fetchNotes} />
                  <RecentActivity />
                </div>

                {/* AI & Quiz Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIDoubtSolver />
                  <Quiz />
                </div>

                {/* Browse Notes */}
                <BrowseNotes notes={notes} loading={loading} />

                {/* Feedback */}
                <Feedback />
              </div>
            ) : (
              <div>
                {activeTab === 'upload' && <UploadNotes onUploadSuccess={fetchNotes} />}
                {activeTab === 'browse' && <BrowseNotes notes={notes} loading={loading} />}
                {activeTab === 'ai-solver' && <AIDoubtSolver />}
                {activeTab === 'quiz' && <Quiz />}
                {activeTab === 'feedback' && <Feedback />}
              </div>
            )}
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

export default App;