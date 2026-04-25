import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getSkipAnalysis,
  getSongCompletionStats,
  getReasonBreakdown,
  getOfflineStats,
} from '../utils/dataProcessing';

const P1_COLOR = '#1DB954';
const P2_COLOR = '#E91E63';

const REASON_COLORS = ['#1DB954', '#E91E63', '#9C27B0', '#FF9800', '#00BCD4', '#4CAF50', '#F44336', '#3F51B5'];

export default function BehaviorCharts({ data1, data2, label1, label2 }) {
  const skip1 = data1 ? getSkipAnalysis(data1) : null;
  const skip2 = data2 ? getSkipAnalysis(data2) : null;
  const completion1 = data1 ? getSongCompletionStats(data1) : null;
  const completion2 = data2 ? getSongCompletionStats(data2) : null;
  const reasons1 = data1 ? getReasonBreakdown(data1) : null;
  const reasons2 = data2 ? getReasonBreakdown(data2) : null;
  const offline1 = data1 ? getOfflineStats(data1) : null;
  const offline2 = data2 ? getOfflineStats(data2) : null;

  const renderSkipSection = (skip, label, color) => (
    <div className="behavior-section" style={{ '--accent-color': color }}>
      <h4>{label} - Most Skipped Artists</h4>
      <div className="skip-table-wrapper">
        <table className="behavior-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Artist</th>
              <th>Plays</th>
              <th>Skips</th>
              <th>Skip Rate</th>
            </tr>
          </thead>
          <tbody>
            {skip.mostSkippedArtists.slice(0, 10).map((a, i) => (
              <tr key={i}>
                <td className="rank">{i + 1}</td>
                <td className="name">{a.artist}</td>
                <td>{a.plays}</td>
                <td>{a.skips}</td>
                <td className="rate">{(a.skipRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompletionSection = (completion, label, color) => (
    <div className="completion-card" style={{ '--accent-color': color }}>
      <h4>{label}</h4>
      <div className="completion-stats">
        <div className="completion-stat main">
          <span className="value">{(completion.completionRate * 100).toFixed(1)}%</span>
          <span className="label">Completion Rate</span>
        </div>
        <div className="completion-breakdown">
          <div className="breakdown-item completed">
            <span className="count">{completion.completedCount.toLocaleString()}</span>
            <span className="type">Completed</span>
          </div>
          <div className="breakdown-item skipped">
            <span className="count">{completion.skippedCount.toLocaleString()}</span>
            <span className="type">Skipped</span>
          </div>
          <div className="breakdown-item partial">
            <span className="count">{completion.partialCount.toLocaleString()}</span>
            <span className="type">Partial</span>
          </div>
        </div>
        <div className="avg-listen">
          Avg. listen: {(completion.avgListenPercentage * 100).toFixed(0)}% of song
        </div>
      </div>
    </div>
  );

  const renderReasonPie = (reasons, type, label, color) => {
    const data = type === 'start' ? reasons.startReasons : reasons.endReasons;
    if (!data || data.length === 0) return null;

    return (
      <div className="reason-pie-section">
        <h4>{label} - {type === 'start' ? 'How Songs Started' : 'How Songs Ended'}</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.slice(0, 8)}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              nameKey="reason"
              label={({ reason, percentage }) => `${reason}: ${(percentage * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.slice(0, 8).map((_, index) => (
                <Cell key={`cell-${index}`} fill={REASON_COLORS[index % REASON_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
              }}
              formatter={(value, name) => [`${value.toLocaleString()} plays`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="reason-legend">
          {data.slice(0, 8).map((d, i) => (
            <span key={i} className="reason-tag" style={{ backgroundColor: REASON_COLORS[i % REASON_COLORS.length] + '20', color: REASON_COLORS[i % REASON_COLORS.length] }}>
              {d.reason}: {(d.percentage * 100).toFixed(1)}%
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderOfflineSection = (offline, label, color) => (
    <div className="offline-card" style={{ '--accent-color': color }}>
      <h4>{label}</h4>
      <div className="offline-stats">
        <div className="offline-stat">
          <div className="offline-bar">
            <div className="bar-fill online" style={{ width: `${(1 - offline.offlineRate) * 100}%` }}></div>
            <div className="bar-fill offline" style={{ width: `${offline.offlineRate * 100}%` }}></div>
          </div>
          <div className="bar-labels">
            <span>Online: {offline.onlineCount.toLocaleString()} ({((1 - offline.offlineRate) * 100).toFixed(1)}%)</span>
            <span>Offline: {offline.offlineCount.toLocaleString()} ({(offline.offlineRate * 100).toFixed(1)}%)</span>
          </div>
        </div>
        <div className="offline-minutes">
          <div className="minutes-item">
            <span className="minutes-value">{Math.round(offline.onlineMinutes / 60)}h</span>
            <span className="minutes-label">Online</span>
          </div>
          <div className="minutes-item">
            <span className="minutes-value">{Math.round(offline.offlineMinutes / 60)}h</span>
            <span className="minutes-label">Offline</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Skip rate by hour merged chart
  const mergedSkipByHour = skip1?.skipRateByHour.map((h, i) => ({
    hour: h.hour,
    label: h.label,
    p1: h.skipRate,
    p2: skip2?.skipRateByHour[i]?.skipRate || 0,
  })) || skip2?.skipRateByHour.map((h) => ({
    hour: h.hour,
    label: h.label,
    p2: h.skipRate,
  })) || [];

  return (
    <div className="behavior-charts">
      {/* Skip Analysis */}
      <div className="chart-container">
        <h3>Skip Analysis</h3>
        <div className="skip-sections">
          {skip1 && renderSkipSection(skip1, label1, P1_COLOR)}
          {skip2 && renderSkipSection(skip2, label2, P2_COLOR)}
        </div>
      </div>

      {/* Skip Rate by Hour */}
      <div className="chart-container">
        <h3>Skip Rate by Time of Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mergedSkipByHour} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="label" tick={{ fill: '#999', fontSize: 11 }} interval={2} />
            <YAxis tick={{ fill: '#999' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
              }}
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Skip Rate']}
            />
            {(data1 && data2) && <Legend />}
            {data1 && <Bar dataKey="p1" name={label1} fill={P1_COLOR} opacity={0.85} />}
            {data2 && <Bar dataKey="p2" name={label2} fill={P2_COLOR} opacity={0.85} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Song Completion Rate */}
      <div className="chart-container">
        <h3>Song Completion Rate</h3>
        <p className="chart-subtitle">Songs played 30+ seconds without skipping are considered "completed"</p>
        <div className="completion-row">
          {completion1 && renderCompletionSection(completion1, label1, P1_COLOR)}
          {completion2 && renderCompletionSection(completion2, label2, P2_COLOR)}
        </div>
      </div>

      {/* Start/End Reasons */}
      <div className="chart-container">
        <h3>How Songs Start & End</h3>
        <div className="reasons-grid">
          {reasons1 && renderReasonPie(reasons1, 'start', label1, P1_COLOR)}
          {reasons1 && renderReasonPie(reasons1, 'end', label1, P1_COLOR)}
          {reasons2 && renderReasonPie(reasons2, 'start', label2, P2_COLOR)}
          {reasons2 && renderReasonPie(reasons2, 'end', label2, P2_COLOR)}
        </div>
      </div>

      {/* Offline vs Online */}
      <div className="chart-container">
        <h3>Offline vs Online Listening</h3>
        <div className="offline-row">
          {offline1 && renderOfflineSection(offline1, label1, P1_COLOR)}
          {offline2 && renderOfflineSection(offline2, label2, P2_COLOR)}
        </div>
      </div>
    </div>
  );
}
