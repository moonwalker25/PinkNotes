import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Search,
  Download,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  X,
  FileText,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../supabase.js";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";

const Bookmarks = ({
  onOpenNote,
  onGenerateQuiz,
}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // --------------------------------------------------
  // Load saved notes
  // --------------------------------------------------

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setBookmarks([]);
        return;
      }

      const { data, error: bookmarkError } = await supabase
        .from("note_bookmarks")
        .select(
          `
            id,
            note_id,
            created_at,
            notes (
              id,
              title,
              subject,
              file_name,
              file_path,
              file_type,
              character_count,
              status,
              created_at
            )
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarkError) {
        throw bookmarkError;
      }

      // Only display bookmarks whose note still exists
      // and is approved.
      const savedNotes = (data || [])
        .filter(
          (bookmark) =>
            bookmark.notes &&
            bookmark.notes.status === "approved"
        )
        .map((bookmark) => ({
          bookmarkId: bookmark.id,
          bookmarkedAt: bookmark.created_at,
          ...bookmark.notes,
        }));

      setBookmarks(savedNotes);
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setError(
        "We couldn't load your saved notes right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  // --------------------------------------------------
  // Subjects
  // --------------------------------------------------

  const subjects = useMemo(() => {
    return [
      ...new Set(
        bookmarks
          .map((note) => note.subject)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [bookmarks]);

  // --------------------------------------------------
  // Search + filter + sort
  // --------------------------------------------------

  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = bookmarks.filter((note) => {
      const matchesSearch =
        !query ||
        note.title?.toLowerCase().includes(query) ||
        note.subject?.toLowerCase().includes(query) ||
        note.file_name?.toLowerCase().includes(query);

      const matchesSubject =
        subjectFilter === "all" ||
        note.subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.bookmarkedAt) -
          new Date(b.bookmarkedAt)
        );
      }

      if (sortBy === "title") {
        return (a.title || "").localeCompare(
          b.title || ""
        );
      }

      return (
        new Date(b.bookmarkedAt) -
        new Date(a.bookmarkedAt)
      );
    });
  }, [
    bookmarks,
    search,
    subjectFilter,
    sortBy,
  ]);

  // --------------------------------------------------
  // Download
  // --------------------------------------------------

  const handleDownload = async (note) => {
    try {
      setDownloadingId(note.id);
      setActionError("");

      const { data, error: signedUrlError } =
        await supabase.storage
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
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setActionError(
        "Unable to download this note. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // --------------------------------------------------
  // Remove bookmark
  // --------------------------------------------------

  const handleRemoveBookmark = async (note) => {
    try {
      setRemovingId(note.bookmarkId);
      setActionError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "You must be logged in."
        );
      }

      const { error: deleteError } =
        await supabase
          .from("note_bookmarks")
          .delete()
          .eq("id", note.bookmarkId)
          .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      setBookmarks((current) =>
        current.filter(
          (item) =>
            item.bookmarkId !==
            note.bookmarkId
        )
      );
    } catch (err) {
      console.error(
        "Remove bookmark error:",
        err
      );

      setActionError(
        "Unable to remove this saved note. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setSubjectFilter("all");
    setSortBy("newest");
  };

  const hasFilters =
    search.trim() ||
    subjectFilter !== "all";

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="pn-card overflow-hidden">
        <LoadingState
          message="Loading your saved notes..."
        />
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="pn-card overflow-hidden">
        <ErrorState
          title="Couldn't load saved notes"
          description={error}
          onRetry={loadBookmarks}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="pn-card overflow-hidden">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                <Bookmark
                  size={23}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                  Your library
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Saved Notes
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Keep the resources you want to
                  revisit close at hand.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved resources
              </p>

              <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                {bookmarks.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action error */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="flex-1 text-sm text-red-700 dark:text-red-300">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 dark:hover:bg-red-900/30"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search + filters */}
      {bookmarks.length > 0 && (
        <section className="pn-card p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search saved notes..."
                className="pn-input w-full pl-10"
              />
            </div>

            {/* Subject */}
            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(e.target.value)
              }
              className="pn-input min-w-[180px]"
            >
              <option value="all">
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

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="pn-input min-w-[170px] pl-9"
              >
                <option value="newest">
                  Newest saved
                </option>

                <option value="oldest">
                  Oldest saved
                </option>

                <option value="title">
                  Title A–Z
                </option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {filteredBookmarks.length}
                </span>{" "}
                of {bookmarks.length} saved notes
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <X size={13} />
                Clear filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* No saved notes */}
      {bookmarks.length === 0 && (
        <div className="pn-card overflow-hidden">
          <EmptyState
            icon={Bookmark}
            title="No saved notes yet"
            description="When you find a useful resource, save it from the note detail page and it will appear here."
          />
        </div>
      )}

      {/* No search results */}
      {bookmarks.length > 0 &&
        filteredBookmarks.length === 0 && (
          <div className="pn-card overflow-hidden">
            <EmptyState
              icon={Search}
              title="No matching notes"
              description="Try a different search term or clear your filters to see your saved resources."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          </div>
        )}

      {/* Saved notes */}
      {filteredBookmarks.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Your saved resources
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredBookmarks.length}{" "}
                {filteredBookmarks.length === 1
                  ? "note"
                  : "notes"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredBookmarks.map((note) => (
              <article
                key={note.bookmarkId}
                className="pn-card pn-card-hover group overflow-hidden"
              >
                <div className="p-5">
                  {/* Top */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                      <FileText
                        size={20}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {note.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {note.file_name}
                      </p>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                      <Bookmark
                        size={15}
                        className="fill-current text-amber-500"
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {note.subject && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {note.subject}
                      </span>
                    )}

                    {note.file_type && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {note.file_type.replace(
                          ".",
                          ""
                        )}
                      </span>
                    )}

                    {note.character_count > 0 && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {note.character_count.toLocaleString()}{" "}
                        chars
                      </span>
                    )}
                  </div>

                  {/* Saved date */}
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    Saved{" "}
                    {new Date(
                      note.bookmarkedAt
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenNote?.(note)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                    >
                      <ExternalLink size={15} />
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(note)
                      }
                      disabled={
                        downloadingId === note.id
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {downloadingId ===
                      note.id ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={15} />
                      )}

                      Download
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveBookmark(
                          note
                        )
                      }
                      disabled={
                        removingId ===
                        note.bookmarkId
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                    >
                      {removingId ===
                      note.bookmarkId ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={15} />
                      )}

                      Remove
                    </button>
                  </div>

                  {/* Quiz shortcut */}
                  {onGenerateQuiz && (
                    <button
                      type="button"
                      onClick={() =>
                        onGenerateQuiz(note)
                      }
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                    >
                      <BookOpen size={15} />
                      Generate Quiz from this note
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Bookmarks;