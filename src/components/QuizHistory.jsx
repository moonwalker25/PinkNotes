import React, { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  Calendar,
  Clock3,
  FileQuestion,
  Search,
  Sparkles,
  Target,
  Trophy,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import API from "../services/api";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";

function QuizHistory({
  limit = null,
  onViewAll = null,
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // =========================
  // LOAD HISTORY
  // =========================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/api/quiz/history");

      setQuizzes(
        response.data?.quizzes || []
      );
    } catch (error) {
      console.error(
        "Quiz history error:",
        error
      );

      setQuizzes([]);

      setError(
        error.response?.data?.detail ||
          "We couldn't load your quiz history right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // =========================
  // SCORE
  // =========================

  const getPercentage = (quiz) => {
    if (
      !quiz.completed ||
      !quiz.question_count
    ) {
      return null;
    }

    return Math.round(
      ((quiz.score || 0) /
        quiz.question_count) *
        100
    );
  };

  // =========================
  // SCORE COLOR
  // =========================

  const getScoreColor = (percentage) => {
    if (percentage === null) {
      return "text-slate-400";
    }

    if (percentage >= 80) {
      return "text-emerald-500";
    }

    if (percentage >= 60) {
      return "text-amber-500";
    }

    return "text-red-500";
  };

  // =========================
  // SCORE LABEL
  // =========================

  const getScoreLabel = (percentage) => {
    if (percentage === null) {
      return "Not attempted";
    }

    if (percentage >= 80) {
      return "Excellent";
    }

    if (percentage >= 60) {
      return "Good progress";
    }

    return "Keep practicing";
  };

  // =========================
  // SOURCE LABEL
  // =========================

  const getSourceLabel = (quiz) => {
    if (quiz.topic) {
      return "Specific Topic";
    }

    if (quiz.source_type === "my_note") {
      return "My Note";
    }

    if (quiz.source_type === "browse_note") {
      return "Browse Note";
    }

    return "Entire Subject";
  };

  // =========================
  // SOURCE COLOR
  // =========================

  const getSourceColor = (quiz) => {
    if (quiz.topic) {
      return "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400";
    }

    if (quiz.source_type === "my_note") {
      return "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
    }

    if (quiz.source_type === "browse_note") {
      return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    }

    return "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400";
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // FILTER + SORT
  // =========================

  const filteredQuizzes = useMemo(() => {
    let result = [...quizzes];

    // Search
    if (search.trim()) {
      const query =
        search.toLowerCase().trim();

      result = result.filter((quiz) => {
        return (
          quiz.title
            ?.toLowerCase()
            .includes(query) ||
          quiz.subject
            ?.toLowerCase()
            .includes(query) ||
          quiz.topic
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    // Status
    if (statusFilter === "completed") {
      result = result.filter(
        (quiz) => quiz.completed
      );
    }

    if (statusFilter === "pending") {
      result = result.filter(
        (quiz) => !quiz.completed
      );
    }

    // Difficulty
    if (difficultyFilter !== "all") {
      result = result.filter(
        (quiz) =>
          quiz.difficulty ===
          difficultyFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at) -
          new Date(b.created_at)
        );
      }

      if (sortBy === "highest") {
        return (
          (getPercentage(b) ?? -1) -
          (getPercentage(a) ?? -1)
        );
      }

      if (sortBy === "lowest") {
        return (
          (getPercentage(a) ?? 101) -
          (getPercentage(b) ?? 101)
        );
      }

      return 0;
    });

    return result;
  }, [
    quizzes,
    search,
    statusFilter,
    difficultyFilter,
    sortBy,
  ]);

  // =========================
  // DASHBOARD LIMIT
  // =========================

  const displayedQuizzes =
    limit !== null
      ? filteredQuizzes.slice(0, limit)
      : filteredQuizzes;

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    difficultyFilter !== "all";

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setSortBy("newest");
  };

  // =========================
  // SHARED HEADER
  // =========================

  const HistoryHeader = ({
    compact = false,
  }) => (
    <div
      className={`flex ${
        compact
          ? "items-center"
          : "flex-col sm:flex-row sm:items-center"
      } justify-between gap-4`}
    >
      <div>
        <div className="flex items-center gap-2">

          <div
            className={`${
              compact
                ? "w-9 h-9 rounded-xl"
                : "w-10 h-10 rounded-xl"
            } bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-sm`}
          >
            <Trophy
              size={compact ? 18 : 20}
              className="text-white"
            />
          </div>

          <div>
            <h2
              className={`${
                compact
                  ? "text-base"
                  : "text-2xl"
              } font-extrabold text-slate-800 dark:text-white`}
            >
              Quiz History
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track your learning journey.
            </p>
          </div>

        </div>
      </div>

      <button
        onClick={loadHistory}
        className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        type="button"
        title="Refresh history"
        aria-label="Refresh quiz history"
        disabled={loading}
      >
        <RefreshCw
          size={18}
          className={
            loading
              ? "animate-spin text-pink-500"
              : "text-slate-600 dark:text-slate-300"
          }
        />
      </button>
    </div>
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="space-y-6">

        <HistoryHeader />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">
          <LoadingState
            message="Loading your quiz history..."
          />
        </div>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="space-y-6">

        <HistoryHeader />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">

          <ErrorState
            title="Couldn't load quiz history"
            description={error}
            onRetry={loadHistory}
          />

        </div>

      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <HistoryHeader />

      {/* =====================================================
          FILTERS
      ===================================================== */}

      {limit === null &&
        quizzes.length > 0 && (

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <SlidersHorizontal
                  size={17}
                  className="text-pink-500"
                />

                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Filter & sort
                </p>

              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  type="button"
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Clear filters
                </button>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Search */}

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-500/10"
                />

              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-pink-400"
              >
                <option value="all">
                  All Status
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="pending">
                  Not Completed
                </option>
              </select>

              {/* Difficulty */}

              <select
                value={difficultyFilter}
                onChange={(e) =>
                  setDifficultyFilter(
                    e.target.value
                  )
                }
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-pink-400"
              >
                <option value="all">
                  All Difficulties
                </option>

                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>

                <option value="mixed">
                  Mixed
                </option>
              </select>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-pink-400"
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="highest">
                  Highest Score
                </option>

                <option value="lowest">
                  Lowest Score
                </option>
              </select>

            </div>

            {/* Result count */}

            <div className="mt-3 text-xs text-slate-400">

              Showing{" "}
              <span className="font-semibold text-slate-500 dark:text-slate-300">
                {filteredQuizzes.length}
              </span>{" "}
              {filteredQuizzes.length === 1
                ? "quiz"
                : "quizzes"}

            </div>

          </div>
        )}

      {/* =====================================================
          DASHBOARD VIEW ALL
      ===================================================== */}

      {limit !== null &&
        quizzes.length > limit && (
          <div className="flex justify-end -mb-2">

            <button
              onClick={onViewAll}
              className="flex items-center gap-1.5 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-purple-600 transition"
              type="button"
            >
              View all history
              <ChevronRight size={16} />
            </button>

          </div>
        )}

      {/* =====================================================
          EMPTY — NO QUIZZES AT ALL
      ===================================================== */}

      {quizzes.length === 0 ? (

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">

          <EmptyState
            icon={Sparkles}
            title="No quizzes yet"
            description="Generate your first AI-powered quiz and start building your learning history."
          />

        </div>

      ) : filteredQuizzes.length === 0 ? (

        /* ===================================================
           EMPTY — FILTERED RESULTS
        =================================================== */

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl">

          <EmptyState
            icon={Search}
            title="No matching quizzes"
            description="Try changing your search or filters to find what you're looking for."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />

        </div>

      ) : (

        /* ===================================================
           QUIZ CARDS
        =================================================== */

        <div className="space-y-4">

          {displayedQuizzes.map((quiz) => {

            const percentage =
              getPercentage(quiz);

            return (

              <div
                key={quiz.id}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-100/30 dark:hover:shadow-none transition-all duration-200"
              >

                {/* =========================================
                    TOP ROW
                ========================================= */}

                <div className="flex items-start gap-4">

                  {/* Icon */}

                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 items-center justify-center shrink-0 shadow-sm">

                    <FileQuestion
                      size={22}
                      className="text-white"
                    />

                  </div>

                  {/* Main information */}

                  <div className="flex-1 min-w-0">

                    {/* Title + status */}

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-bold text-slate-800 dark:text-white truncate">
                        {quiz.title}
                      </h3>

                      {quiz.completed ? (

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">

                          <CheckCircle2 size={12} />

                          Completed

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">

                          <Clock3 size={12} />

                          Not completed

                        </span>

                      )}

                    </div>

                    {/* Metadata */}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">

                      <span className="flex items-center gap-1.5">

                        <BookOpen size={14} />

                        {quiz.subject}

                      </span>

                      {quiz.topic && (

                        <span className="flex items-center gap-1.5">

                          <Target size={14} />

                          {quiz.topic}

                        </span>

                      )}

                      <span className="flex items-center gap-1.5">

                        <FileQuestion size={14} />

                        {quiz.question_count} questions

                      </span>

                      <span className="flex items-center gap-1.5">

                        <Calendar size={14} />

                        {formatDate(
                          quiz.created_at
                        )}

                      </span>

                    </div>

                    {/* Tags */}

                    <div className="flex flex-wrap gap-2 mt-3">

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getSourceColor(
                          quiz
                        )}`}
                      >
                        {getSourceLabel(
                          quiz
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold capitalize">
                        {quiz.difficulty}
                      </span>

                    </div>

                  </div>

                  {/* Score */}

                  <div className="text-right shrink-0">

                    {percentage !== null ? (

                      <>

                        <div
                          className={`text-2xl sm:text-3xl font-extrabold ${getScoreColor(
                            percentage
                          )}`}
                        >
                          {percentage}%
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {quiz.score}/
                          {
                            quiz.question_count
                          }
                        </div>

                      </>

                    ) : (

                      <div className="text-xs text-slate-400">
                        Not attempted
                      </div>

                    )}

                  </div>

                </div>

                {/* =========================================
                    PERFORMANCE BAR
                ========================================= */}

                {percentage !== null && (

                  <div className="mt-5">

                    <div className="flex justify-between text-xs mb-2">

                      <span className="text-slate-400">
                        Performance
                      </span>

                      <span
                        className={`font-semibold ${getScoreColor(
                          percentage
                        )}`}
                      >
                        {getScoreLabel(
                          percentage
                        )}
                      </span>

                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                )}

              </div>
            );
          })}

        </div>
      )}

      {/* =====================================================
          DASHBOARD FOOTER
      ===================================================== */}

      {limit !== null &&
        quizzes.length > limit && (
          <button
            onClick={onViewAll}
            className="w-full py-3 rounded-xl border border-pink-100 dark:border-slate-700 bg-pink-50/50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-slate-700 text-sm font-semibold text-pink-600 dark:text-pink-400 transition flex items-center justify-center gap-2"
            type="button"
          >
            Explore all your quizzes
            <ChevronRight size={16} />
          </button>
        )}

    </div>
  );
}

export default QuizHistory;