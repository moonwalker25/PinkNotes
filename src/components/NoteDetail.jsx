import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import { supabase } from "../supabase.js";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";


const NoteDetail = ({
  noteId,
  onBack,
  onGenerateQuiz,
  onAskAI,
}) => {

  const [note, setNote] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [downloadLoading, setDownloadLoading] = useState(false);

  const [downloadError, setDownloadError] = useState("");

  const [isBookmarked, setIsBookmarked] = useState(false);

  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [bookmarkError, setBookmarkError] = useState("");


  // =========================================================
  // LOAD NOTE
  // =========================================================

  const loadNote = async () => {

    if (!noteId) {
      setError("No note was selected.");
      setLoading(false);
      return;
    }


    setLoading(true);
    setError("");
    setBookmarkError("");


    try {

      const {
        data: noteData,
        error: noteError,
      } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .eq("status", "approved")
        .single();


      if (noteError) {
        throw noteError;
      }


      if (!noteData) {
        setNote(null);
        return;
      }


      setNote(noteData);


      // =====================================================
      // LOAD BOOKMARK STATUS
      // =====================================================

      try {

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser();


        if (user) {

          const {
            data: bookmarkData,
            error: bookmarkQueryError,
          } = await supabase
            .from("note_bookmarks")
            .select("id")
            .eq("user_id", user.id)
            .eq("note_id", noteId)
            .maybeSingle();


          if (bookmarkQueryError) {
            throw bookmarkQueryError;
          }


          setIsBookmarked(Boolean(bookmarkData));

        }

      } catch (bookmarkQueryError) {

        console.error(
          "Bookmark status error:",
          bookmarkQueryError
        );

        /*
         * Bookmark failure should not prevent
         * the actual note from loading.
         */

        setIsBookmarked(false);

      }

    } catch (noteError) {

      console.error(
        "Note loading error:",
        noteError
      );


      setNote(null);

      setError(
        "Unable to load this resource. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadNote();

  }, [noteId]);


  // =========================================================
  // CLEAN EXTRACTED TEXT
  // =========================================================

  const cleanedText = useMemo(() => {

    if (!note?.extracted_text) {
      return "";
    }


    let text = note.extracted_text;


    /*
     * Remove OCR watermark/artifact lines such as:
     *
     * Scanned with CamScanner
     * scanned with camscanner
     * SCANNED WITH CAMSCANNER
     *
     * This only affects display.
     * The original extracted_text remains untouched in Supabase.
     */

    text = text.replace(
      /^\s*scanned\s+with\s+camscanner\s*$/gim,
      ""
    );


    /*
     * Remove any remaining standalone CamScanner
     * lines that may contain small OCR variations.
     */

    text = text.replace(
      /^\s*.*camscanner.*$/gim,
      ""
    );


    /*
     * Clean excessive blank lines created by removing
     * the OCR artifacts.
     */

    text = text.replace(
      /\n[ \t]*\n[ \t]*\n+/g,
      "\n\n"
    );


    return text.trim();

  }, [note?.extracted_text]);


  // =========================================================
  // READ TIME
  // =========================================================

  const readTime = useMemo(() => {

    if (!note?.extracted_text) {
      return "~1 min read";
    }


    const characterCount =
      note.character_count ||
      note.extracted_text.length;


    const words = Math.max(
      1,
      Math.round(characterCount / 5)
    );


    const minutes = Math.max(
      1,
      Math.ceil(words / 200)
    );


    return `~${minutes} min read`;

  }, [
    note?.character_count,
    note?.extracted_text,
  ]);


  // =========================================================
  // DATE
  // =========================================================

  const formattedDate = useMemo(() => {

    if (!note?.created_at) {
      return "Recently added";
    }


    try {

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(new Date(note.created_at));

    } catch {

      return "Recently added";

    }

  }, [note?.created_at]);


  // =========================================================
  // DOWNLOAD
  // =========================================================

  const handleDownload = async () => {

    if (!note?.file_path || downloadLoading) {
      return;
    }


    setDownloadLoading(true);

    setDownloadError("");


    try {

      const {
        data,
        error: signedUrlError,
      } = await supabase.storage
        .from("notes")
        .createSignedUrl(
          note.file_path,
          60 * 60
        );


      if (signedUrlError) {
        throw signedUrlError;
      }


      if (!data?.signedUrl) {
        throw new Error(
          "Unable to create download link."
        );
      }


      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );

    } catch (downloadError) {

      console.error(
        "Download error:",
        downloadError
      );


      setDownloadError(
        "Unable to open this resource. Please try again."
      );

    } finally {

      setDownloadLoading(false);

    }

  };


  // =========================================================
  // BOOKMARK
  // =========================================================

  const handleBookmark = async () => {

    if (
      !note?.id ||
      bookmarkLoading
    ) {
      return;
    }


    setBookmarkLoading(true);

    setBookmarkError("");


    try {

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError || !user) {

        throw new Error(
          "Please log in to save notes."
        );

      }


      // =====================================================
      // REMOVE BOOKMARK
      // =====================================================

      if (isBookmarked) {

        const {
          error: deleteError,
        } = await supabase
          .from("note_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("note_id", note.id);


        if (deleteError) {
          throw deleteError;
        }


        setIsBookmarked(false);

      }

      // =====================================================
      // ADD BOOKMARK
      // =====================================================

      else {

        const {
          error: insertError,
        } = await supabase
          .from("note_bookmarks")
          .insert({
            user_id: user.id,
            note_id: note.id,
          });


        if (insertError) {
          throw insertError;
        }


        setIsBookmarked(true);

      }

    } catch (bookmarkActionError) {

      console.error(
        "Bookmark action error:",
        bookmarkActionError
      );


      setBookmarkError(
        isBookmarked
          ? "Unable to remove this bookmark."
          : "Unable to save this note. Please try again."
      );

    } finally {

      setBookmarkLoading(false);

    }

  };


  // =========================================================
  // GENERATE QUIZ
  // =========================================================

  const handleGenerateQuiz = () => {

    if (!note || !onGenerateQuiz) {
      return;
    }


    onGenerateQuiz(note);

  };


  // =========================================================
  // ASK AI
  // =========================================================

  const handleAskAI = () => {

    if (!note || !onAskAI) {
      return;
    }


    onAskAI(note);

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <LoadingState
          message="Loading note..."
        />

      </div>
    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <ErrorState
          title="Unable to open note"
          description={error}
          onRetry={loadNote}
        />

      </div>
    );

  }


  // =========================================================
  // EMPTY
  // =========================================================

  if (!note) {

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <EmptyState
          icon={FileText}
          title="Note not found"
          description="This resource may no longer be available."
          actionLabel="Back to resources"
          onAction={onBack}
        />

      </div>
    );

  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="space-y-6">


      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >

        <ArrowLeft size={17} />

        Back to resources

      </button>


      {/* =====================================================
          NOTE HEADER
      ===================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <div className="p-6 sm:p-7">

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">


            {/* NOTE INFORMATION */}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">

                  <CheckCircle2 size={14} />

                  Approved resource

                </span>


                {note.subject && (

                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">

                    {note.subject}

                  </span>

                )}

              </div>


              <h1 className="mt-5 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">

                {note.title}

              </h1>


              <p className="mt-2 break-words text-sm text-slate-500 dark:text-slate-400">

                {note.file_name}

              </p>


              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500 dark:text-slate-400">


                <span className="inline-flex items-center gap-1.5">

                  <CalendarDays size={15} />

                  {formattedDate}

                </span>


                <span className="inline-flex items-center gap-1.5">

                  <Clock3 size={15} />

                  {readTime}

                </span>


                {note.file_type && (

                  <span className="inline-flex items-center gap-1.5">

                    <FileText size={15} />

                    {note.file_type}

                  </span>

                )}

              </div>

            </div>


            {/* ACTIONS */}

            <div className="flex flex-wrap items-center gap-2 xl:shrink-0">


              {/* BOOKMARK */}

              <button
                type="button"
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isBookmarked
                    ? "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
                title={
                  isBookmarked
                    ? "Remove bookmark"
                    : "Save note"
                }
              >

                {bookmarkLoading ? (

                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                ) : (

                  <Bookmark
                    size={17}
                    className={
                      isBookmarked
                        ? "fill-current"
                        : ""
                    }
                  />

                )}

                {isBookmarked
                  ? "Saved"
                  : "Save note"
                }

              </button>


              {/* DOWNLOAD */}

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloadLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >

                {downloadLoading ? (

                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                ) : (

                  <Download size={17} />

                )}

                Download

              </button>


              {/* GENERATE QUIZ */}

              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={!onGenerateQuiz}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Sparkles size={17} />

                Generate Quiz

              </button>

            </div>

          </div>


          {/* DOWNLOAD ERROR */}

          {downloadError && (

            <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">

              <span>
                {downloadError}
              </span>

              <button
                type="button"
                onClick={() => setDownloadError("")}
                className="shrink-0 rounded-md p-0.5 opacity-70 transition hover:opacity-100"
                aria-label="Dismiss download error"
              >

                <X size={14} />

              </button>

            </div>

          )}


          {/* BOOKMARK ERROR */}

          {bookmarkError && (

            <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">

              <span>
                {bookmarkError}
              </span>

              <button
                type="button"
                onClick={() => setBookmarkError("")}
                className="shrink-0 rounded-md p-0.5 opacity-70 transition hover:opacity-100"
                aria-label="Dismiss bookmark error"
              >

                <X size={14} />

              </button>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          AI STUDY SECTION
      ===================================================== */}

      <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/40 dark:bg-indigo-950/20">

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">


          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">

              <Sparkles size={20} />

            </div>


            <div>

              <h2 className="text-base font-semibold text-slate-900 dark:text-white">

                Study this note with AI

              </h2>


              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">

                Ask questions about this resource, simplify difficult concepts, or use the note as context for your study session.

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleAskAI}
            disabled={!onAskAI}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >

            <ExternalLink size={17} />

            Ask AI about this note

          </button>

        </div>

      </section>


      {/* =====================================================
          NOTE CONTENT
      ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">


        {/* CONTENT HEADER */}

        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">

              <FileText
                size={19}
                className="text-slate-600 dark:text-slate-300"
              />

            </div>


            <div>

              <h2 className="text-base font-semibold text-slate-900 dark:text-white">

                Note content

              </h2>


              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">

                Extracted text from the uploaded resource

              </p>

            </div>

          </div>

        </div>


        {/* CONTENT */}

        <div className="px-6 py-7 sm:px-8 sm:py-8">

          {cleanedText ? (

            <article className="max-w-4xl whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-300">

              {cleanedText}

            </article>

          ) : (

            <div className="py-6">

              <EmptyState
                icon={FileText}
                title="No readable text available"
                description="This resource doesn't currently have readable extracted text. You can still download the original file or use it for other supported study features."
              />

            </div>

          )}

        </div>

      </section>

    </div>

  );

};


export default NoteDetail;