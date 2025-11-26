import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PreferencesModal = ({ isOpen, onClose, onSave, initialPreferences }) => {
  const { isAuthenticated, user } = useAuth();
  const [preferences, setPreferences] = useState({
    name: '',
    travel_mode: 'any',
    food_preference: '',
    activity_type: 'mixed',
    pace: 'medium',
    budget: 'medium',
    companions: 'solo',
    interests: ''
  });

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(prev => ({
        ...prev,
        ...initialPreferences
      }));
    }
  }, [initialPreferences]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(preferences);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-pink-500/10 max-w-lg w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/50">
        <div className="flex justify-between items-start mb-8 sticky top-0 bg-white/95 z-10 pb-4 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500">Your Preferences</h2>
              <p className="text-sm text-slate-500">Help AI understand you better</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
            <input
              type="text"
              name="name"
              value={preferences.name || ''}
              onChange={handleChange}
              placeholder="What should we call you?"
              className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Travel Mode */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Preference</label>
            <div className="relative">
              <select
                name="travel_mode"
                value={preferences.travel_mode}
                onChange={handleChange}
                className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="any">Any / No Preference</option>
                <option value="walking">Walking Friendly</option>
                <option value="public_transport">Public Transport</option>
                <option value="driving">Driving</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Food Preference */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Food & Dietary</label>
            <input
              type="text"
              name="food_preference"
              value={preferences.food_preference}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Italian, Spicy..."
              className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Style</label>
            <div className="relative">
              <select
                name="activity_type"
                value={preferences.activity_type}
                onChange={handleChange}
                className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="mixed">Mixed (Best of everything)</option>
                <option value="outdoor">Outdoor & Nature</option>
                <option value="indoor">Indoor (Museums/Cafes)</option>
                <option value="shopping">Shopping & Lifestyle</option>
                <option value="cultural">Cultural & Historical</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pace */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pace of the Day</label>
            <div className="flex gap-3">
              {['relaxed', 'medium', 'packed'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'pace', value: p } })}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    preferences.pace === p
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-md'
                      : 'bg-white border-violet-200 text-slate-600 hover:bg-violet-50'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Budget Level</label>
            <div className="flex gap-3">
              {[
                { val: 'low', label: '$ Budget' },
                { val: 'medium', label: '$$ Standard' },
                { val: 'high', label: '$$$ Luxury' }
              ].map((b) => (
                <button
                  key={b.val}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'budget', value: b.val } })}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    preferences.budget === b.val
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md'
                      : 'bg-white border-pink-200 text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Companions */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Who are you with?</label>
            <div className="relative">
              <select
                name="companions"
                value={preferences.companions || 'solo'}
                onChange={handleChange}
                className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="solo">Just Me (Solo)</option>
                <option value="couple">Couple / Date</option>
                <option value="family">Family with Kids</option>
                <option value="friends">Group of Friends</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Interests / Constraints</label>
            <textarea
              name="interests"
              value={preferences.interests || ''}
              onChange={handleChange}
              placeholder="e.g., Morning workout, 9-5 office hours, love art galleries..."
              className="w-full p-4 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent h-32 resize-none transition-all"
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            {/* Sync indicator for authenticated users */}
            {isAuthenticated && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 py-2 px-4 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span>Synced to cloud as {user?.displayName || user?.email}</span>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 py-2 px-4 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Sign in to sync preferences across devices</span>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:from-violet-700 hover:via-pink-700 hover:to-orange-600 transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transform hover:-translate-y-0.5"
            >
              Save Preferences ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;
