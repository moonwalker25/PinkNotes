import React, { useEffect, useState } from "react";

import {
  Brain,
  CheckCircle2,
  FileQuestion,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  ArrowRight,
  Compass,
  Flame,
} from "lucide-react";

import API from "../services/api";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";


function UserStats({ onPracticeTopic }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD STATS
  // ==========================================

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/api/quiz/stats");

      const data = response.data?.stats || null;

      setStats(data);
    } catch (error) {
      console.error("Stats error:", error);

      setStats(null);

      setError(
        error.response?.data?.detail ||
          "We couldn't load your learning analytics right now."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadStats();
  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">
        <LoadingState message="Loading your learning analytics..." />
      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">
        <ErrorState
          title="Couldn't load your analytics"
          description={error}
          onRetry={loadStats}
        />
      </div>
    );
  }


  // ==========================================
  // NO DATA
  // ==========================================

  if (!stats) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">
        <EmptyState
          icon={BarChart3}
          title="Your analytics are waiting"
          description="Complete your first quiz to start building your learning analytics and performance insights."
        />
      </div>
    );
  }


  // ==========================================
  // STAT CARDS
  // ==========================================

  const statCards = [
    {
      label: "Quizzes Generated",
      value: stats.total_quizzes ?? 0,
      description: "AI quizzes created",
      icon: Brain,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      label: "Completed",
      value: stats.completed_quizzes ?? 0,
      description: "Quizzes finished",
      icon: CheckCircle2,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      label: "Average Score",
      value: `${stats.average_score ?? 0}%`,
      description: "Average across quizzes",
      icon: TrendingUp,
      gradient: "from-violet-500 to-fuchsia-500",
    },
    {
      label: "Best Score",
      value: `${stats.best_score ?? 0}%`,
      description: "Your highest performance",
      icon: Trophy,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: "Accuracy",
      value: `${stats.accuracy ?? 0}%`,
      description: `${stats.total_correct ?? 0} correct answers`,
      icon: Target,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Questions Answered",
      value: stats.total_questions ?? 0,
      description: "Across completed quizzes",
      icon: FileQuestion,
      gradient: "from-blue-500 to-cyan-500",
    },
  ];


  // ==========================================
  // PERFORMANCE DATA
  // ==========================================

  const scoreHistory = stats.score_history || [];
  const subjectPerformance = stats.subject_performance || [];


  // ==========================================
  // LEARNING INSIGHTS
  // ==========================================

  const strongestArea = stats.strongest_area;
  const focusArea = stats.focus_area;

  const learningInsights = stats.learning_insights || {};

  const focusAreas = learningInsights.focus_areas || [];
  const strongAreas = learningInsights.strong_areas || [];

  const rawRecommendedTopic =
      learningInsights.recommended_topic || null;

  const recommendedTopic = rawRecommendedTopic
      ? {
          ...rawRecommendedTopic,
          name:
            rawRecommendedTopic.name ||
            rawRecommendedTopic.topic ||
            rawRecommendedTopic.subject ||
            "",
        }
      : null;


  // ==========================================
  // STREAK
  // ==========================================

  const streak = stats.streak || {};

  const currentStreak = streak.current ?? 0;
  const longestStreak = streak.longest ?? 0;
  const activeDaysLast7 = streak.active_days_last_7 ?? 0;
  const lastActivity = streak.last_activity;

  const streakMessage =
    streak.message ||
    "Complete a quiz to start your streak.";


  // ==========================================
  // GENERAL STATE
  // ==========================================

  const hasCompletedQuizzes =
    (stats.completed_quizzes || 0) > 0;


  // ==========================================
  // PRACTICE HANDLER
  // ==========================================

  const handlePractice = () => {
    if (!recommendedTopic?.name || !onPracticeTopic) {
      return;
    }

    onPracticeTopic(recommendedTopic);
  };


  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="space-y-7">


      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <div>
        <div className="flex items-center gap-2">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <BarChart3
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
              Your Learning Analytics
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              See how your quiz performance is evolving.
            </p>
          </div>

        </div>
      </div>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/30 dark:hover:shadow-none transition-all duration-200"
            >

              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
              >
                <Icon
                  size={20}
                  className="text-white"
                />
              </div>

              <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">
                {stat.value}
              </p>

              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {stat.label}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {stat.description}
              </p>

            </div>
          );
        })}

      </div>


      {/* =================================================
          LEARNING STREAK
      ================================================= */}

      <div className="relative overflow-hidden rounded-3xl border border-orange-100 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-orange-500/10 dark:via-slate-800 dark:to-pink-500/10 p-5 sm:p-6">

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* LEFT */}

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm">
              <Flame
                size={23}
                className="text-white"
              />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="font-extrabold text-slate-800 dark:text-white">
                  Learning Streak
                </h3>

                {currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">

                    <Flame size={11} />

                    Active

                  </span>
                )}

              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {streakMessage}
              </p>

            </div>

          </div>


          {/* STREAK STATS */}

          <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">

            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-white dark:border-slate-700 p-3 text-center">

              <p className="text-2xl font-extrabold text-orange-500">
                {currentStreak}
              </p>

              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mt-1">
                Current
              </p>

            </div>


            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-white dark:border-slate-700 p-3 text-center">

              <p className="text-2xl font-extrabold text-pink-500">
                {activeDaysLast7}
              </p>

              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mt-1">
                Last 7 days
              </p>

            </div>


            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-white dark:border-slate-700 p-3 text-center">

              <p className="text-2xl font-extrabold text-purple-500">
                {longestStreak}
              </p>

              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mt-1">
                Longest
              </p>

            </div>

          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div className="relative mt-5 pt-4 border-t border-orange-100/80 dark:border-slate-700">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <p className="text-xs text-slate-400">

              {lastActivity
                ? `Last quiz completed ${new Date(
                    lastActivity
                  ).toLocaleDateString(
                    undefined,
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}`
                : "Complete a quiz to begin tracking your streak."}

            </p>

            {currentStreak === 0 && (
              <p className="text-xs font-semibold text-orange-500">
                Complete a quiz today to start your streak.
              </p>
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          FIRST QUIZ MESSAGE
      ================================================= */}

      {!hasCompletedQuizzes && (

        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/10 p-4">

          <div className="flex items-start gap-3">

            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">

              <Sparkles
                size={17}
                className="text-indigo-600 dark:text-indigo-400"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                Complete a quiz to unlock deeper insights
              </p>

              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1 leading-5">
                Your performance trend, subject accuracy and personalized recommendations will become more meaningful as you complete quizzes.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          PERSONALIZED LEARNING
      ================================================= */}

      {hasCompletedQuizzes && (

        <div className="space-y-4">

          {/* HEADER */}

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">

              <Sparkles
                size={16}
                className="text-pink-500"
              />

            </div>

            <div>

              <h3 className="font-bold text-slate-800 dark:text-white">
                Personalized Learning
              </h3>

              <p className="text-xs text-slate-400 mt-0.5">
                Based on your completed quiz performance
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


            {/* ==========================================
                FOCUS AREAS
            ========================================== */}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h4 className="font-bold text-slate-800 dark:text-white">
                    Focus areas
                  </h4>

                  <p className="text-xs text-slate-400 mt-1">
                    Topics where additional practice may help
                  </p>

                </div>

                <TrendingDown
                  size={19}
                  className="text-amber-500 shrink-0"
                />

              </div>


              {focusAreas.length === 0 ? (

                <div className="mt-5">

                  <EmptyState
                    icon={Compass}
                    title="Not enough topic data yet"
                    description="Complete more topic-based quizzes to identify your strongest and weakest areas."
                    compact
                  />

                </div>

              ) : (

                <div className="mt-6 space-y-5">

                  {focusAreas.map((item) => {

                    const percentage =
                      item.percentage ?? 0;

                    return (

                      <div key={item.topic}>

                        <div className="flex items-center justify-between mb-2">

                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate pr-3">
                            {item.topic}
                          </span>

                          <span
                            className={`text-sm font-bold ${
                              percentage >= 80
                                ? "text-emerald-500"
                                : percentage >= 60
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {percentage}%
                          </span>

                        </div>


                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                            }}
                          />

                        </div>


                        <p className="text-[11px] text-slate-400 mt-1">

                          {item.quizzes ?? 0}{" "}
                          {item.quizzes === 1
                            ? "quiz"
                            : "quizzes"}

                          {" · "}

                          {item.questions ?? 0}{" "}
                          questions

                        </p>

                      </div>

                    );

                  })}

                </div>

              )}

            </div>


            {/* ==========================================
                RECOMMENDED PRACTICE
            ========================================== */}

            <div className="relative overflow-hidden rounded-3xl border border-pink-100 dark:border-pink-500/20 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-500/10 dark:via-slate-800 dark:to-purple-500/10 p-5 sm:p-6">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                    Recommended next
                  </span>

                  <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-2">

                    {recommendedTopic
                      ? `Strengthen ${recommendedTopic.name}`
                      : "Keep building your skills"}

                  </h4>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-6">

                    {recommendedTopic
                      ? recommendedTopic.reason
                      : "Complete more topic-based quizzes and PinkNotes will personalize your practice recommendations."}

                  </p>

                </div>


                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-pink-500/20 flex items-center justify-center shrink-0 shadow-sm">

                  <Target
                    size={18}
                    className="text-pink-500"
                  />

                </div>

              </div>


              {recommendedTopic && (

                <>

                  {/* RECOMMENDATION STATS */}

                  <div className="mt-5 rounded-2xl border border-white/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Current accuracy
                        </p>

                        <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                          {recommendedTopic.percentage ?? 0}%
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Practice history
                        </p>

                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">

                          {recommendedTopic.quizzes ?? 0}{" "}
                          {recommendedTopic.quizzes === 1
                            ? "quiz"
                            : "quizzes"}

                        </p>

                      </div>

                    </div>


                    {/* PRACTICE BUTTON */}

                    <button
                      type="button"
                      onClick={handlePractice}
                      disabled={!onPracticeTopic}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      Practice {recommendedTopic.name}

                      <ArrowRight
                        size={16}
                      />

                    </button>

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          PERFORMANCE OVERVIEW
      ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


        {/* ===============================================
            SCORE TREND
        =============================================== */}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-bold text-slate-800 dark:text-white">
                Performance Trend
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Your completed quiz scores
              </p>

            </div>

            <TrendingUp
              size={20}
              className="text-pink-500"
            />

          </div>


          {scoreHistory.length === 0 ? (

            <EmptyState
              icon={TrendingUp}
              title="No performance trend yet"
              description="Complete a quiz to start tracking how your scores change over time."
            />

          ) : (

            <div className="mt-6 space-y-4">

              {scoreHistory
                .slice(-6)
                .map((item, index) => (

                  <div
                    key={
                      item.id ||
                      index
                    }
                  >

                    <div className="flex items-center justify-between mb-1.5">

                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[70%]">
                        {item.topic ||
                          item.subject ||
                          "Quiz"}
                      </span>

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {item.percentage ?? 0}%
                      </span>

                    </div>


                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              item.percentage || 0
                            )
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>


        {/* ===============================================
            SUBJECT PERFORMANCE
        =============================================== */}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-bold text-slate-800 dark:text-white">
                Subject Performance
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Accuracy by subject
              </p>

            </div>

            <Target
              size={20}
              className="text-purple-500"
            />

          </div>


          {subjectPerformance.length === 0 ? (

            <EmptyState
              icon={Target}
              title="No subject data yet"
              description="Complete quizzes across different subjects to build your subject analytics."
              compact
            />

          ) : (

            <div className="mt-6 space-y-5">

              {subjectPerformance
                .slice(0, 5)
                .map((item) => {

                  const percentage =
                    item.percentage ?? 0;

                  return (

                    <div key={item.subject}>

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate pr-3">
                          {item.subject}
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            percentage >= 80
                              ? "text-emerald-500"
                              : percentage >= 60
                              ? "text-amber-500"
                              : "text-red-500"
                          }`}
                        >
                          {percentage}%
                        </span>

                      </div>


                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                percentage
                              )
                            )}%`,
                          }}
                        />

                      </div>


                      <p className="text-[11px] text-slate-400 mt-1">

                        {item.quizzes ?? 0}{" "}
                        {item.quizzes === 1
                          ? "quiz"
                          : "quizzes"}

                        {" · "}

                        {item.questions ?? 0}{" "}
                        questions

                      </p>

                    </div>

                  );

                })}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          LEARNING INSIGHTS
      ================================================= */}

      {(strongestArea || focusArea) && (

        <div>

          <div className="flex items-center gap-2 mb-4">

            <Sparkles
              size={18}
              className="text-pink-500"
            />

            <h3 className="font-bold text-slate-800 dark:text-white">
              Learning Insights
            </h3>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            {/* STRONGEST */}

            {strongestArea && (

              <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">

                    <Trophy
                      size={19}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide font-bold text-emerald-600 dark:text-emerald-400">
                      Strongest Area
                    </p>

                    <h4 className="font-bold text-slate-800 dark:text-white mt-1">

                      {strongestArea.topic ||
                        strongestArea.subject ||
                        "—"}

                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">

                      You're averaging{" "}

                      <strong>
                        {strongestArea.percentage ?? 0}%
                      </strong>{" "}

                      here.

                    </p>

                  </div>

                </div>

              </div>

            )}


            {/* FOCUS */}

            {focusArea && (

              <div className="relative overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 p-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">

                    <TrendingDown
                      size={19}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide font-bold text-amber-600 dark:text-amber-400">
                      Focus Area
                    </p>

                    <h4 className="font-bold text-slate-800 dark:text-white mt-1">

                      {focusArea.topic ||
                        focusArea.subject ||
                        "—"}

                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">

                      Current average:{" "}

                      <strong>
                        {focusArea.percentage ?? 0}%
                      </strong>

                      . More practice could help strengthen this area.

                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default UserStats;