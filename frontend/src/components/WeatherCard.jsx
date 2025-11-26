/**
 * WeatherCard Component
 * Displays current weather information with dynamic icons
 */

// Weather condition to icon mapping
const weatherIcons = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
  Smoke: '🌫️',
  Dust: '🌪️',
  Sand: '🌪️',
  Tornado: '🌪️',
};

function WeatherCard({ weather, error }) {
  // Show error state if weather data unavailable
  if (!weather) {
    return (
      <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-lg h-full flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-medium opacity-90">Weather</h2>
              <p className="text-xl font-bold">Unavailable</p>
            </div>
            <span className="text-4xl opacity-50">❓</span>
          </div>
          
          {error && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4 border border-white/10">
              <p className="text-sm opacity-90">
                {error}
              </p>
            </div>
          )}
          
          <p className="text-sm mt-4 opacity-75">
            Weather data could not be loaded, but you can still get recommendations based on other available information.
          </p>
        </div>
      </div>
    );
  }

  const icon = weatherIcons[weather.condition] || '🌤️';
  
  // Determine background gradient based on temperature
  const getGradient = () => {
    const temp = weather.temp;
    if (temp > 30) return 'from-orange-500 to-red-600';
    if (temp > 20) return 'from-amber-400 to-orange-500';
    if (temp > 10) return 'from-blue-400 to-blue-600';
    return 'from-indigo-500 to-blue-600';
  };

  return (
    <div className={`bg-gradient-to-br ${getGradient()} text-white rounded-2xl p-8 shadow-lg shadow-blue-500/20 relative overflow-hidden group transition-all hover:scale-[1.02]`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

      <div className="relative z-10 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium opacity-90 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {weather.city_name}
            </h2>
            <p className="text-sm opacity-75">{weather.country}</p>
          </div>
          <span className="text-6xl filter drop-shadow-lg weather-icon">{icon}</span>
        </div>
        
        {/* Main Temp */}
        <div className="my-6">
          <div className="flex items-baseline">
            <span className="text-7xl font-bold tracking-tighter">{Math.round(weather.temp)}°</span>
            <span className="text-3xl opacity-80 font-medium">C</span>
          </div>
          <p className="text-xl font-medium capitalize opacity-90 mt-1">{weather.description}</p>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          <div className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Feels Like</p>
            <p className="text-lg font-bold">{Math.round(weather.feels_like)}°</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Humidity</p>
            <p className="text-lg font-bold">{weather.humidity}%</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Wind</p>
            <p className="text-lg font-bold">{weather.wind_speed} <span className="text-xs font-normal">m/s</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
