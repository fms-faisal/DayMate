/**
 * DayMate - AI Daily Planning Assistant
 * Main Application Component
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
// Increase default axios timeout to 60s to allow longer backend processing (AI calls)
axios.defaults.timeout = 60000
import WeatherCard from './components/WeatherCard';
import NewsFeed from './components/NewsFeed';
import PlanDisplay from './components/PlanDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PreferencesModal from './components/PreferencesModal';
import TrafficAlerts from './components/TrafficAlerts';
import AuthButton from './components/AuthButton';
import ChatHistoryModal from './components/ChatHistoryModal';
import { useAuth } from './contexts/AuthContext';
import { saveUserPreferences, loadUserPreferences, saveLastCity } from './services/firestoreService';

// API URL - use environment variable or fallback to local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  // Auth state
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [city, setCity] = useState('');
  const [profile, setProfile] = useState('standard');
  const [preferences, setPreferences] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'syncing', 'synced', 'error'
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  // Helper to get first name from Gmail (if logged in)
  function getFirstNameFromUser(user) {
    if (!user) return '';
    if (user.displayName) {
      // Try to get first word (first name)
      return user.displayName.split(' ')[0];
    }
    if (user.email) {
      // Use email prefix as fallback
      return user.email.split('@')[0];
    }
    return '';
  }

  // Load persisted data on mount
  useEffect(() => {
    const savedPlanData = localStorage.getItem('daymate_planData');
    if (savedPlanData) {
      try {
        const parsed = JSON.parse(savedPlanData);
        setPlanData(parsed);
        // Don't restore the city to avoid showing Bengali text
        // if (parsed.city) {
        //   setCity(parsed.city);
        // }
      } catch (e) {
        console.error('Failed to parse saved plan data', e);
        localStorage.removeItem('daymate_planData');
      }
    }
  }, []);

  // Save planData to localStorage whenever it changes
  useEffect(() => {
    if (planData) {
      localStorage.setItem('daymate_planData', JSON.stringify(planData));
    } else {
      localStorage.removeItem('daymate_planData');
    }
  }, [planData]);

  // Load preferences on mount or when user changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (isAuthenticated && user) {
        // Load from Firestore for authenticated users
        setSyncStatus('syncing');
        try {
          const cloudPrefs = await loadUserPreferences(user.uid);
          if (cloudPrefs) {
            setPreferences(cloudPrefs);
            // Also update localStorage as backup
            localStorage.setItem('daymate_preferences', JSON.stringify(cloudPrefs));
          } else {
            // No cloud prefs, check localStorage and sync up
            const localPrefs = localStorage.getItem('daymate_preferences');
            if (localPrefs) {
              const parsed = JSON.parse(localPrefs);
              setPreferences(parsed);
              // Sync local prefs to cloud (don't await - do it in background)
              saveUserPreferences(user.uid, parsed).catch(console.error);
            }
          }
          
          // Don't load last city to avoid showing Bengali text
          // getLastCity(user.uid).then(lastCity => {
          //   if (lastCity) {
          //     setCity(prevCity => prevCity || lastCity);
          //   }
          // }).catch(console.error);
          
          setSyncStatus('synced');
          // Auto-hide after 2 seconds
          setTimeout(() => setSyncStatus(null), 2000);
        } catch (e) {
          console.error('Failed to load preferences from cloud', e);
          setSyncStatus('error');
          setTimeout(() => setSyncStatus(null), 3000);
          // Fallback to localStorage
          const saved = localStorage.getItem('daymate_preferences');
          if (saved) {
            setPreferences(JSON.parse(saved));
          }
        }
      } else {
        // Not authenticated, use localStorage
        const saved = localStorage.getItem('daymate_preferences');
        if (saved) {
          try {
            setPreferences(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse preferences', e);
          }
        }
        setSyncStatus(null);
      }
    };

    loadPreferences();
  }, [isAuthenticated, user]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Real-time traffic updates
  useEffect(() => {
    if (!planData?.city) return;

    const updateTrafficData = async () => {
      try {
        console.log('🔄 Updating real-time traffic data...');
        const response = await axios.post(`${API_URL}/api/plan`, {
          city: planData.city,
          profile: profile,
          preferences: preferences
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.traffic_data && !response.data.traffic_data.error) {
          // Update only the traffic data in the plan
          setPlanData(prevData => ({
            ...prevData,
            traffic_data: response.data.traffic_data,
            traffic_alerts: response.data.traffic_alerts || [],
            has_high_priority_alerts: response.data.has_high_priority_alerts || false
          }));

          console.log('✅ Traffic data updated successfully');
        }
      } catch (error) {
        console.error('❌ Failed to update traffic data:', error);
      }
    };

    // Update traffic data every 5 minutes
    const interval = setInterval(updateTrafficData, 5 * 60 * 1000);

    // Cleanup interval on unmount or city change
    return () => clearInterval(interval);
  }, [planData?.city, profile, preferences]);

  const handleSavePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    localStorage.setItem('daymate_preferences', JSON.stringify(newPrefs));
    
    // Sync to cloud if authenticated
    if (isAuthenticated && user) {
      setSyncStatus('syncing');
      try {
        const success = await saveUserPreferences(user.uid, newPrefs);
        setSyncStatus(success ? 'synced' : 'error');
        // Auto-hide synced status after 3 seconds
        if (success) {
          setTimeout(() => setSyncStatus(null), 3000);
        }
      } catch (e) {
        console.error('Failed to save preferences:', e);
        setSyncStatus('error');
      }
    }
  };

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
        ? { latitude: coordinates.latitude, longitude: coordinates.longitude, profile, preferences }
        : { city: cityName, profile, preferences };

      const response = await axios.post(`${API_URL}/api/plan`, requestBody, {
        timeout: 30000, // 30 second timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setPlanData(response.data);
      
      // Save last city for authenticated users
      if (isAuthenticated && user && response.data.city) {
        saveLastCity(user.uid, response.data.city);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 font-sans text-slate-900 selection:bg-pink-200 selection:text-pink-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-auto flex flex-col sm:flex-row items-center justify-between min-h-[4rem]">
          {/* Logo and Title - stack on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start py-2 sm:py-0">
            <button
              className="flex items-center gap-2 sm:gap-3 group w-full sm:w-auto"
              onClick={handleReset}
              title="Go to homepage"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform">
                <span className="text-lg sm:text-xl">🌤️</span>
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 group-hover:underline leading-tight">DayMate</h1>
                <p className="text-[0.7rem] sm:text-xs text-slate-500 font-medium">
                  {preferences?.name ? `Welcome, ${preferences.name}` : 'AI Daily Planner'}
                </p>
              </div>
            </button>
          </div>
          {/* Right side - Auth and Reset */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
            {/* Sync Status Indicator */}
            {isAuthenticated && syncStatus && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                syncStatus === 'synced' ? 'text-green-600' : 
                syncStatus === 'syncing' ? 'text-amber-600' : 'text-red-500'
              }`}>
                {syncStatus === 'syncing' && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {syncStatus === 'synced' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {syncStatus === 'error' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync error'}
                </span>
              </div>
            )}
            
            {planData && (
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-pink-600 bg-white/50 hover:bg-pink-50 rounded-lg transition-all duration-200 border border-slate-200/50"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Plan another city</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setIsChatHistoryOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 bg-white/50 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-slate-200/50"
                title="View chat history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Chat History</span>
              </button>
            )}
            
            {/* Auth Button */}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10 lg:py-12 overflow-x-hidden">
        {/* Search Section */}
        {!planData && !loading && (
          <div className="animate-fade-in max-w-3xl md:max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl xs:text-3xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500">
                {(() => {
                  if (preferences?.name && preferences.name.trim()) {
                    return `Ready for your day, ${preferences.name}?`;
                  } else if (user) {
                    const firstName = getFirstNameFromUser(user);
                    if (firstName) {
                      return `Ready for your day, ${firstName}?`;
                    }
                  }
                  return 'Plan Your Perfect Day';
                })()}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Enter your city and let DayMate create a personalized daily plan based on real-time weather and local news.
              </p>
            </div>

            {/* Profile Selection */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-pink-500/5 border border-white/50 p-4 sm:p-6 mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-4 text-center uppercase tracking-wider">
                Select Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {[
                  { id: 'standard', label: 'Standard', icon: '🧑', gradient: 'from-violet-500 to-purple-600' },
                  { id: 'child', label: 'Family/Child', icon: '🧸', gradient: 'from-pink-500 to-rose-500' },
                  { id: 'elderly', label: 'Elderly/Relaxed', icon: '🧓', gradient: 'from-orange-400 to-amber-500' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProfile(type.id)}
                    className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center min-w-0 break-words ${
                      profile === type.id
                        ? `bg-gradient-to-r ${type.gradient} text-white border-transparent shadow-lg`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:bg-pink-50/50'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{type.icon}</span>
                    <span className="font-semibold break-words text-base sm:text-lg max-w-[7.5rem] md:max-w-none">{type.label}</span>
                    {profile === type.id && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white/80"></div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="text-center border-t border-slate-200/50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPreferencesOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  {preferences ? 'Edit Preferences' : 'Customize Preferences'}
                </button>
              </div>
            </div>

            <PreferencesModal
              isOpen={isPreferencesOpen}
              onClose={() => setIsPreferencesOpen(false)}
              onSave={handleSavePreferences}
              initialPreferences={preferences}
            />

            {/* Search Form */}
            <form onSubmit={handlePlanGeneration} className="mb-6 sm:mb-8 relative z-10">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-2xl shadow-pink-500/10 rounded-2xl p-1 sm:p-2 bg-white/80 backdrop-blur-sm border border-white/50">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city..."
                  className="flex-1 p-3 sm:p-4 bg-transparent border-none focus:ring-0 text-base sm:text-lg placeholder:text-slate-400 text-slate-800"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!city.trim()}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:from-violet-700 hover:via-pink-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 whitespace-nowrap hover:shadow-xl hover:scale-[1.02] text-base sm:text-lg"
                >
                  Plan My Day ✨
                </button>
              </div>
            </form>

            {/* Use My Location Button */}
            <div className="text-center mb-8 sm:mb-12">
              <button
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm border border-violet-500 text-violet-700 font-medium rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm disabled:opacity-50"
              >
                {locationLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-pink-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Select Cities */}
            <div className="text-center mb-10 sm:mb-16">
              <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">Popular Destinations</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularCities.map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => handleQuickSelect(cityName)}
                    className="px-5 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-full text-sm font-medium text-slate-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-200"
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-md mx-auto mb-8">
                <ErrorMessage message={error} onRetry={() => setError(null)} />
              </div>
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '🌡️', title: 'Real-time Weather', desc: 'Accurate forecasts for your day', gradient: 'from-violet-500 to-purple-600' },
                { icon: '🚦', title: 'Traffic Alerts', desc: 'Stay safe with live updates', gradient: 'from-red-500 to-rose-500' },
                { icon: '📰', title: 'Local News', desc: 'Stay updated with local events', gradient: 'from-pink-500 to-rose-500' },
                { icon: '🤖', title: 'AI Recommendations', desc: 'Smart, personalized itinerary', gradient: 'from-orange-400 to-amber-500' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 text-center group hover:-translate-y-1">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Results Section */}
        {planData && !loading && (
          <div className="animate-fade-in space-y-8">
            {/* Service Errors Banner */}
            {planData.errors && planData.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-amber-800">Service Alert</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Some services are temporarily unavailable. We&apos;ve generated recommendations based on available data.
                  </p>
                </div>
              </div>
            )}
            
            {/* Weather and News Row */}
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                {/* Traffic Alerts - Show prominently if high priority */}
                {planData.has_high_priority_alerts && (
                  <TrafficAlerts
                    trafficData={planData.traffic_data}
                    alerts={planData.traffic_alerts}
                    hasHighPriority={planData.has_high_priority_alerts}
                    error={planData.errors?.find(e => e.service === 'traffic')?.message}
                  />
                )}
                <WeatherCard
                  weather={planData.weather}
                  error={planData.errors?.find(e => e.service === 'weather')?.message}
                />
                {/* Traffic Alerts - Normal position if no high priority */}
                {!planData.has_high_priority_alerts && (
                  <TrafficAlerts
                    trafficData={planData.traffic_data}
                    alerts={planData.traffic_alerts}
                    hasHighPriority={false}
                    error={planData.errors?.find(e => e.service === 'traffic')?.message}
                  />
                )}
                <NewsFeed 
                  news={planData.news} 
                  error={planData.errors?.find(e => e.service === 'news')?.message}
                />
              </div>
              
              <div className="lg:col-span-8">
                <PlanDisplay 
                  plan={planData.ai_plan} 
                  city={planData.city}
                  weather={planData.weather}
                  news={planData.news}
                  error={planData.errors?.find(e => e.service === 'ai')?.message}
                  profile={profile}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8 text-center">
          <p className="text-xs sm:text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600">
            DayMate &copy; {new Date().getFullYear()} &middot; AI Daily Planning Assistant
          </p>
          <p className="text-[0.65rem] sm:text-xs text-slate-500 mt-1 sm:mt-2">
            Powered by Open-Meteo, NewsAPI & Google Gemini
          </p>
        </div>
      </footer>

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
      />
    </div>
  );
}

export default App;
