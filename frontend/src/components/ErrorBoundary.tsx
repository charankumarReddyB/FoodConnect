import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FoodConnect ErrorBoundary caught an unhandled exception:', error, errorInfo)
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('foodconnect_local_donations')
    } catch (_) {}
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  private handleClearAllAndReset = () => {
    try {
      localStorage.clear()
    } catch (_) {}
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-inter">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500 text-2xl font-bold">
              ⚠️
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-100 font-poppins">Something went wrong</h1>
              <p className="text-xs text-slate-400 mt-1">
                The application encountered an unexpected interface error. We have safely intercepted it to protect your session.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left font-mono text-[11px] text-rose-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
              >
                🔄 Refresh & Recover Session
              </button>

              <button
                onClick={this.handleClearAllAndReset}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                🏠 Reset Application & Return Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
