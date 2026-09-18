import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

import { supabase } from "../supabase";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!isLogin) {
        // SIGN UP

        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Account created! Check your email to verify your account before logging in."
        );

        setName("");
        setEmail("");
        setPassword("");
      } else {
        // LOGIN

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage("Login successful!");
      }
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setMessage("");
    setName("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Decorative background */}

      <div className="absolute -top-32 -left-32 w-72 h-72 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />

      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* LEFT — Product introduction */}

        <div className="hidden md:flex flex-col justify-between p-10 lg:p-12 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">

          <div>

            {/* Logo */}

            <div className="flex items-center gap-3 mb-12">

              <div className="w-11 h-11 rounded-2xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-600/20">

                <BookOpen className="w-5 h-5 text-white" />

              </div>

              <div>

                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  PinkNotes
                </h1>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-powered learning workspace
                </p>

              </div>

            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-semibold mb-5">

              <Sparkles className="w-3.5 h-3.5" />

              Study smarter
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">

              Turn your notes into a smarter way to learn.

            </h2>

            <p className="mt-5 text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">

              Organize academic resources, solve doubts with AI,
              generate quizzes and understand where you can improve —
              all in one workspace.

            </p>

            {/* Feature list */}

            <div className="mt-8 space-y-4">

              {[
                "AI-powered academic assistance",
                "Personalized quizzes and practice",
                "Learning progress and performance insights",
              ].map((feature) => (

                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                >

                  <CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0" />

                  {feature}

                </div>

              ))}

            </div>

          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-10">
            Learn → Understand → Practice → Improve
          </p>

        </div>


        {/* RIGHT — Authentication */}

        <div className="p-7 sm:p-10 lg:p-12">

          {/* Mobile logo */}

          <div className="md:hidden flex items-center gap-3 mb-10">

            <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center">

              <BookOpen className="w-5 h-5 text-white" />

            </div>

            <div>

              <h1 className="font-bold text-slate-900 dark:text-white">
                PinkNotes
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-powered learning
              </p>

            </div>

          </div>


          {/* Header */}

          <div className="mb-8">

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">

              {isLogin
                ? "Welcome back"
                : "Create your account"}

            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

              {isLogin
                ? "Continue where you left off."
                : "Start building your smarter study workspace."}

            </p>

          </div>


          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}

            {!isLogin && (

              <div>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full name
                </label>

                <div className="relative">

                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
                  />

                </div>

              </div>

            )}


            {/* Email */}

            <div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>

              <div className="relative">

                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
                />

              </div>

            </div>


            {/* Password */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>

                {!isLogin && (
                  <span className="text-xs text-slate-400">
                    Minimum 6 characters
                  </span>
                )}

              </div>

              <div className="relative">

                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>

            </div>


            {/* Error */}

            {error && (

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">

                <span className="mt-0.5">!</span>

                <p>{error}</p>

              </div>

            )}


            {/* Success */}

            {message && (

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">

                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />

                <p>{message}</p>

              </div>

            )}


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-lg shadow-pink-600/20 hover:shadow-pink-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin
                    ? "Continue to PinkNotes"
                    : "Create account"}

                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>


          {/* Toggle */}

          <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">

            <span className="text-sm text-slate-500 dark:text-slate-400">

              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

            </span>

            <button
              type="button"
              onClick={switchMode}
              className="ml-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition"
            >

              {isLogin ? "Sign up" : "Log in"}

            </button>

          </div>


          {/* Small footer */}

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Your learning workspace, built around your study goals.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Auth;