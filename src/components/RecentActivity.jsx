import React, { useEffect, useState } from "react";

import {
  Upload,
  FileQuestion,
  CheckCircle2,
  Activity,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../supabase.js";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";

function RecentActivity() {
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD ACTIVITY
  // ==========================================

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError("");

      // ----------------------------------------
      // NOTES
      // ----------------------------------------

      const {
        data: notes,
        error: notesError,
      } = await supabase
        .from("notes")
        .select(
          "id,title,subject,status,created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(8);

      if (notesError) {
        throw notesError;
      }

      // ----------------------------------------
      // QUIZZES
      // ----------------------------------------

      const {
        data: quizzes,
        error: quizzesError,
      } = await supabase
        .from("quizzes")
        .select(
          "id,title,subject,topic,score,question_count,completed,created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(8);

      if (quizzesError) {
        throw quizzesError;
      }

      // ========================================
      // CONVERT NOTES INTO ACTIVITIES
      // ========================================

      const noteActivities =
        (notes || []).map((note) => ({
          id: `note-${note.id}`,

          type: "note",

          title:
            note.status === "approved"
              ? "Note uploaded"
              : "Note submitted",

          description:
            note.title ||
            note.file_name ||
            "Study material",

          subject:
            note.subject || "",

          status: note.status,

          date: note.created_at,
        }));

      // ========================================
      // CONVERT QUIZZES INTO ACTIVITIES
      // ========================================

      const quizActivities =
        (quizzes || []).map((quiz) => {
          const percentage =
            quiz.completed &&
            quiz.question_count
              ? Math.round(
                  ((quiz.score || 0) /
                    quiz.question_count) *
                    100
                )
              : null;

          return {
            id: `quiz-${quiz.id}`,

            type: quiz.completed
              ? "quiz_completed"
              : "quiz_generated",

            title: quiz.completed
              ? "Quiz completed"
              : "Quiz generated",

            description:
              quiz.title ||
              quiz.subject ||
              "AI Quiz",

            subject:
              quiz.topic ||
              quiz.subject ||
              "",

            percentage,

            date: quiz.created_at,
          };
        });

      // ========================================
      // COMBINE + SORT
      // ========================================

      const combined = [
        ...noteActivities,
        ...quizActivities,
      ]
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .slice(0, 6);

      setActivities(combined);

    } catch (error) {
      console.error(
        "Recent activity error:",
        error
      );

      setActivities([]);

      setError(
        "We couldn't load your recent learning activity right now."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  // ==========================================
  // TIME AGO
  // ==========================================

  const getTimeAgo = (date) => {
    const now = new Date();

    const activityDate =
      new Date(date);

    const difference =
      Math.floor(
        (now - activityDate) / 1000
      );

    if (Number.isNaN(difference)) {
      return "Recently";
    }

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      const minutes =
        Math.floor(
          difference / 60
        );

      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    if (difference < 86400) {
      const hours =
        Math.floor(
          difference / 3600
        );

      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    if (difference < 604800) {
      const days =
        Math.floor(
          difference / 86400
        );

      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return activityDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  // ==========================================
  // ICON
  // ==========================================

  const getActivityIcon = (activity) => {
    if (activity.type === "note") {
      return (
        <Upload
          size={17}
          className="text-white"
        />
      );
    }

    if (
      activity.type ===
      "quiz_completed"
    ) {
      return (
        <CheckCircle2
          size={17}
          className="text-white"
        />
      );
    }

    return (
      <FileQuestion
        size={17}
        className="text-white"
      />
    );
  };

  // ==========================================
  // ICON BACKGROUND
  // ==========================================

  const getIconBackground = (activity) => {
    if (activity.type === "note") {
      return "bg-gradient-to-br from-blue-500 to-cyan-500";
    }

    if (
      activity.type ===
      "quiz_completed"
    ) {
      return "bg-gradient-to-br from-emerald-500 to-teal-500";
    }

    return "bg-gradient-to-br from-pink-500 to-purple-600";
  };

  // ==========================================
  // SHARED CONTAINER
  // ==========================================

  const ActivityContainer = ({
    children,
  }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-2">

          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">

            <Activity
              size={18}
              className="text-pink-500"
            />

          </div>

          <div>

            <h3 className="font-bold text-slate-800 dark:text-white">
              Recent Learning Activity
            </h3>

            <p className="text-xs text-slate-400 mt-0.5">
              Your latest activity on PinkNotes
            </p>

          </div>

        </div>

        <button
          onClick={loadActivity}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          type="button"
          title="Refresh activity"
          aria-label="Refresh activity"
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin text-pink-500"
                : "text-slate-400"
            }
          />
        </button>

      </div>

      {children}
    </div>
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <ActivityContainer>
        <LoadingState
          message="Loading your recent activity..."
          compact
        />
      </ActivityContainer>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <ActivityContainer>
        <ErrorState
          title="Couldn't load recent activity"
          description={error}
          onRetry={loadActivity}
        />
      </ActivityContainer>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (activities.length === 0) {
    return (
      <ActivityContainer>
        <EmptyState
          icon={Activity}
          title="No recent activity yet"
          description="Upload notes or generate a quiz to start building your learning history."
        />
      </ActivityContainer>
    );
  }

  // ==========================================
  // ACTIVITY LIST
  // ==========================================

  return (
    <ActivityContainer>

      <div className="space-y-1">

        {activities.map((activity) => (

          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
          >

            {/* ICON */}

            <div
              className={`w-9 h-9 rounded-xl ${getIconBackground(
                activity
              )} flex items-center justify-center shrink-0`}
            >
              {getActivityIcon(
                activity
              )}
            </div>

            {/* CONTENT */}

            <div className="flex-1 min-w-0">

              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {activity.title}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {activity.description}
                  </p>

                </div>

                {activity.percentage !==
                  null &&
                  activity.percentage !==
                    undefined && (

                    <span
                      className={`text-sm font-bold shrink-0 ${
                        activity.percentage >=
                        80
                          ? "text-emerald-500"
                          : activity.percentage >=
                            60
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {activity.percentage}%
                    </span>

                  )}

              </div>

              <div className="flex items-center gap-2 mt-1">

                {activity.subject && (
                  <>
                    <span className="text-xs text-pink-500 font-medium truncate max-w-[180px]">
                      {activity.subject}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>
                  </>
                )}

                <span className="text-xs text-slate-400">
                  {getTimeAgo(
                    activity.date
                  )}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </ActivityContainer>
  );
}

export default RecentActivity;