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
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-medium opacity-90">Weather</h2>
            <p className="text-xl font-bold">Unavailable</p>
          </div>
          <span className="text-5xl">❓</span>
        </div>
        
        {error && (
          <div className="bg-white/20 rounded-lg p-3 mt-4">
            <p className="text-sm opacity-90">
              <span className="font-medium">Note:</span> {error}
            </p>
          </div>
        )}
        
        <p className="text-sm mt-4 opacity-75">
          Weather data could not be loaded, but you can still get recommendations based on other available information.
        </p>
      </div>
    );
  }

  const icon = weatherIcons[weather.condition] || '🌤️';
  
  // Determine background gradient based on temperature
  const getGradient = () => {
    const temp = weather.temp;
    if (temp > 30) return 'from-orange-400 to-red-500';
    if (temp > 20) return 'from-yellow-400 to-orange-400';
    if (temp > 10) return 'from-blue-400 to-blue-600';
    return 'from-blue-500 to-indigo-600';
  };

  return (
    <div className={`bg-gradient-to-br ${getGradient()} text-white rounded-2xl p-6 shadow-lg card-hover`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-medium opacity-90">Current Weather</h2>
          <p className="text-2xl font-bold">{weather.city_name}, {weather.country}</p>
        </div>
        <span className="text-5xl weather-icon">{icon}</span>
      </div>
      
      {/* Temperature */}
      <div className="mb-6">
        <span className="text-6xl font-bold">{Math.round(weather.temp)}°</span>
        <span className="text-2xl ml-1">C</span>
      </div>
      
      {/* Condition */}
      <p className="text-xl capitalize mb-4">{weather.description}</p>
      
      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <p className="text-sm opacity-75">Feels Like</p>
          <p className="text-lg font-semibold">{Math.round(weather.feels_like)}°C</p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-75">Humidity</p>
          <p className="text-lg font-semibold">{weather.humidity}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-75">Wind</p>
          <p className="text-lg font-semibold">{weather.wind_speed} m/s</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
