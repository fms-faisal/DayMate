/**
 * LoadingSpinner Component
 * Displays animated loading state
 */

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      
      {/* Loading text */}
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-700">Planning your day...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching weather, news, and generating recommendations</p>
      </div>
      
      {/* Animated dots */}
      <div className="flex gap-1 mt-4">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
