import React from "react";

import {
  Flame,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";


function LearningToday({
  stats,
  onPracticeTopic,
}) {

  const completedQuizzes =
    stats?.completed_quizzes ?? 0;

  const learningInsights =
    stats?.learning_insights || {};

  const recommended =
    learningInsights.recommended_topic;

  const streak =
    stats?.streak || {};

  const currentStreak =
    streak.current ?? 0;

  const activeDaysLast7 =
    streak.active_days_last_7 ?? 0;

  const longestStreak =
    streak.longest ?? 0;

  const streakMessage =
    streak.message ||
    "Complete a quiz to start your streak.";


  // ------------------------------------------
  // NO ACTIVITY YET
  // ------------------------------------------

  if (completedQuizzes === 0) {

    return (
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-indigo-500/10 dark:via-slate-800 dark:to-pink-500/10 p-5 sm:p-6">

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">

            <Sparkles
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              Your Learning Today
            </p>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
              Start your first quiz
            </h3>

            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 mt-1">
              Complete a quiz to start building your learning history,
              personalized insights and study streak.
            </p>

          </div>

        </div>

      </section>
    );

  }


  // ------------------------------------------
  // NORMAL PERSONALIZED STATE
  // ------------------------------------------

  return (

    <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
            Your Learning Today
          </p>

          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
            Keep your momentum going
          </h3>

        </div>

        <Sparkles
          size={19}
          className="text-pink-500 shrink-0"
        />

      </div>


      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">


        {/* --------------------------------------
            STREAK
        -------------------------------------- */}

        <div className="rounded-2xl border border-orange-100 dark:border-orange-500/20 bg-orange-50/60 dark:bg-orange-500/10 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">

              <Flame
                size={18}
                className="text-white"
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Current streak
              </p>

              <p className="text-xl font-extrabold text-slate-800 dark:text-white">
                {currentStreak}{" "}
                {currentStreak === 1
                  ? "day"
                  : "days"}
              </p>

            </div>

          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {streakMessage}
          </p>

        </div>


        {/* --------------------------------------
            RECOMMENDATION
        -------------------------------------- */}

        <div className="rounded-2xl border border-pink-100 dark:border-pink-500/20 bg-pink-50/50 dark:bg-pink-500/10 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center">

              <Target
                size={18}
                className="text-white"
              />

            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Recommended practice
              </p>

              <p className="font-extrabold text-slate-800 dark:text-white truncate">

                {recommended?.name ||
                  "Keep exploring"}

              </p>

            </div>

          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">

            {recommended
              ? `${recommended.percentage}% current accuracy`
              : "Complete more quizzes to personalize this."}

          </p>

        </div>


        {/* --------------------------------------
            WEEKLY ACTIVITY
        -------------------------------------- */}

        <div className="rounded-2xl border border-purple-100 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/10 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">

              <BookOpen
                size={18}
                className="text-white"
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Activity
              </p>

              <p className="text-xl font-extrabold text-slate-800 dark:text-white">
                {activeDaysLast7}
                <span className="text-sm font-semibold text-slate-400">
                  {" "}days
                </span>
              </p>

            </div>

          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Active in the last 7 days · Best streak {longestStreak}
          </p>

        </div>

      </div>


      {/* ACTION */}

      {recommended && onPracticeTopic && (

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Ready for another round?
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Practice {recommended.name} based on your recent performance.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                onPracticeTopic(recommended)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md"
            >

              Practice now

              <ArrowRight
                size={16}
              />

            </button>

          </div>

        </div>

      )}

    </section>

  );
}


export default LearningToday;