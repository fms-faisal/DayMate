/**
 * LoadingSpinner Component
 * Displays animated loading state
 */

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0 shadow-lg shadow-blue-500/20"></div>
        
        {/* Center icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse">
          ✨
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">Planning your perfect day...</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Analyzing weather, checking local news, and crafting your itinerary
        </p>
      </div>
      
      {/* Progress indicators */}
      <div className="flex gap-2 mt-8">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
