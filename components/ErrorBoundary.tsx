"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 paper-bg">
          <div className="max-w-lg text-center">
            <div
              className="text-6xl mb-4"
              style={{ fontFamily: "var(--font-headline)", color: "var(--accent)" }}
            >
              404
            </div>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: "var(--font-headline)", color: "var(--ink)" }}
            >
              Page Not Found
            </h2>
            <p
              className="mb-6 text-sm opacity-70"
              style={{ fontFamily: "var(--font-body)", color: "var(--ink)" }}
            >
              The page you are looking for seems to have traveled to the future.
            </p>
            <a
              href="/"
              className="btn-vintage"
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error, resetErrorBoundary }: { error?: Error; resetErrorBoundary?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 paper-bg">
      <div className="max-w-lg text-center">
        <div
          className="text-5xl mb-4"
          style={{ fontFamily: "var(--font-headline)", color: "var(--accent)" }}
        >
          ⚠
        </div>
        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-headline)", color: "var(--ink)" }}
        >
          Something Went Wrong
        </h2>
        <p
          className="mb-6 text-sm opacity-70"
          style={{ fontFamily: "var(--font-body)", color: "var(--ink)" }}
        >
          {error?.message || "An unexpected error occurred."}
        </p>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="btn-vintage"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}