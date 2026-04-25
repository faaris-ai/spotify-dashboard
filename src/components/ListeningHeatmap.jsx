import { useMemo } from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ListeningHeatmap({ data1, data2, label1, label2 }) {
  const heatmapData1 = useMemo(() => {
    if (!data1) return null;
    return buildHeatmap(data1);
  }, [data1]);

  const heatmapData2 = useMemo(() => {
    if (!data2) return null;
    return buildHeatmap(data2);
  }, [data2]);

  const maxValue1 = heatmapData1 ? Math.max(...heatmapData1.flat()) : 0;
  const maxValue2 = heatmapData2 ? Math.max(...heatmapData2.flat()) : 0;

  return (
    <div className="heatmap-container">
      <h3>Listening Intensity Heatmap</h3>
      <p className="heatmap-subtitle">When do you listen the most? Hour of day vs. day of week</p>

      <div className="heatmaps-wrapper">
        {heatmapData1 && (
          <div className="heatmap-section">
            <div className="heatmap-label" style={{ color: '#1DB954' }}>{label1}</div>
            <HeatmapGrid data={heatmapData1} maxValue={maxValue1} color="#1DB954" />
          </div>
        )}

        {heatmapData2 && (
          <div className="heatmap-section">
            <div className="heatmap-label" style={{ color: '#E91E63' }}>{label2}</div>
            <HeatmapGrid data={heatmapData2} maxValue={maxValue2} color="#E91E63" />
          </div>
        )}
      </div>

      <div className="heatmap-legend">
        <span className="legend-label">Less</span>
        <div className="legend-gradient"></div>
        <span className="legend-label">More</span>
      </div>
    </div>
  );
}

function buildHeatmap(data) {
  // Create 7x24 matrix (days x hours)
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

  data.forEach((record) => {
    const day = record.dayOfWeek;
    const hour = record.hour;
    matrix[day][hour] += record.minutesPlayed;
  });

  return matrix;
}

function HeatmapGrid({ data, maxValue, color }) {
  const getOpacity = (value) => {
    if (maxValue === 0) return 0.1;
    return 0.1 + (value / maxValue) * 0.9;
  };

  const formatMinutes = (mins) => {
    if (mins >= 60) {
      return `${(mins / 60).toFixed(1)}h`;
    }
    return `${Math.round(mins)}m`;
  };

  return (
    <div className="heatmap-grid">
      {/* Hour labels */}
      <div className="heatmap-hour-labels">
        <div className="heatmap-corner"></div>
        {HOURS.filter((h) => h % 3 === 0).map((hour) => (
          <div key={hour} className="hour-label" style={{ gridColumn: hour + 2 }}>
            {hour}:00
          </div>
        ))}
      </div>

      {/* Grid with day labels */}
      {DAYS.map((day, dayIdx) => (
        <div key={day} className="heatmap-row">
          <div className="day-label">{day}</div>
          {HOURS.map((hour) => {
            const value = data[dayIdx][hour];
            return (
              <div
                key={`${dayIdx}-${hour}`}
                className="heatmap-cell"
                style={{
                  backgroundColor: color,
                  opacity: getOpacity(value),
                }}
                title={`${day} ${hour}:00 - ${formatMinutes(value)}`}
              >
                <div className="cell-tooltip">
                  <strong>{day} {hour}:00</strong>
                  <br />
                  {formatMinutes(value)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
