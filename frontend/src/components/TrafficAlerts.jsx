/**
 * TrafficAlerts Component
 * Displays traffic and emergency alerts with priority-based styling
 */

import PropTypes from 'prop-types';

function TrafficAlerts({ alerts, hasHighPriority, error }) {
  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🚨</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Traffic Alerts</h3>
        </div>
        <p className="text-slate-500 text-sm italic">Unable to fetch traffic alerts</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">✅</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Traffic Alerts</h3>
        </div>
        <p className="text-slate-500 text-sm">No traffic alerts in your area. Roads look clear!</p>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-sm rounded-3xl shadow-lg border p-6 transition-all duration-300 ${
      hasHighPriority 
        ? 'bg-red-50/80 border-red-200 shadow-red-500/20' 
        : 'bg-white/60 border-white/50 shadow-slate-200/50'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
          hasHighPriority 
            ? 'bg-gradient-to-br from-red-500 to-rose-600 animate-pulse' 
            : 'bg-gradient-to-br from-amber-500 to-orange-500'
        }`}>
          <span className="text-xl">{hasHighPriority ? '🚨' : '⚠️'}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Traffic & Emergency Alerts</h3>
          {hasHighPriority && (
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider animate-pulse">
              High Priority Alerts Active
            </span>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => (
          <a
            key={index}
            href={alert.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
              alert.priority === 'high'
                ? 'bg-red-100/80 border-red-300 hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/20'
                : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100 hover:shadow-lg hover:shadow-amber-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Priority Indicator */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                alert.priority === 'high' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-amber-500 text-white'
              }`}>
                <span className="text-sm font-bold">
                  {alert.alert_type === 'emergency' ? '🚨' : '🚗'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Alert Type Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    alert.priority === 'high'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {alert.alert_type === 'emergency' ? 'Emergency' : 'Traffic'}
                  </span>
                  {alert.priority === 'high' && (
                    <span className="text-xs text-red-600 font-semibold">URGENT</span>
                  )}
                </div>

                {/* Title */}
                <h4 className={`font-semibold text-sm leading-snug line-clamp-2 ${
                  alert.priority === 'high' ? 'text-red-800' : 'text-amber-800'
                }`}>
                  {alert.title}
                </h4>

                {/* Source and Time */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-medium">{alert.source}</span>
                  {alert.published_at && (
                    <>
                      <span>•</span>
                      <span>{new Date(alert.published_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* External Link Icon */}
              <svg className={`w-4 h-4 flex-shrink-0 ${
                alert.priority === 'high' ? 'text-red-400' : 'text-amber-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Safety Tip */}
      {hasHighPriority && (
        <div className="mt-4 p-3 bg-red-200/50 rounded-xl border border-red-300">
          <p className="text-sm text-red-800 font-medium flex items-center gap-2">
            <span>💡</span>
            <span>Check your route before leaving. The AI plan above has been adjusted for these alerts.</span>
          </p>
        </div>
      )}
    </div>
  );
}

TrafficAlerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    url: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    alert_type: PropTypes.string,
    priority: PropTypes.string
  })),
  hasHighPriority: PropTypes.bool,
  error: PropTypes.string
};

TrafficAlerts.defaultProps = {
  alerts: [],
  hasHighPriority: false,
  error: null
};

export default TrafficAlerts;
