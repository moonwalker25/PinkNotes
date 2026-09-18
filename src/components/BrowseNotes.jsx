import React, { useMemo, useState } from "react";

import {
  BookOpen,
  Search,
  Download,
  Clock3,
  CheckCircle2,
  Sparkles,
  FileText,
  ArrowUpDown,
  X,
  Library,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../supabase.js";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";

const BrowseNotes = ({
  notes = [],
  loading = false,
  onGenerateQuiz,
  onOpenNote,
  error = "",
  onRetry,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  // ==========================================
  // APPROVED NOTES
  // ==========================================

  const approvedNotes = useMemo(() => {
    return notes.filter(
      (note) => note.status === "approved"
    );
  }, [notes]);

  // ==========================================
  // SUBJECT LIST
  // ==========================================

  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(
        approvedNotes
          .map((note) => note.subject?.trim())
          .filter(Boolean)
      ),
    ];

    return uniqueSubjects.sort((a, b) =>
      a.localeCompare(b)
    );
  }, [approvedNotes]);

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredNotes = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    const filtered = approvedNotes.filter((note) => {
      const title =
        note.title?.toLowerCase() || "";

      const subject =
        note.subject?.toLowerCase() || "";

      const fileName =
        note.file_name?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        title.includes(search) ||
        subject.includes(search) ||
        fileName.includes(search);

      const matchesSubject =
        subjectFilter === "All" ||
        note.subject === subjectFilter;

      return (
        matchesSearch &&
        matchesSubject
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at) -
          new Date(b.created_at)
        );
      }

      if (sortBy === "title") {
        return (a.title || "").localeCompare(
          b.title || ""
        );
      }

      return (
        new Date(b.created_at) -
        new Date(a.created_at)
      );
    });
  }, [
    approvedNotes,
    searchTerm,
    subjectFilter,
    sortBy,
  ]);

  // ==========================================
  // DOWNLOAD
  // ==========================================

  const handleDownload = async (note) => {
    if (!note.file_path) {
      setDownloadError(
        "No file is available for this note."
      );

      return;
    }

    setDownloadingId(note.id);
    setDownloadError("");

    try {
      const { data, error } =
        await supabase.storage
          .from("notes")
          .createSignedUrl(
            note.file_path,
            60 * 60
          );

      if (error) {
        throw new Error(
          error.message ||
            "Unable to generate download link."
        );
      }

      if (!data?.signedUrl) {
        throw new Error(
          "No download URL was generated."
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setDownloadError(
        error.message ||
          "Unable to download this note."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // ==========================================
  // OPEN NOTE
  // ==========================================

  const handleOpenNote = (note) => {
    setDownloadError("");

    if (!note?.id) {
      setDownloadError(
        "This note cannot be opened right now."
      );

      return;
    }

    if (note.status !== "approved") {
      setDownloadError(
        "Only approved notes can be opened."
      );

      return;
    }

    if (typeof onOpenNote === "function") {
      onOpenNote(note);
    }
  };

  // ==========================================
  // GENERATE QUIZ
  // ==========================================

  const handleGenerateQuiz = (note) => {
    setDownloadError("");

    if (note.status !== "approved") {
      setDownloadError(
        "Only approved notes can be used to generate quizzes."
      );

      return;
    }

    if (!note.id) {
      setDownloadError(
        "This note cannot be used to generate a quiz."
      );

      return;
    }

    if (!note.extracted_text) {
      setDownloadError(
        "This note does not have extracted text available for quiz generation."
      );

      return;
    }

    if (typeof onGenerateQuiz === "function") {
      onGenerateQuiz(note);
    }
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("All");
    setSortBy("newest");
    setDownloadError("");
  };

  const hasFilters =
    Boolean(searchTerm.trim()) ||
    subjectFilter !== "All";

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Recently added";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently added";
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FILE TYPE
  // ==========================================

  const getFileType = (fileName = "") => {
    const extension =
      fileName.split(".").pop();

    return extension
      ? extension.toUpperCase()
      : "FILE";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-700">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">

              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Browse Notes
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore approved study resources from PinkNotes.
              </p>

            </div>

          </div>

        </div>

        <LoadingState
          message="Loading your resource library..."
        />

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-700">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">

              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Browse Notes
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore approved study resources from PinkNotes.
              </p>

            </div>

          </div>

        </div>

        <ErrorState
          title="Couldn't load your resources"
          description={error}
          onRetry={onRetry}
        />

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-700">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">

              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Browse Notes
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore approved study resources from PinkNotes.
              </p>

            </div>

          </div>

          {/* RESOURCE COUNT */}

          <div className="inline-flex self-start items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300">

            <Library className="w-4 h-4" />

            <span>
              {approvedNotes.length}{" "}
              {approvedNotes.length === 1
                ? "resource"
                : "resources"}
            </span>

          </div>

        </div>

      </div>

      {/* ======================================
          SEARCH + FILTERS
      ======================================= */}

      <div className="p-6 sm:p-7 pb-0">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />

            <input
              type="text"
              placeholder="Search by title, subject or file name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDownloadError("");
              }}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

          {/* SUBJECT */}

          <select
            value={subjectFilter}
            onChange={(e) =>
              setSubjectFilter(e.target.value)
            }
            className="lg:w-52 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
          >

            <option value="All">
              All subjects
            </option>

            {subjects.map((subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            ))}

          </select>

          {/* SORT */}

          <div className="relative">

            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="w-full lg:w-44 pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
            >

              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="title">
                Title A–Z
              </option>

            </select>

          </div>

        </div>

        {/* FILTER SUMMARY */}

        <div className="flex items-center justify-between mt-4 mb-5">

          <p className="text-xs text-slate-400">

            Showing{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {filteredNotes.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {approvedNotes.length}
            </span>{" "}
            resources

          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              Clear filters
            </button>
          )}

        </div>

      </div>

      {/* ======================================
          ACTION ERROR
      ======================================= */}

      {downloadError && (
        <div className="mx-6 sm:mx-7 mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">

          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

          <p>{downloadError}</p>

          <button
            type="button"
            onClick={() => setDownloadError("")}
            className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-200"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* ======================================
          CONTENT
      ======================================= */}

      <div className="px-6 sm:px-7 pb-7">

        {filteredNotes.length === 0 ? (

          <EmptyState
            icon={
              hasFilters
                ? Search
                : Library
            }
            title={
              hasFilters
                ? "No matching resources"
                : "Your resource library is empty"
            }
            description={
              hasFilters
                ? "Try a different search term or remove one of the filters."
                : "Approved study materials will appear here once they're uploaded."
            }
            actionLabel={
              hasFilters
                ? "Clear filters"
                : undefined
            }
            onAction={
              hasFilters
                ? clearFilters
                : undefined
            }
          />

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {filteredNotes.map((note) => (

              <div
                key={note.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 p-5 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
              >

                {/* ======================================
                    TOP
                ======================================= */}

                <div className="flex items-start gap-3">

                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">

                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">

                      {note.title ||
                        "Untitled note"}

                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">

                      {note.subject ||
                        "General"}

                    </p>

                  </div>

                </div>

                {/* ======================================
                    METADATA
                ======================================= */}

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">

                  <span className="inline-flex items-center gap-1.5">

                    <FileText className="w-3.5 h-3.5" />

                    {getFileType(
                      note.file_name
                    )}

                  </span>

                  <span className="text-slate-300 dark:text-slate-600">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">

                    <Clock3 className="w-3.5 h-3.5" />

                    {formatDate(
                      note.created_at
                    )}

                  </span>

                  <span className="text-slate-300 dark:text-slate-600">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">

                    <CheckCircle2 className="w-3.5 h-3.5" />

                    Approved

                  </span>

                </div>

                {/* ======================================
                    AUTHOR
                ======================================= */}

                {note.author && (
                  <p className="mt-3 text-xs text-slate-400">
                    Shared by {note.author}
                  </p>
                )}

                {/* ======================================
                    ACTIONS
                ======================================= */}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">

                  {/* OPEN */}

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenNote(note)
                    }
                    disabled={
                      note.status !==
                      "approved"
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <ExternalLink className="w-4 h-4" />

                    Open

                  </button>

                  {/* DOWNLOAD */}

                  {note.file_path ? (

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(note)
                      }
                      disabled={
                        downloadingId ===
                        note.id
                      }
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {downloadingId ===
                      note.id ? (

                        <LoaderIcon />

                      ) : (

                        <Download className="w-4 h-4" />

                      )}

                      {downloadingId ===
                      note.id
                        ? "Preparing..."
                        : "Download"}

                    </button>

                  ) : (

                    <div className="flex items-center justify-center text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl">
                      File unavailable
                    </div>

                  )}

                  {/* QUIZ */}

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateQuiz(note)
                    }
                    disabled={
                      note.status !==
                        "approved" ||
                      !note.extracted_text
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <Sparkles className="w-4 h-4" />

                    Quiz

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

// ==========================================
// SMALL LOCAL ICON COMPONENT
// ==========================================

const LoaderIcon = () => (
  <Loader2 className="w-4 h-4 animate-spin" />
);

export default BrowseNotes;