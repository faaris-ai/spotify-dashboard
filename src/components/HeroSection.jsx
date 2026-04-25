import AnimatedNumber from './AnimatedNumber';
import { getTopArtists, getTopTracks } from '../utils/dataProcessing';

export default function HeroSection({ stats, data, label, color }) {
  if (!stats || !data) return null;

  const topArtist = getTopArtists(data, 1)[0];
  const topTrack = getTopTracks(data, 1)[0];
  const totalHours = Math.round(stats.totalMinutes / 60);

  return (
    <div className="hero-section" style={{ '--accent-color': color }}>
      <div className="hero-label">{label}</div>

      <div className="hero-stats">
        <div className="hero-stat hero-stat-main">
          <div className="hero-stat-value">
            <AnimatedNumber value={totalHours} duration={2000} />
          </div>
          <div className="hero-stat-label">Hours Listened</div>
          <div className="hero-stat-sub">
            That's <AnimatedNumber value={Math.round(totalHours / 24)} duration={2000} /> days of music
          </div>
        </div>

        <div className="hero-highlights">
          {topArtist && (
            <div className="hero-highlight">
              <div className="highlight-label">Top Artist</div>
              <div className="highlight-value">{topArtist.artist}</div>
              <div className="highlight-sub">
                <AnimatedNumber value={topArtist.count} duration={1500} /> plays
              </div>
            </div>
          )}

          {topTrack && (
            <div className="hero-highlight">
              <div className="highlight-label">Top Track</div>
              <div className="highlight-value">{topTrack.track}</div>
              <div className="highlight-sub">by {topTrack.artist}</div>
            </div>
          )}
        </div>
      </div>

      <div className="hero-quick-stats">
        <div className="quick-stat">
          <span className="quick-value"><AnimatedNumber value={stats.totalPlays} duration={1800} /></span>
          <span className="quick-label">Total Plays</span>
        </div>
        <div className="quick-stat">
          <span className="quick-value"><AnimatedNumber value={stats.uniqueArtists} duration={1800} /></span>
          <span className="quick-label">Artists</span>
        </div>
        <div className="quick-stat">
          <span className="quick-value"><AnimatedNumber value={stats.uniqueTracks} duration={1800} /></span>
          <span className="quick-label">Tracks</span>
        </div>
        <div className="quick-stat">
          <span className="quick-value"><AnimatedNumber value={stats.skipRate * 100} format="percent" duration={1500} /></span>
          <span className="quick-label">Skip Rate</span>
        </div>
      </div>
    </div>
  );
}
