import React, { useState, useEffect } from "react";

import { supabase } from "./supabase.js";
import Auth from "./components/Auth.jsx";

import {
  Upload,
  BookOpen,
  Brain,
  Bookmark,
  Award,
  Menu,
  X,
  Sun,
  Moon,
  User,
  TrendingUp,
  History,
  FileQuestion,
  Target,
} from "lucide-react";

import UploadNotes from "./components/UploadNotes.jsx";
import BrowseNotes from "./components/BrowseNotes.jsx";
import AIDoubtSolver from "./components/AIDoubtSolver.jsx";
import Quiz from "./components/Quiz.jsx";

import RecentActivity from "./components/RecentActivity.jsx";
import UserStats from "./components/UserStats.jsx";
import QuizHistory from "./components/QuizHistory.jsx";
import NoteDetail from "./components/NoteDetail.jsx";
import Bookmarks from "./components/Bookmarks.jsx";
import LearningToday from "./components/LearningToday.jsx";

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);


  // =========================
  // APP STATE
  // =========================

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected note for quiz generation
  const [quizNote, setQuizNote] = useState(null);
  // Personalized practice state
  const [practiceTopic, setPracticeTopic] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [practiceTopicSubject, setPracticeTopicSubject] = useState("");
  const [practiceTopicType, setPracticeTopicType] = useState("topic");


  // =========================
  // SUPABASE SESSION
  // =========================

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            "Error getting Supabase session:",
            error
          );
        }

        setSession(data?.session || null);
      } catch (error) {
        console.error(
          "Session error:",
          error
        );
      } finally {
        setAuthLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // =========================
  // FETCH NOTES
  // =========================

  const fetchNotes = async () => {
    if (!session) return;

    setLoading(true);

    try {
      const { data, error } =
        await supabase
          .from("notes")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      setNotes(data || []);
    } catch (error) {
      console.error(
        "Error fetching notes from Supabase:",
        error
      );

      setNotes([]);
    } finally {
      setLoading(false);
    }
  };
// =========================
// NAVIGATION HANDLER
// =========================
  const handleOpenNote = (note) => {
    if (!note?.id) return;

    setSelectedNote(note);
    setActiveTab("note-detail");
    setSidebarOpen(false);
  };
  const handleBackToNotes = () => {
    setSelectedNote(null);
    setActiveTab("browse");
  };
  const handleAskAI = (note) => {
    if (!note?.id) return;

    setSelectedNote(note);
    setActiveTab("ai-solver");
    setSidebarOpen(false);
  };


  // =========================
  // FETCH NOTES AFTER LOGIN
  // =========================

  useEffect(() => {
    if (session) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [session]);


  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);


  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;

    setDarkMode(newDarkMode);

    localStorage.setItem(
      "theme",
      newDarkMode ? "dark" : "light"
    );
  };


  // =========================
  // NAVIGATION
  // =========================

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);

    if (tab === "quiz") {
      setQuizNote(null);

      setPracticeTopic("");
      setPracticeTopicSubject("");
      setPracticeTopicType("topic");
    }

    if (tab === "ai-solver") {
      setSelectedNote(null);

      setPracticeTopic("");
      setPracticeTopicSubject("");
      setPracticeTopicType("topic");
    }
  };

  // =========================
  // QUIZ FROM BROWSE NOTES
  // =========================

  const handleGenerateQuiz = (note) => {
    if (!note?.id) {
      return;
    }

    if (note.status !== "approved") {
      return;
    }

    setQuizNote(note);

    // Clear personalized practice mode
    setPracticeTopic("");
    setPracticeTopicSubject("");
    setPracticeTopicType("topic");

    setActiveTab("quiz");
    setSidebarOpen(false);
  };
  // =========================
  // PERSONALIZED TOPIC PRACTICE
  // =========================

  const handlePracticeTopic = (recommendation) => {
    if (!recommendation?.name) {
      return;
    }

    setPracticeTopic(recommendation.name);
    setPracticeTopicSubject(
      recommendation.subject || ""
    );
    setPracticeTopicType(
      recommendation.type || "topic"
    );

    setQuizNote(null);

    setActiveTab("quiz");
    setSidebarOpen(false);
  };

  // =========================
  // NAV ITEMS
  // =========================

  const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: TrendingUp,
  },
  {
    id: "upload",
    label: "Upload",
    icon: Upload,
  },
  {
    id: "browse",
    label: "Browse",
    icon: BookOpen,
  },
  {
    id: "bookmarks",
    label: "My Bookmarks",
    icon: Bookmark,
  },
  {
    id: "ai-solver",
    label: "AI Solver",
    icon: Brain,
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Award,
  },
  {
    id: "quiz-history",
    label: "Quiz History",
    icon: History,
  },
  
];


  // =========================
  // AUTH LOADING
  // =========================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">

          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              P
            </span>
          </div>

          <p className="text-pink-600 font-semibold">
            Loading PinkNotes...
          </p>

        </div>
      </div>
    );
  }


  // =========================
  // AUTH SCREEN
  // =========================

  if (!session) {
    return <Auth />;
  }


  // =========================
  // MAIN APP
  // =========================

  return (
    <div className={darkMode ? "dark" : ""}>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">


        {/* =========================
            TOP NAVIGATION
        ========================= */}

        <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center h-16">


              {/* Logo + Mobile Menu */}

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    setSidebarOpen(!sidebarOpen)
                  }
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                  type="button"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>


                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      P
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    PinkNotes
                  </h1>

                </div>

              </div>


              {/* Right Navigation */}

              <div className="flex items-center gap-3">

                {/* Dark Mode */}

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  type="button"
                >

                  {darkMode ? (
                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}

                </button>


                {/* Logout */}

                <button
                  onClick={async () => {
                    const { error } =
                      await supabase.auth.signOut();

                    if (error) {
                      console.error(
                        "Logout error:",
                        error
                      );
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  type="button"
                  title="Logout"
                >

                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />

                </button>

              </div>

            </div>

          </div>

        </nav>


        {/* =========================
            SIDEBAR + CONTENT
        ========================= */}

        <div className="flex">


          {/* SIDEBAR */}

          <aside
            className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform z-40 ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }`}
          >

            <nav className="p-4 space-y-2">

              {navItems.map((item) => {

                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      handleNavigation(item.id)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                    type="button"
                  >

                    <Icon className="w-5 h-5" />

                    <span>
                      {item.label}
                    </span>

                  </button>
                );

              })}

            </nav>

          </aside>


          {/* =========================
              MAIN CONTENT
          ========================= */}

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">


            {/* =========================
                DASHBOARD
            ========================= */}

            {activeTab === "dashboard" && (

              <div className="space-y-8">


                {/* =========================
                    PINKNOTES INTRODUCTION
                ========================= */}

                <section>

                  <div className="relative overflow-hidden rounded-3xl border border-pink-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">

                    {/* Decorative background elements */}

                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-100 dark:bg-pink-900/20 blur-3xl opacity-70" />

                    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-70" />


                    <div className="relative p-7 sm:p-10">

                      {/* Small label */}

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 text-xs font-semibold mb-5">

                        <Brain size={14} />

                        AI-powered academic workspace

                      </div>


                      {/* Main heading */}

                      <div className="max-w-3xl">

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">

                          Study smarter.

                          <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">

                            Understand better.

                          </span>

                        </h2>


                        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">

                          PinkNotes brings your academic resources, AI assistance,
                          intelligent quizzes and learning insights into one
                          connected workspace — helping you move from studying
                          to understanding, practicing and improving.

                        </p>

                      </div>


                      {/* Product flow */}

                      <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">

                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60">

                          <BookOpen
                            size={16}
                            className="text-pink-500"
                          />

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Learn
                          </span>

                        </div>


                        <span className="text-slate-300 dark:text-slate-600">
                          →
                        </span>


                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60">

                          <Brain
                            size={16}
                            className="text-purple-500"
                          />

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Understand
                          </span>

                        </div>


                        <span className="text-slate-300 dark:text-slate-600">
                          →
                        </span>


                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60">

                          <FileQuestion
                            size={16}
                            className="text-indigo-500"
                          />

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Practice
                          </span>

                        </div>


                        <span className="text-slate-300 dark:text-slate-600">
                          →
                        </span>


                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60">

                          <Target
                            size={16}
                            className="text-pink-500"
                          />

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Improve
                          </span>

                        </div>

                      </div>


                      {/* Buttons */}

                      <div className="mt-8 flex flex-wrap gap-3">

                        <button
                          onClick={() =>
                            handleNavigation("quiz")
                          }
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >

                          <Award size={18} />

                          Start Learning

                        </button>


                        <button
                          onClick={() =>
                            handleNavigation("browse")
                          }
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                        >

                          <BookOpen size={18} />

                          Explore Resources

                        </button>

                      </div>


                      {/* Value points */}

                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">


                          <div className="flex gap-3">

                            <div className="w-9 h-9 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">

                              <Upload
                                size={17}
                                className="text-pink-500"
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                Organized resources
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Keep your academic material in one place.
                              </p>

                            </div>

                          </div>


                          <div className="flex gap-3">

                            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">

                              <Brain
                                size={17}
                                className="text-purple-500"
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                Context-aware AI
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Understand concepts with AI assistance.
                              </p>

                            </div>

                          </div>


                          <div className="flex gap-3">

                            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">

                              <TrendingUp
                                size={17}
                                className="text-indigo-500"
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                Personalized progress
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Turn quiz performance into useful insights.
                              </p>

                            </div>

                          </div>


                        </div>

                      </div>

                    </div>

                  </div>

                </section>

                {/* =========================
                      HOW PINKNOTES WORKS
                ========================= */}

                <section>

                  <div className="mb-6">

                    <p className="text-sm font-semibold text-pink-500 uppercase tracking-wider">
                        How PinkNotes works
                    </p>

                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        From study material to meaningful progress.
                    </h2>

                    <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                        PinkNotes connects the parts of studying that are usually
                        scattered across different platforms.
                    </p>

                  </div>


                  {/* Learning Journey */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">


                    {/* STEP 1 */}

                    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300">

                      <div className="flex items-start justify-between">

                        <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">

                          <BookOpen
                              size={21}
                              className="text-pink-500"
                          />

                        </div>

                        <span className="text-3xl font-bold text-slate-100 dark:text-slate-700 group-hover:text-pink-100 dark:group-hover:text-pink-900/40 transition">
                            01
                        </span>

                      </div>


                      <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                          Collect
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          Upload your academic notes and study material,
                          with files checked before they become part of your
                          learning workspace.
                      </p>


                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-pink-500">
                        <button
                          type="button"
                          onClick={() => handleNavigation("upload")}
                          className="..."
                        >
                          Build your library
                        </button>
                        <span className="group-hover:translate-x-1 transition-transform">
                            →
                        </span>
                      </div>

                    </div>


                    {/* STEP 2 */}

                    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300">

                      <div className="flex items-start justify-between">

                        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">

                          <Brain
                              size={21}
                              className="text-purple-500"
                          />

                        </div>

                        <span className="text-3xl font-bold text-slate-100 dark:text-slate-700 group-hover:text-purple-100 dark:group-hover:text-purple-900/40 transition">
                            02
                        </span>

                      </div>


                      <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                          Understand
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          Ask PinkNotes AI to explain concepts, answer doubts,
                          simplify difficult topics or work with selected
                          study material.
                      </p>


                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-purple-500">
                        <button
                          type="button"
                          onClick={() => handleNavigation("ai-solver")}
                          className="..."
                        >
                          Learn with AI
                        </button>
        
                        <span className="group-hover:translate-x-1 transition-transform">
                            →
                        </span>
                      </div>

                    </div>


                    {/* STEP 3 */}

                    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">

                      <div className="flex items-start justify-between">

                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">

                          <FileQuestion
                              size={21}
                              className="text-indigo-500"
                          />

                        </div>

                        <span className="text-3xl font-bold text-slate-100 dark:text-slate-700 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/40 transition">
                            03
                        </span>

                      </div>


                      <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                          Practice
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          Generate quizzes by subject, topic, difficulty or
                          approved notes and test whether you actually
                          understand the material.
                      </p>


                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500">
                          <button
                            type="button"
                            onClick={() => handleNavigation("quiz")}
                            className="..."
                          >
                            Start practicing
                          </button>
                        <span className="group-hover:translate-x-1 transition-transform">
                            →
                        </span>
                      </div>

                    </div>


                    {/* STEP 4 */}

                    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300">

                      <div className="flex items-start justify-between">

                        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">

                          <TrendingUp
                              size={21}
                              className="text-emerald-500"
                          />

                        </div>

                        <span className="text-3xl font-bold text-slate-100 dark:text-slate-700 group-hover:text-emerald-100 dark:group-hover:text-emerald-900/40 transition">
                            04
                        </span>

                      </div>


                      <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                          Improve
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          Use your quiz scores, accuracy and topic performance
                          to understand where you are improving and where
                          more practice is needed.
                      </p>


                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                          <button
                            type="button"
                            onClick={() => handleNavigation("dashboard")}
                            className="..."
                          >
                            View progress
                          </button>
                        <span className="group-hover:translate-x-1 transition-transform">
                            →
                        </span>
                      </div>

                    </div>

                  </div>

                </section>


                {/* =========================
                      WHY PINKNOTES
                ========================= */}

                <section>

                  <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 p-7 sm:p-9">

                    {/* Decorative glow */}

                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />

                    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl" />


                    <div className="relative">

                      <div className="max-w-2xl">

                        <p className="text-sm font-semibold text-pink-300 uppercase tracking-wider">
                            Why PinkNotes?
                        </p>

                        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                            More than a place to store notes.
                        </h2>

                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
                            PinkNotes connects academic resources, AI assistance,
                            assessment and performance insights into one learning
                            loop instead of treating them as separate tools.
                        </p>

                      </div>


                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">


                        {/* DIFFERENTIATOR 1 */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                          <div className="flex items-start gap-4">

                            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center flex-shrink-0">

                              <Brain
                                  size={19}
                                  className="text-pink-300"
                              />

                            </div>

                            <div>

                              <h3 className="font-semibold text-white">
                                  Context-aware AI
                              </h3>

                              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                                  The AI can work with selected academic material
                                  rather than functioning only as a generic chatbot.
                              </p>

                            </div>

                          </div>

                        </div>


                        {/* DIFFERENTIATOR 2 */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                          <div className="flex items-start gap-4">

                            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">

                              <Award
                                  size={19}
                                  className="text-purple-300"
                              />

                            </div>

                            <div>

                              <h3 className="font-semibold text-white">
                                  Intelligent assessment
                              </h3>

                              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                                  Quizzes can be generated around subjects, topics,
                                  difficulty levels and study material.
                              </p>

                            </div>

                          </div>

                        </div>


                        {/* DIFFERENTIATOR 3 */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                          <div className="flex items-start gap-4">

                            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">

                                <BookOpen
                                  size={19}
                                  className="text-indigo-300"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-white">
                                  Curated academic resources
                                </h3>

                                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                                  Uploaded material goes through validation before
                                  being treated as approved learning content.
                                </p>

                            </div>

                          </div>

                        </div>


                        {/* DIFFERENTIATOR 4 */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                          <div className="flex items-start gap-4">

                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">

                                <TrendingUp
                                  size={19}
                                  className="text-emerald-300"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-white">
                                  Learning intelligence
                                </h3>

                                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                                  Quiz performance becomes useful learning data
                                  that can eventually drive personalized guidance.
                                </p>

                            </div>

                          </div>

                        </div>


                      </div>


                      {/* Bottom statement */}

                      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                          <p className="text-sm text-slate-400">
                            Learn → Understand → Practice → Improve
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleNavigation("quiz")
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition"
                          >
                            Start practicing
                            <span>
                              →
                            </span>
                          </button>

                      </div>

                    </div>

                  </div>

                </section>

                {/*LearningToday*/}

                <section className="mt-6">
                  <LearningToday
                    onPracticeTopic={handlePracticeTopic}
                  />
                </section>


                {/* =========================
                    USER ANALYTICS
                ========================= */}

                <section>

                  <UserStats 
                   onPracticeTopic={handlePracticeTopic}
                  />

                </section>


                {/* =========================
                    NOTES OVERVIEW
                ========================= */}

                <section>

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Notes Overview
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Your uploaded learning resources
                      </p>

                    </div>

                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                    {/* Total Notes */}

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

                          <BookOpen className="w-5 h-5 text-blue-500" />

                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Total Notes
                          </p>

                          <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            {notes.length}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Approved */}

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">

                          <BookOpen className="w-5 h-5 text-green-500" />

                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Approved
                          </p>

                          <p className="text-2xl font-bold text-slate-800 dark:text-white">

                            {
                              notes.filter(
                                (note) =>
                                  note.status ===
                                  "approved"
                              ).length
                            }

                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Under Review */}

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">

                          <FileQuestion className="w-5 h-5 text-yellow-500" />

                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Under Review
                          </p>

                          <p className="text-2xl font-bold text-slate-800 dark:text-white">

                            {
                              notes.filter(
                                (note) =>
                                  note.status ===
                                    "pending" ||
                                  note.status ===
                                    "flagged"
                              ).length
                            }

                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Add Notes */}

                    <button
                      onClick={() =>
                        handleNavigation("upload")
                      }
                      className="bg-white dark:bg-slate-800 border border-dashed border-pink-300 dark:border-pink-700 rounded-2xl p-5 text-left hover:border-pink-500 hover:shadow-md transition"
                      type="button"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">

                          <Upload className="w-5 h-5 text-pink-500" />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            Add Notes
                          </p>

                          <p className="text-xs text-slate-400">
                            Upload a new resource
                          </p>

                        </div>

                      </div>

                    </button>

                  </div>

                </section>


                {/* =========================
                    RECENT ACTIVITY
                ========================= */}

                <section>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                    <RecentActivity />


                    {/* Keep Learning */}

                    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-pink-100 dark:border-slate-700 rounded-3xl p-6">


                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">

                          <Brain
                            size={20}
                            className="text-white"
                          />

                        </div>

                        <div>

                          <h3 className="font-bold text-slate-800 dark:text-white">
                            Keep Learning
                          </h3>

                          <p className="text-xs text-slate-400 mt-1">
                            Make every quiz count.
                          </p>

                        </div>

                      </div>


                      <div className="mt-6 space-y-4">


                        {/* Practice */}

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">

                            <FileQuestion
                              size={16}
                              className="text-purple-500"
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Practice consistently
                            </p>

                            <p className="text-xs text-slate-400">
                              Generate topic-specific
                              quizzes to strengthen
                              weak areas.
                            </p>

                          </div>

                        </div>


                        {/* Performance */}

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">

                            <Target
                              size={16}
                              className="text-pink-500"
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Review your performance
                            </p>

                            <p className="text-xs text-slate-400">
                              Use your analytics to
                              identify areas that
                              need more practice.
                            </p>

                          </div>

                        </div>


                        <button
                          onClick={() =>
                            handleNavigation("quiz")
                          }
                          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-pink-200/50 transition"
                          type="button"
                        >
                          Start a New Quiz
                        </button>

                      </div>

                    </div>

                  </div>

                </section>


                {/* =========================
                    AI + QUIZ
                ========================= */}

                <section>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                    <AIDoubtSolver
                      selectedNote={selectedNote}
                      onClearNote={() => setSelectedNote(null)}
                    />

                    <Quiz
                      initialNote={quizNote}
                      initialTopic={practiceTopic}
                      initialTopicSubject={practiceTopicSubject}
                      initialTopicType={practiceTopicType}
                    />

                  </div>

                </section>


                {/* =========================
                    BROWSE NOTES
                ========================= */}

                <section>

                  <BrowseNotes
                    notes={notes}
                    loading={loading}
                    onGenerateQuiz={
                      handleGenerateQuiz
                    }
                    onOpenNote={handleOpenNote}
                  />

                </section>

              </div>

            )}


            {/* =========================
                UPLOAD
            ========================= */}

            {activeTab === "upload" && (

              <div className="max-w-4xl mx-auto">

                <UploadNotes
                  onUploadSuccess={fetchNotes}
                />

              </div>

            )}


            {/* =========================
                BROWSE
            ========================= */}

            {activeTab === "browse" && (

              <div>

                <BrowseNotes
                  notes={notes}
                  loading={loading}
                  onGenerateQuiz={
                    handleGenerateQuiz
                  }
                  onOpenNote={handleOpenNote}
                />

              </div>

            )}

            {activeTab === "note-detail" && selectedNote && (
              <NoteDetail
                noteId={selectedNote.id}
                onBack={handleBackToNotes}
                onGenerateQuiz={handleGenerateQuiz}
                onAskAI={handleAskAI}
              />
            )}

            {activeTab === "bookmarks" && (
              <div className="max-w-6xl mx-auto">
                <Bookmarks
                  onOpenNote={handleOpenNote}
                  onGenerateQuiz={handleGenerateQuiz}
                />
              </div>
            )}


            {/* =========================
                AI SOLVER
            ========================= */}

            {activeTab === "ai-solver" && (

              <div className="max-w-4xl mx-auto">

                <AIDoubtSolver
                  selectedNote={selectedNote}
                  onClearNote={() => setSelectedNote(null)}
                />

              </div>

            )}


            {/* =========================
                QUIZ
            ========================= */}

            {activeTab === "quiz" && (

              <div className="max-w-5xl mx-auto">

                <Quiz
                  initialNote={quizNote}
                  initialTopic={practiceTopic}
                  initialTopicSubject={practiceTopicSubject}
                  initialTopicType={practiceTopicType}
                />

              </div>

            )}


            {/* =========================
                QUIZ HISTORY
            ========================= */}

            {activeTab === "quiz-history" && (

              <div className="max-w-5xl mx-auto">

                <QuizHistory />

              </div>

            )}


          </main>

        </div>


        {/* =========================
            MOBILE OVERLAY
        ========================= */}

        {sidebarOpen && (

          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

        )}

      </div>

    </div>
  );
}


export default App;