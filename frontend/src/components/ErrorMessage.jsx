/**
 * ErrorMessage Component
 * Displays error states with helpful messages
 */

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">😕</span>
      </div>
      
      {/* Message */}
      <h3 className="text-lg font-semibold text-red-700 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-600 mb-4">{message}</p>
      
      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
      
      {/* Help text */}
      <p className="text-sm text-gray-500 mt-4">
        Make sure you entered a valid city name and try again.
      </p>
    </div>
  );
}

export default ErrorMessage;
