import React from "react";

type State = { error: Error | null };

export default class DevErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("🔥 DevErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 m-4 rounded-lg border border-red-300 bg-red-50 text-red-900">
          <div className="font-semibold mb-2">⚠️ App crashed</div>
          <pre className="text-xs whitespace-pre-wrap">
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <p className="mt-2 text-xs opacity-70">
            Open DevTools → Console for stack trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
