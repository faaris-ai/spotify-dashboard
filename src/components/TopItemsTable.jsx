import { getTopArtists, getTopTracks } from '../utils/dataProcessing';

export default function TopItemsTable({ data, label, color }) {
  if (!data || data.length === 0) return null;

  const topArtists = getTopArtists(data, 15);
  const topTracks = getTopTracks(data, 15);

  const formatMinutes = (mins) => {
    if (mins >= 60) {
      return `${(mins / 60).toFixed(1)}h`;
    }
    return `${mins.toFixed(1)}m`;
  };

  const rankClass = (idx) => {
    if (idx === 0) return 'rank gold';
    if (idx === 1) return 'rank silver';
    if (idx === 2) return 'rank bronze';
    return 'rank';
  };

  return (
    <div className="top-items">
      <div className="top-items-section">
        <h3 style={{ color }}>Top Artists — {label}</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Artist</th>
              <th>Plays</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {topArtists.map((artist, idx) => (
              <tr key={artist.artist}>
                <td className={rankClass(idx)}>{idx + 1}</td>
                <td className="name">{artist.artist}</td>
                <td className="count">{artist.count.toLocaleString()}</td>
                <td className="time">{formatMinutes(artist.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="top-items-section">
        <h3 style={{ color }}>Top Tracks — {label}</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Track</th>
              <th>Artist</th>
              <th>Plays</th>
            </tr>
          </thead>
          <tbody>
            {topTracks.map((track, idx) => (
              <tr key={`${track.track}-${track.artist}`}>
                <td className={rankClass(idx)}>{idx + 1}</td>
                <td className="name">{track.track}</td>
                <td className="artist">{track.artist}</td>
                <td className="count">{track.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
