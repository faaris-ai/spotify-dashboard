export default function StatsCard({ stats, label, color }) {
  if (!stats) return null;

  const formatMinutes = (mins) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = Math.round(mins % 60);
      return `${hours.toLocaleString()}h ${remainingMins}m`;
    }
    return `${Math.round(mins)}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="stats-card" style={{ borderColor: color }}>
      <h3 style={{ color }}>{label}</h3>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{stats.totalPlays.toLocaleString()}</span>
          <span className="stat-label">Total Plays</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatMinutes(stats.totalMinutes)}</span>
          <span className="stat-label">Total Time</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.uniqueArtists.toLocaleString()}</span>
          <span className="stat-label">Unique Artists</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.uniqueTracks.toLocaleString()}</span>
          <span className="stat-label">Unique Tracks</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(stats.skipRate * 100).toFixed(1)}%</span>
          <span className="stat-label">Skip Rate</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(stats.shuffleRate * 100).toFixed(1)}%</span>
          <span className="stat-label">Shuffle Rate</span>
        </div>
      </div>
      {stats.dateRange && (
        <div className="date-range">
          {formatDate(stats.dateRange.start)} — {formatDate(stats.dateRange.end)}
        </div>
      )}
    </div>
  );
}
