import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold">Something went wrong</h3>
              <p className="text-red-300/70 text-sm">
                {this.props.fallbackMessage || 'An error occurred in this component'}
              </p>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="text-red-400 text-sm cursor-pointer hover:text-red-300">
              Show error details
            </summary>
            <div className="mt-2 p-3 bg-red-950/50 rounded-lg">
              <pre className="text-red-300 text-xs overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
