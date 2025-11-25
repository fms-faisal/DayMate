/**
 * DayMate - AI Daily Planning Assistant
 * Main Application Component
 */

import { useState } from 'react';
import axios from 'axios';
import WeatherCard from './components/WeatherCard';
import NewsFeed from './components/NewsFeed';
import PlanDisplay from './components/PlanDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// API URL - use environment variable or fallback to local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  // State management
  const [city, setCity] = useState('');
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Popular cities for quick selection
  const popularCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Dubai'];

  /**
   * Fetch plan from the API
   */
  const handlePlanGeneration = async (e, coordinates = null) => {
    e?.preventDefault();
    
    const cityName = city.trim();
    if (!cityName && !coordinates) {
      setError('Please enter a city name or use your location');
      return;
    }

    setLoading(true);
    setError(null);
    setPlanData(null);

    try {
      // Build request body - either with coordinates or city name
      const requestBody = coordinates 
        ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
        : { city: cityName };

      const response = await axios.post(`${API_URL}/api/plan`, requestBody, {
        timeout: 30000, // 30 second timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setPlanData(response.data);
    } catch (err) {
      console.error('Error fetching plan:', err);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.detail || 'Failed to generate plan. Please try again.');
      } else if (err.request) {
        // No response received
        setError('Unable to connect to the server. Please check your connection.');
      } else {
        // Other error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user's current location and generate plan
   */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLoading(false);
        setCity(''); // Clear city input
        // Generate plan with coordinates
        handlePlanGeneration(null, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (err) => {
        setLocationLoading(false);
        switch(err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions or enter a city manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please try again or enter a city manually.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('Unable to get your location. Please enter a city manually.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache location for 5 minutes
      }
    );
  };

  /**
   * Handle quick city selection
   */
  const handleQuickSelect = (selectedCity) => {
    setCity(selectedCity);
    setError(null);
  };

  /**
   * Reset the form
   */
  const handleReset = () => {
    setCity('');
    setPlanData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌤️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">DayMate</h1>
                <p className="text-xs text-gray-500">AI Daily Planning Assistant</p>
              </div>
            </div>
            {planData && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                ← Plan another city
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        {!planData && !loading && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Plan Your Perfect Day
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter your city and let DayMate create a personalized daily plan based on 
                real-time weather and local news.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handlePlanGeneration} className="max-w-xl mx-auto mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city..."
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!city.trim()}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Plan My Day
                </button>
              </div>
            </form>

            {/* Use My Location Button */}
            <div className="text-center mb-6">
              <button
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Getting location...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2">Get weather for your exact location</p>
            </div>

            {/* Divider */}
            <div className="flex items-center max-w-md mx-auto mb-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">or try a city</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Quick Select Cities */}
            <div className="text-center mb-8">
              <div className="flex flex-wrap justify-center gap-2">
                {popularCities.map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => handleQuickSelect(cityName)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-md mx-auto">
                <ErrorMessage message={error} onRetry={() => setError(null)} />
              </div>
            )}

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Real-time Weather</h3>
                <p className="text-sm text-gray-500">Get accurate weather data for informed planning</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📰</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Local News</h3>
                <p className="text-sm text-gray-500">Stay informed about events in your area</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Recommendations</h3>
                <p className="text-sm text-gray-500">Get smart, context-aware daily suggestions</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Results Section */}
        {planData && !loading && (
          <div className="animate-fade-in space-y-6">
            {/* Service Errors Banner */}
            {planData.errors && planData.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-amber-800">Some services had issues</p>
                    <p className="text-sm text-amber-600 mt-1">
                      We&apos;ve still generated recommendations based on available data.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Weather and News Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <WeatherCard 
                weather={planData.weather} 
                error={planData.errors?.find(e => e.service === 'weather')?.message}
              />
              <NewsFeed 
                news={planData.news} 
                error={planData.errors?.find(e => e.service === 'news')?.message}
              />
            </div>

            {/* AI Plan */}
            <PlanDisplay 
              plan={planData.ai_plan} 
              city={planData.city}
              error={planData.errors?.find(e => e.service === 'ai')?.message}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            DayMate - AI Daily Planning Assistant | 
            <span className="text-blue-500 ml-1">
              Powered by Open-Meteo, NewsAPI & Google Gemini
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
