import { useState, useEffect } from 'react';

const PreferencesModal = ({ isOpen, onClose, onSave, initialPreferences }) => {
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Personalize Your Day</h2>
            <p className="text-sm text-slate-500">Tell us what you like</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
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
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="any">Any / No Preference</option>
                <option value="walking">Walking Friendly</option>
                <option value="public_transport">Public Transport</option>
                <option value="driving">Driving</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
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
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="mixed">Mixed (Best of everything)</option>
                <option value="outdoor">Outdoor & Nature</option>
                <option value="indoor">Indoor (Museums/Cafes)</option>
                <option value="shopping">Shopping & Lifestyle</option>
                <option value="cultural">Cultural & Historical</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
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
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                      ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="solo">Just Me (Solo)</option>
                <option value="couple">Couple / Date</option>
                <option value="family">Family with Kids</option>
                <option value="friends">Group of Friends</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
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
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none transition-all"
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;
