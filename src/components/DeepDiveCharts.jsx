import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  getTopAlbums,
  getDiscoveryVsLoyalty,
  getListeningSessions,
  getTimeOfDayArtists,
} from '../utils/dataProcessing';

const P1_COLOR = '#1DB954';
const P2_COLOR = '#E91E63';

const PERIOD_LABELS = {
  morning: 'Morning (5am-11am)',
  afternoon: 'Afternoon (12pm-5pm)',
  evening: 'Evening (6pm-9pm)',
  night: 'Night (10pm-4am)',
};

const PERIOD_ICONS = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
};

export default function DeepDiveCharts({ data1, data2, label1, label2 }) {
  const albums1 = data1 ? getTopAlbums(data1, 15) : [];
  const albums2 = data2 ? getTopAlbums(data2, 15) : [];
  const discovery1 = data1 ? getDiscoveryVsLoyalty(data1) : [];
  const discovery2 = data2 ? getDiscoveryVsLoyalty(data2) : [];
  const sessions1 = data1 ? getListeningSessions(data1) : null;
  const sessions2 = data2 ? getListeningSessions(data2) : null;
  const timeArtists1 = data1 ? getTimeOfDayArtists(data1) : null;
  const timeArtists2 = data2 ? getTimeOfDayArtists(data2) : null;

  const renderAlbumTable = (albums, label, color) => (
    <div className="top-items-section" style={{ borderLeftColor: color }}>
      <h3 style={{ color }}>{label} - Top Albums</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Album</th>
            <th>Artist</th>
            <th>Plays</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((a, i) => (
            <tr key={i}>
              <td className={`rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                {i + 1}
              </td>
              <td className="name">{a.album}</td>
              <td className="artist">{a.artist}</td>
              <td className="count">{a.count}</td>
              <td className="time">{Math.round(a.minutes)}m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSessionStats = (sessions, label, color) => {
    if (!sessions || !sessions.stats) return null;
    const { stats, sessionsOverTime } = sessions;

    return (
      <div className="session-card" style={{ '--accent-color': color }}>
        <h4>{label}</h4>
        <div className="session-stats">
          <div className="session-stat">
            <span className="value">{stats.totalSessions.toLocaleString()}</span>
            <span className="label">Total Sessions</span>
          </div>
          <div className="session-stat">
            <span className="value">{Math.round(stats.avgSessionLength)}m</span>
            <span className="label">Avg Length</span>
          </div>
          <div className="session-stat">
            <span className="value">{Math.round(stats.longestSession)}m</span>
            <span className="label">Longest</span>
          </div>
          <div className="session-stat">
            <span className="value">{stats.avgTracksPerSession.toFixed(1)}</span>
            <span className="label">Avg Tracks</span>
          </div>
        </div>
        {sessionsOverTime && sessionsOverTime.length > 0 && (
          <div className="sessions-over-time">
            <h5>Sessions Over Time</h5>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={sessionsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#999', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#999', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill={color} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderTimeOfDayArtists = (timeArtists, label, color) => {
    if (!timeArtists) return null;

    return (
      <div className="time-artists-card" style={{ '--accent-color': color }}>
        <h4>{label}</h4>
        <div className="time-periods">
          {Object.entries(timeArtists).map(([period, artists]) => (
            <div key={period} className="time-period">
              <h5>{PERIOD_ICONS[period]} {PERIOD_LABELS[period]}</h5>
              <div className="period-artists">
                {artists.map((a, i) => (
                  <div key={i} className="period-artist">
                    <span className="artist-rank">{i + 1}</span>
                    <span className="artist-name">{a.artist}</span>
                    <span className="artist-minutes">{Math.round(a.minutes)}m</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Prepare scatter data
  const scatterData1 = discovery1.slice(0, 50).map((d) => ({
    ...d,
    x: d.totalPlays,
    y: d.uniqueTracks,
    z: d.minutes,
  }));

  const scatterData2 = discovery2.slice(0, 50).map((d) => ({
    ...d,
    x: d.totalPlays,
    y: d.uniqueTracks,
    z: d.minutes,
  }));

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="scatter-tooltip">
          <p className="artist-name">{data.artist}</p>
          <p>Total Plays: {data.totalPlays}</p>
          <p>Unique Tracks: {data.uniqueTracks}</p>
          <p>Avg Plays/Track: {data.avgPlaysPerTrack.toFixed(1)}</p>
          <p>Time: {Math.round(data.minutes)}m</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="deep-dive-charts">
      {/* Top Albums */}
      <div className="chart-container">
        <h3>Top Albums</h3>
        <div className="albums-row">
          {albums1.length > 0 && renderAlbumTable(albums1, label1, P1_COLOR)}
          {albums2.length > 0 && renderAlbumTable(albums2, label2, P2_COLOR)}
        </div>
      </div>

      {/* Discovery vs Loyalty */}
      <div className="chart-container">
        <h3>Discovery vs Loyalty</h3>
        <p className="chart-subtitle">
          X-axis: Total plays | Y-axis: Unique tracks played |
          High plays + few tracks = obsessed with a few songs | Many tracks = deep exploration
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              dataKey="x"
              name="Total Plays"
              tick={{ fill: '#999' }}
              label={{ value: 'Total Plays', position: 'bottom', fill: '#666' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Unique Tracks"
              tick={{ fill: '#999' }}
              label={{ value: 'Unique Tracks', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Minutes" />
            <Tooltip content={<CustomScatterTooltip />} />
            {(data1 && data2) && <Legend />}
            {data1 && (
              <Scatter
                name={label1}
                data={scatterData1}
                fill={P1_COLOR}
                opacity={0.7}
              />
            )}
            {data2 && (
              <Scatter
                name={label2}
                data={scatterData2}
                fill={P2_COLOR}
                opacity={0.7}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Listening Sessions */}
      <div className="chart-container">
        <h3>Listening Sessions</h3>
        <p className="chart-subtitle">Sessions are grouped plays with less than 30 minutes gap between them</p>
        <div className="sessions-row">
          {sessions1 && renderSessionStats(sessions1, label1, P1_COLOR)}
          {sessions2 && renderSessionStats(sessions2, label2, P2_COLOR)}
        </div>
      </div>

      {/* Time of Day Artist Mood */}
      <div className="chart-container">
        <h3>Time-of-Day Artist Mood</h3>
        <p className="chart-subtitle">Which artists dominate different times of day</p>
        <div className="time-artists-row">
          {timeArtists1 && renderTimeOfDayArtists(timeArtists1, label1, P1_COLOR)}
          {timeArtists2 && renderTimeOfDayArtists(timeArtists2, label2, P2_COLOR)}
        </div>
      </div>
    </div>
  );
}
