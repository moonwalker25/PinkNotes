import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  FileCheck2,
} from "lucide-react";

import { supabase } from "../supabase.js";
import API from "../services/api.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

const UploadNotes = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // ==========================================
  // FILE VALIDATION
  // ==========================================

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "Please select a file.";
    }

    const fileName = selectedFile.name.toLowerCase();

    const isAllowed = ALLOWED_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isAllowed) {
      return "Only PDF, DOCX, and TXT files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must be less than 10 MB.";
    }

    if (selectedFile.size === 0) {
      return "The selected file appears to be empty.";
    }

    return null;
  };

  // ==========================================
  // SELECT FILE
  // ==========================================

  const processSelectedFile = (selectedFile) => {
    if (uploading) return;

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setFile(null);

      setStatus({
        type: "error",
        message: validationError,
      });

      return;
    }

    setFile(selectedFile);
    setStatus(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDragOver = (e) => {
    e.preventDefault();

    if (!uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();

    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    if (uploading) return;

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  // ==========================================
  // REMOVE FILE
  // ==========================================

  const removeFile = () => {
    if (uploading) return;

    setFile(null);

    setStatus(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  const getErrorMessage = (error) => {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map(
          (item) =>
            item.msg ||
            JSON.stringify(item)
        )
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (detail && typeof detail === "object") {
      return (
        detail.message ||
        detail.error ||
        JSON.stringify(detail)
      );
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "Upload failed. Please try again."
    );
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setSubject("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // UPLOAD
  // ==========================================

  const handleUpload = async (e) => {
    e.preventDefault();

    setStatus(null);

    if (!file) {
      setStatus({
        type: "error",
        message: "Please select a study material file.",
      });

      return;
    }

    if (!title.trim()) {
      setStatus({
        type: "error",
        message: "Please enter a note title.",
      });

      return;
    }

    if (title.trim().length < 3) {
      setStatus({
        type: "error",
        message: "Note title should contain at least 3 characters.",
      });

      return;
    }

    setUploading(true);

    try {
      // ==========================================
      // 1. VERIFY CURRENT USER
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in to upload notes."
        );
      }

      // ==========================================
      // 2. CREATE FORM DATA
      // ==========================================

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "subject",
        subject.trim() || "General"
      );

      // ==========================================
      // 3. SEND TO FASTAPI
      // ==========================================

      const response = await API.post(
        "/api/notes/upload",
        formData
      );

      const result = response.data;

      // ==========================================
      // 4. REJECTED
      // ==========================================

      if (result.decision === "rejected") {
        setStatus({
          type: "rejected",
          message:
            result.reason ||
            "This document does not meet PinkNotes content requirements.",
        });

        return;
      }

      // ==========================================
      // 5. FLAGGED
      // ==========================================

      if (result.status === "flagged") {
        setStatus({
          type: "flagged",
          message:
            result.reason ||
            "Your note requires additional review.",
        });

        resetForm();

        if (onUploadSuccess) {
          await onUploadSuccess();
        }

        return;
      }

      // ==========================================
      // 6. APPROVED
      // ==========================================

      if (
        result.success &&
        result.status === "approved"
      ) {
        setStatus({
          type: "approved",
          message:
            "Your note passed validation and was uploaded successfully.",
        });

        resetForm();

        if (onUploadSuccess) {
          await onUploadSuccess();
        }

        setTimeout(() => {
          setStatus(null);
        }, 5000);

        return;
      }

      // ==========================================
      // 7. UNEXPECTED RESPONSE
      // ==========================================

      throw new Error(
        "The server returned an unexpected response."
      );

    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // FILE SIZE
  // ==========================================

  const getFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  // ==========================================
  // FILE TYPE
  // ==========================================

  const getFileType = (fileName) => {
    const extension = fileName
      .split(".")
      .pop()
      .toUpperCase();

    return extension;
  };

  // ==========================================
  // STATUS UI
  // ==========================================

  const getStatusUI = () => {
    if (uploading) {
      return (
        <div className="rounded-2xl border border-pink-200 dark:border-pink-500/20 bg-pink-50 dark:bg-pink-500/10 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">

              <Loader2 className="w-5 h-5 text-pink-600 dark:text-pink-400 animate-spin" />

            </div>

            <div className="flex-1">

              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Analyzing your note
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Extracting content and checking it with PinkNotes AI.
              </p>

            </div>

          </div>

          <div className="mt-4 h-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 overflow-hidden">

            <div className="h-full w-2/3 rounded-full bg-pink-500 animate-pulse" />

          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

            <Sparkles className="w-3.5 h-3.5 text-pink-500" />

            This may take a few moments for larger or scanned documents.

          </div>

        </div>
      );
    }

    if (!status) {
      return null;
    }

    const statusConfig = {
      approved: {
        icon: CheckCircle2,
        title: "Note uploaded",
        classes:
          "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        iconClasses:
          "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      },

      flagged: {
        icon: AlertCircle,
        title: "Flagged for review",
        classes:
          "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
        iconClasses:
          "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
      },

      rejected: {
        icon: XCircle,
        title: "Note rejected",
        classes:
          "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 text-red-700 dark:text-red-300",
        iconClasses:
          "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
      },

      error: {
        icon: AlertCircle,
        title: "Upload error",
        classes:
          "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 text-red-700 dark:text-red-300",
        iconClasses:
          "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
      },
    };

    const config =
      statusConfig[status.type];

    if (!config) {
      return null;
    }

    const Icon = config.icon;

    return (
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 ${config.classes}`}
      >

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconClasses}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">

          <p className="text-sm font-bold">
            {config.title}
          </p>

          <p className="text-sm mt-0.5 opacity-90">
            {status.message}
          </p>

        </div>

      </div>
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-700">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center flex-shrink-0">

              <Upload className="w-5 h-5 text-pink-600 dark:text-pink-400" />

            </div>

            <div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Notes
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add your study material to PinkNotes.
              </p>

            </div>

          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-500 dark:text-slate-300">

            <ShieldCheck className="w-3.5 h-3.5" />

            AI validated

          </div>

        </div>

      </div>


      {/* ======================================
          FORM
      ======================================= */}

      <div className="p-6 sm:p-7">

        <form
          onSubmit={handleUpload}
          className="space-y-5"
        >

          {/* TITLE */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Note title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Machine Learning — Unit 1"
              disabled={uploading}
              maxLength={120}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition disabled:opacity-50"
            />

          </div>


          {/* SUBJECT */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subject
              <span className="ml-2 font-normal text-slate-400">
                optional
              </span>
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="e.g. Artificial Intelligence"
              disabled={uploading}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition disabled:opacity-50"
            />

          </div>


          {/* FILE UPLOAD */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Study material
              </label>

              <span className="text-xs text-slate-400">
                Max 10 MB
              </span>

            </div>

            {file ? (

              /* SELECTED FILE */

              <div className="rounded-2xl border border-pink-200 dark:border-pink-500/20 bg-pink-50/50 dark:bg-pink-500/5 p-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">

                    <FileText className="w-5 h-5 text-pink-600 dark:text-pink-400" />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {file.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">

                      <span>
                        {getFileType(file.name)}
                      </span>

                      <span>•</span>

                      <span>
                        {getFileSize(file.size)}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <FileCheck2 className="w-3 h-3" />
                        Ready
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={uploading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50"
                    aria-label="Remove selected file"
                  >

                    <Trash2 className="w-4 h-4" />

                  </button>

                </div>

              </div>

            ) : (

              /* DROPZONE */

              <label
                htmlFor="note-file"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center
                  min-h-[180px]
                  rounded-2xl
                  border-2 border-dashed
                  transition-all
                  ${
                    uploading
                      ? "cursor-not-allowed opacity-50 border-slate-200 dark:border-slate-700"
                      : dragActive
                      ? "cursor-copy border-pink-500 bg-pink-50 dark:bg-pink-500/10"
                      : "cursor-pointer border-slate-200 dark:border-slate-700 hover:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }
                `}
              >

                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">

                  <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />

                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">

                  {dragActive
                    ? "Drop your note here"
                    : "Drop your note here or click to browse"}

                </p>

                <p className="text-xs text-slate-400 mt-2">
                  PDF, DOCX or TXT
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Maximum file size: 10 MB
                </p>

                <input
                  ref={fileInputRef}
                  id="note-file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />

              </label>

            )}

          </div>


          {/* STATUS */}

          {getStatusUI()}


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing note...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload note
              </>
            )}

          </button>

        </form>


        {/* ======================================
            HOW IT WORKS
        ======================================= */}

        <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-700">

          <div className="flex items-center gap-2 mb-4">

            <Sparkles className="w-4 h-4 text-pink-500" />

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              What happens after upload?
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">

              <p className="text-xs font-bold text-pink-500 mb-1">
                01
              </p>

              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Content extracted
              </p>

            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">

              <p className="text-xs font-bold text-pink-500 mb-1">
                02
              </p>

              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                AI validates the material
              </p>

            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">

              <p className="text-xs font-bold text-pink-500 mb-1">
                03
              </p>

              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Approved notes become usable resources
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default UploadNotes;