import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getListeningTimeline, getStreakData } from '../utils/dataProcessing';

const P1_COLOR = '#1DB954';
const P2_COLOR = '#E91E63';

export default function TimelineCharts({ data1, data2, label1, label2 }) {
  const [granularity, setGranularity] = useState('day');

  const timeline1 = data1 ? getListeningTimeline(data1, granularity) : [];
  const timeline2 = data2 ? getListeningTimeline(data2, granularity) : [];
  const streak1 = data1 ? getStreakData(data1) : null;
  const streak2 = data2 ? getStreakData(data2) : null;

  // Merge timeline data
  const mergedTimeline = (() => {
    const map = new Map();
    timeline1.forEach((d) => map.set(d.date, { date: d.date, p1: d.minutes }));
    timeline2.forEach((d) => {
      const existing = map.get(d.date) || { date: d.date };
      existing.p2 = d.minutes;
      map.set(d.date, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const formatDate = (date) => {
    if (granularity === 'month') return date;
    const parts = date.split('-');
    if (granularity === 'day') return `${parts[1]}/${parts[2]}`;
    return `${parts[1]}/${parts[2]}`;
  };

  const showComparison = data1 && data2;

  return (
    <div className="timeline-charts">
      {/* Listening Timeline */}
      <div className="chart-container timeline-main">
        <div className="chart-header">
          <h3>Listening Timeline</h3>
          <div className="granularity-selector">
            {['day', 'week', 'month'].map((g) => (
              <button
                key={g}
                className={`granularity-btn ${granularity === g ? 'active' : ''}`}
                onClick={() => setGranularity(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={mergedTimeline} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P1_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={P1_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P2_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={P2_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#999', fontSize: 11 }}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#999' }}
              tickFormatter={(v) => `${Math.round(v)}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              formatter={(value) => [`${Math.round(value)} min`, '']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            {showComparison && <Legend />}
            {(data1 || !data2) && (
              <Area
                type="monotone"
                dataKey="p1"
                name={label1 || 'Person 1'}
                stroke={P1_COLOR}
                fillOpacity={1}
                fill="url(#colorP1)"
                strokeWidth={2}
              />
            )}
            {data2 && (
              <Area
                type="monotone"
                dataKey="p2"
                name={label2 || 'Person 2'}
                stroke={P2_COLOR}
                fillOpacity={1}
                fill="url(#colorP2)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Streak Trackers */}
      <div className="streak-row">
        {streak1 && (
          <div className="streak-card" style={{ '--accent-color': P1_COLOR }}>
            <h3>{label1}</h3>
            <div className="streak-stats">
              <div className="streak-stat main">
                <span className="streak-value">{streak1.longestStreak}</span>
                <span className="streak-label">Longest Streak</span>
                <span className="streak-unit">days</span>
              </div>
              <div className="streak-stat">
                <span className="streak-value">{streak1.currentStreak}</span>
                <span className="streak-label">Current Streak</span>
              </div>
              <div className="streak-stat">
                <span className="streak-value">{streak1.totalDays}</span>
                <span className="streak-label">Total Days</span>
              </div>
            </div>
            {streak1.streaks.length > 0 && (
              <div className="top-streaks">
                <h4>Top Streaks</h4>
                <ul>
                  {streak1.streaks.slice(0, 5).map((s, i) => (
                    <li key={i}>
                      <span className="streak-length">{s.length} days</span>
                      <span className="streak-dates">{s.start} to {s.end}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {streak2 && (
          <div className="streak-card" style={{ '--accent-color': P2_COLOR }}>
            <h3>{label2}</h3>
            <div className="streak-stats">
              <div className="streak-stat main">
                <span className="streak-value">{streak2.longestStreak}</span>
                <span className="streak-label">Longest Streak</span>
                <span className="streak-unit">days</span>
              </div>
              <div className="streak-stat">
                <span className="streak-value">{streak2.currentStreak}</span>
                <span className="streak-label">Current Streak</span>
              </div>
              <div className="streak-stat">
                <span className="streak-value">{streak2.totalDays}</span>
                <span className="streak-label">Total Days</span>
              </div>
            </div>
            {streak2.streaks.length > 0 && (
              <div className="top-streaks">
                <h4>Top Streaks</h4>
                <ul>
                  {streak2.streaks.slice(0, 5).map((s, i) => (
                    <li key={i}>
                      <span className="streak-length">{s.length} days</span>
                      <span className="streak-dates">{s.start} to {s.end}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
