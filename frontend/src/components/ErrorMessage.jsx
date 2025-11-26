/**
 * ErrorMessage Component
 * Displays error states with helpful messages
 */

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-red-500/5 border border-red-100 text-center max-w-md mx-auto">
      {/* Icon */}
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      {/* Message */}
      <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
      
      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/20 flex items-center gap-2 mx-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
      
      {/* Help text */}
      <p className="text-sm text-slate-400 mt-6">
        Make sure you entered a valid city name and try again.
      </p>
    </div>
  );
}

export default ErrorMessage;
