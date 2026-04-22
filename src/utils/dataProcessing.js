// Data processing utilities for Spotify streaming history

export function processSpotifyData(rawData, personId = 1) {
  return rawData
    .map((record) => {
      const ts = new Date(record.ts);
      return {
        ...record,
        person: personId,
        track: record.master_metadata_track_name || record.track,
        artist: record.master_metadata_album_artist_name || record.artist,
        album: record.master_metadata_album_album_name || record.album,
        ts,
        hour: ts.getHours(),
        dayOfWeek: ts.getDay(),
        month: ts.getMonth(),
        year: ts.getFullYear(),
        minutesPlayed: (record.ms_played || 0) / 60000,
        shuffle: record.shuffle ? 1 : 0,
        skipped: record.skipped ? 1 : 0,
      };
    })
    .filter((r) => r.track && r.artist);
}

export function getHourlyDistribution(data) {
  const hours = Array(24).fill(0);
  data.forEach((r) => {
    hours[r.hour] += r.minutesPlayed;
  });
  const total = hours.reduce((a, b) => a + b, 0);
  return hours.map((val, hour) => ({
    hour,
    label: `${hour}:00`,
    minutes: val,
    proportion: total > 0 ? val / total : 0,
  }));
}

export function getDayOfWeekDistribution(data) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = Array(7).fill(0);
  data.forEach((r) => {
    dayTotals[r.dayOfWeek] += r.minutesPlayed;
  });
  const total = dayTotals.reduce((a, b) => a + b, 0);
  return dayTotals.map((val, idx) => ({
    day: days[idx],
    dayIndex: idx,
    minutes: val,
    proportion: total > 0 ? val / total : 0,
  }));
}

export function getMonthlyDistribution(data) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthTotals = Array(12).fill(0);
  data.forEach((r) => {
    monthTotals[r.month] += r.minutesPlayed;
  });
  const total = monthTotals.reduce((a, b) => a + b, 0);
  return monthTotals.map((val, idx) => ({
    month: months[idx],
    monthIndex: idx,
    minutes: val,
    proportion: total > 0 ? val / total : 0,
  }));
}

export function getTopArtists(data, limit = 20) {
  const artistCounts = {};
  const artistMinutes = {};
  data.forEach((r) => {
    artistCounts[r.artist] = (artistCounts[r.artist] || 0) + 1;
    artistMinutes[r.artist] = (artistMinutes[r.artist] || 0) + r.minutesPlayed;
  });
  return Object.entries(artistCounts)
    .map(([artist, count]) => ({
      artist,
      count,
      minutes: artistMinutes[artist],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopTracks(data, limit = 20) {
  const trackCounts = {};
  const trackMinutes = {};
  const trackArtists = {};
  data.forEach((r) => {
    const key = `${r.track}|||${r.artist}`;
    trackCounts[key] = (trackCounts[key] || 0) + 1;
    trackMinutes[key] = (trackMinutes[key] || 0) + r.minutesPlayed;
    trackArtists[key] = r.artist;
  });
  return Object.entries(trackCounts)
    .map(([key, count]) => {
      const [track] = key.split('|||');
      return {
        track,
        artist: trackArtists[key],
        count,
        minutes: trackMinutes[key],
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getStats(data) {
  const uniqueArtists = new Set(data.map((r) => r.artist)).size;
  const uniqueTracks = new Set(data.map((r) => r.track)).size;
  const totalMinutes = data.reduce((sum, r) => sum + r.minutesPlayed, 0);
  const totalPlays = data.length;
  const skipRate = data.filter((r) => r.skipped).length / data.length;
  const shuffleRate = data.filter((r) => r.shuffle).length / data.length;

  const dates = data.map((r) => r.ts).sort((a, b) => a - b);
  const dateRange = dates.length > 0
    ? { start: dates[0], end: dates[dates.length - 1] }
    : null;

  return {
    uniqueArtists,
    uniqueTracks,
    totalMinutes,
    totalPlays,
    skipRate,
    shuffleRate,
    dateRange,
  };
}

export function getLikedSongs(data, thresholdMs = 30000) {
  return data.filter((r) => r.ms_played > thresholdMs);
}
