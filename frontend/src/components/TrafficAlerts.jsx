/**
 * TrafficAlerts Component
 * Displays real-time traffic conditions with road-specific congestion levels and incidents
 */

import PropTypes from 'prop-types';

function TrafficAlerts({ trafficData, alerts = [], hasHighPriority = false, error = null }) {
  // If backend explicitly reports no live data, check if we have traffic alerts as fallback

  if (trafficData && trafficData.error) {
    // If we have traffic alerts from news sources, show them in a consistent real-time style
    if (trafficData.traffic_alerts && trafficData.traffic_alerts.length > 0) {
      return (
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">�</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Real-Time Traffic</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">News-Based</span>
                {/* intentionally hide long raw data_source string for cleaner UI */}
              </div>
            </div>
          </div>

          {/* High Priority Warning */}
          {trafficData.has_high_priority_alerts && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600">🚨</span>
                <span className="text-sm font-semibold text-red-800">High Priority Alerts Detected</span>
              </div>
              <p className="text-xs text-red-700 mt-1">Emergency situations may affect your plans. Please review alerts below.</p>
            </div>
          )}

          {/* Traffic Alerts from News */}
          <div className="space-y-3 mb-6">
            {trafficData.traffic_alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.priority === 'high' 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-amber-50 border-amber-400'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {alert.priority === 'high' ? '🚨' : '⚠️'}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800">{alert.title}</h4>
                    {alert.description && (
                      <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">{alert.source}</span>
                      {alert.published_at && (
                        <span className="text-xs text-slate-400">• {new Date(alert.published_at).toLocaleString()}</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.alert_type === 'emergency' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alert.alert_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage Note */}
          {trafficData.coverage_note && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600">{trafficData.coverage_note}</p>
            </div>
          )}

          {/* No Data Message */}
          {trafficData.traffic_alerts.length === 0 && (
            <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 my-4">
              <span className="text-2xl">✅</span>
              <span className="text-green-700 font-semibold text-base">No traffic issues reported. Roads look clear!</span>
            </div>
          )}
        </div>
      );
    }

    // No traffic alerts available, show error banner
    return (
      <div className="bg-yellow-50 border-l-4 border-amber-400 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">ℹ️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Traffic data unavailable</h3>
            <p className="text-sm text-amber-700 mt-1">{trafficData.message || 'Currently no traffic data available from any source.'}</p>
            {trafficData.coverage_note && (
              <p className="mt-2 text-xs text-slate-600">{trafficData.coverage_note}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">The app shows only live data — no simulations or historical patterns.</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have real-time traffic data, use it instead of legacy alerts
  if (trafficData && !trafficData.error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🚦</span>
          </div>
            <div>
            <h3 className="text-lg font-bold text-slate-800">Real-Time Traffic</h3>
            <div className="mt-1">
              {(() => {
                const ds = trafficData.data_source || '';
                if (ds.toLowerCase().includes('tomtom')) {
                  return <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">TomTom Open Traffic</span>;
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {trafficData.message && (
          <div className="text-xs text-amber-600 mb-4 flex items-center gap-2 bg-amber-50/80 rounded-lg p-2">
            <span>ℹ️</span>
            <span>{trafficData.message}</span>
          </div>
        )}

        {/* Road Conditions */}
        {trafficData.road_conditions && trafficData.road_conditions.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>🛣️</span>
              Road Conditions
            </h4>
            {trafficData.road_conditions.slice(0, 6).map((condition, index) => (
              <RoadConditionCard key={index} condition={condition} />
            ))}
          </div>
        )}

        {/* Traffic Incidents */}
        {trafficData.incidents && trafficData.incidents.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>⚠️</span>
              Active Incidents
            </h4>
            {trafficData.incidents.slice(0, 3).map((incident, index) => (
              <IncidentCard key={index} incident={incident} />
            ))}
          </div>
        )}

        {/* No Data Message */}
        {(!trafficData.road_conditions || trafficData.road_conditions.length === 0) &&
         (!trafficData.incidents || trafficData.incidents.length === 0) && (
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 my-4">
            <span className="text-2xl">✅</span>
            <span className="text-green-700 font-semibold text-base">No traffic issues reported. Roads look clear!</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback to legacy alerts display
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

// Road Condition Card Component
function RoadConditionCard({ condition }) {
  const getCongestionColor = (level) => {
    switch (level) {
      case 'free': return 'bg-green-100 border-green-300 text-green-800';
      case 'light': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'heavy': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'jammed': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCongestionIcon = (level) => {
    switch (level) {
      case 'free': return '🟢';
      case 'light': return '🔵';
      case 'moderate': return '🟡';
      case 'heavy': return '🟠';
      case 'jammed': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className={`p-3 rounded-xl border ${getCongestionColor(condition.congestion_level)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getCongestionIcon(condition.congestion_level)}</span>
          <h5 className="font-semibold text-sm">{condition.road_name}</h5>
        </div>
        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/50">
          {condition.congestion_level}
        </span>
      </div>
    </div>
  );
}

// Incident Card Component
function IncidentCard({ incident }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'major': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'accident': return '🚨';
      case 'construction': return '🚧';
      case 'road_closure': return '🚫';
      case 'weather': return '🌧️';
      case 'event': return '🎪';
      default: return '⚠️';
    }
  };

  return (
    <div className={`p-3 rounded-xl border ${getSeverityColor(incident.severity)}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{getIncidentIcon(incident.incident_type)}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-sm">{incident.road_name}</h5>
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/50">
              {incident.severity}
            </span>
          </div>
          <p className="text-xs mb-2">{incident.description}</p>
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>{incident.location}</span>
            {incident.delay_minutes && (
              <span className="font-semibold">Delay: {incident.delay_minutes} min</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

TrafficAlerts.propTypes = {
  trafficData: PropTypes.shape({
    error: PropTypes.bool,
    road_conditions: PropTypes.arrayOf(PropTypes.shape({
      road_name: PropTypes.string.isRequired,
      congestion_level: PropTypes.string.isRequired,
      speed_kmh: PropTypes.number.isRequired,
      normal_speed_kmh: PropTypes.number.isRequired,
      incident_type: PropTypes.string,
      description: PropTypes.string,
      last_updated: PropTypes.string.isRequired
    })),
    incidents: PropTypes.arrayOf(PropTypes.shape({
      incident_type: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
      road_name: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      start_time: PropTypes.string.isRequired,
      estimated_end_time: PropTypes.string,
      delay_minutes: PropTypes.number
    })),
    last_updated: PropTypes.string.isRequired,
    data_source: PropTypes.string.isRequired,
    is_simulated: PropTypes.bool
  }),
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

export default TrafficAlerts;
