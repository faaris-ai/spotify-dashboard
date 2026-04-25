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

// ═══════════════════════════════════════════
// NEW VISUALIZATIONS - Data Processing
// ═══════════════════════════════════════════

// 1. Listening Timeline - minutes per day/week/month over time
export function getListeningTimeline(data, granularity = 'day') {
  const grouped = {};

  data.forEach((r) => {
    let key;
    const d = r.ts;

    if (granularity === 'day') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (granularity === 'week') {
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      key = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
    } else if (granularity === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, minutes: 0, plays: 0 };
    }
    grouped[key].minutes += r.minutesPlayed;
    grouped[key].plays += 1;
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

// 2. Skip Analysis - artists/tracks with highest skip rates
export function getSkipAnalysis(data) {
  // Skip rate by artist
  const artistStats = {};
  data.forEach((r) => {
    if (!artistStats[r.artist]) {
      artistStats[r.artist] = { plays: 0, skips: 0, totalMs: 0 };
    }
    artistStats[r.artist].plays += 1;
    artistStats[r.artist].skips += r.skipped ? 1 : 0;
    artistStats[r.artist].totalMs += r.ms_played || 0;
  });

  const mostSkippedArtists = Object.entries(artistStats)
    .filter(([_, s]) => s.plays >= 5) // At least 5 plays
    .map(([artist, s]) => ({
      artist,
      plays: s.plays,
      skips: s.skips,
      skipRate: s.skips / s.plays,
      avgListenedMs: s.totalMs / s.plays,
    }))
    .sort((a, b) => b.skipRate - a.skipRate)
    .slice(0, 15);

  // Skip rate by track
  const trackStats = {};
  data.forEach((r) => {
    const key = `${r.track}|||${r.artist}`;
    if (!trackStats[key]) {
      trackStats[key] = { track: r.track, artist: r.artist, plays: 0, skips: 0, totalMs: 0 };
    }
    trackStats[key].plays += 1;
    trackStats[key].skips += r.skipped ? 1 : 0;
    trackStats[key].totalMs += r.ms_played || 0;
  });

  const mostSkippedTracks = Object.values(trackStats)
    .filter((s) => s.plays >= 3)
    .map((s) => ({
      ...s,
      skipRate: s.skips / s.plays,
      avgListenedMs: s.totalMs / s.plays,
    }))
    .sort((a, b) => b.skipRate - a.skipRate)
    .slice(0, 15);

  // Skip rate by hour
  const hourlySkips = Array(24).fill(null).map(() => ({ plays: 0, skips: 0 }));
  data.forEach((r) => {
    hourlySkips[r.hour].plays += 1;
    hourlySkips[r.hour].skips += r.skipped ? 1 : 0;
  });

  const skipRateByHour = hourlySkips.map((h, hour) => ({
    hour,
    label: `${hour}:00`,
    skipRate: h.plays > 0 ? h.skips / h.plays : 0,
    plays: h.plays,
    skips: h.skips,
  }));

  return { mostSkippedArtists, mostSkippedTracks, skipRateByHour };
}

// 3. Top Albums
export function getTopAlbums(data, limit = 20) {
  const albumCounts = {};
  const albumMinutes = {};
  const albumArtists = {};

  data.forEach((r) => {
    if (!r.album) return;
    const key = `${r.album}|||${r.artist}`;
    albumCounts[key] = (albumCounts[key] || 0) + 1;
    albumMinutes[key] = (albumMinutes[key] || 0) + r.minutesPlayed;
    albumArtists[key] = r.artist;
  });

  return Object.entries(albumCounts)
    .map(([key, count]) => {
      const [album] = key.split('|||');
      return {
        album,
        artist: albumArtists[key],
        count,
        minutes: albumMinutes[key],
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 4. Discovery vs Loyalty - scatter plot data
export function getDiscoveryVsLoyalty(data) {
  const artistData = {};

  data.forEach((r) => {
    if (!artistData[r.artist]) {
      artistData[r.artist] = { tracks: new Set(), plays: 0, minutes: 0 };
    }
    artistData[r.artist].tracks.add(r.track);
    artistData[r.artist].plays += 1;
    artistData[r.artist].minutes += r.minutesPlayed;
  });

  return Object.entries(artistData)
    .map(([artist, d]) => ({
      artist,
      uniqueTracks: d.tracks.size,
      totalPlays: d.plays,
      minutes: d.minutes,
      avgPlaysPerTrack: d.plays / d.tracks.size,
    }))
    .filter((d) => d.totalPlays >= 5)
    .sort((a, b) => b.totalPlays - a.totalPlays);
}

// 5. Listening Sessions - group consecutive plays
export function getListeningSessions(data, gapMinutes = 30) {
  if (data.length === 0) return { sessions: [], stats: null };

  const sorted = [...data].sort((a, b) => a.ts - b.ts);
  const sessions = [];
  let currentSession = { start: sorted[0].ts, end: sorted[0].ts, plays: 1, minutes: sorted[0].minutesPlayed, tracks: [sorted[0]] };

  for (let i = 1; i < sorted.length; i++) {
    const gap = (sorted[i].ts - currentSession.end) / 60000; // gap in minutes

    if (gap <= gapMinutes) {
      currentSession.end = sorted[i].ts;
      currentSession.plays += 1;
      currentSession.minutes += sorted[i].minutesPlayed;
      currentSession.tracks.push(sorted[i]);
    } else {
      currentSession.duration = (currentSession.end - currentSession.start) / 60000 + currentSession.tracks[currentSession.tracks.length - 1].minutesPlayed;
      sessions.push(currentSession);
      currentSession = { start: sorted[i].ts, end: sorted[i].ts, plays: 1, minutes: sorted[i].minutesPlayed, tracks: [sorted[i]] };
    }
  }
  currentSession.duration = (currentSession.end - currentSession.start) / 60000 + currentSession.tracks[currentSession.tracks.length - 1].minutesPlayed;
  sessions.push(currentSession);

  // Calculate stats
  const durations = sessions.map((s) => s.duration);
  const stats = {
    totalSessions: sessions.length,
    avgSessionLength: durations.reduce((a, b) => a + b, 0) / sessions.length,
    longestSession: Math.max(...durations),
    avgTracksPerSession: sessions.reduce((sum, s) => sum + s.plays, 0) / sessions.length,
  };

  // Sessions over time (by month)
  const sessionsByMonth = {};
  sessions.forEach((s) => {
    const key = `${s.start.getFullYear()}-${String(s.start.getMonth() + 1).padStart(2, '0')}`;
    sessionsByMonth[key] = (sessionsByMonth[key] || 0) + 1;
  });

  const sessionsOverTime = Object.entries(sessionsByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { sessions, stats, sessionsOverTime };
}

// 6. Streak Tracker - consecutive days
export function getStreakData(data) {
  const dates = new Set();
  data.forEach((r) => {
    const d = r.ts;
    dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  });

  const sortedDates = Array.from(dates).sort();
  if (sortedDates.length === 0) return { longestStreak: 0, currentStreak: 0, streaks: [] };

  const streaks = [];
  let currentStreak = 1;
  let longestStreak = 1;
  let streakStart = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      currentStreak++;
    } else {
      streaks.push({ start: streakStart, end: sortedDates[i - 1], length: currentStreak });
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
      streakStart = sortedDates[i];
    }
  }
  streaks.push({ start: streakStart, end: sortedDates[sortedDates.length - 1], length: currentStreak });
  longestStreak = Math.max(longestStreak, currentStreak);

  // Check if current streak is ongoing (last date is today or yesterday)
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLastListen = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  const isCurrentStreakActive = daysSinceLastListen <= 1;

  return {
    longestStreak,
    currentStreak: isCurrentStreakActive ? streaks[streaks.length - 1].length : 0,
    totalDays: sortedDates.length,
    streaks: streaks.sort((a, b) => b.length - a.length).slice(0, 10),
  };
}

// 7. Song Completion Rate
export function getSongCompletionStats(data, completionThresholdMs = 30000) {
  const completed = data.filter((r) => (r.ms_played || 0) >= completionThresholdMs && !r.skipped);
  const skipped = data.filter((r) => r.skipped);
  const partial = data.filter((r) => (r.ms_played || 0) < completionThresholdMs && !r.skipped);

  // Average listen percentage (assuming ~3min avg song)
  const avgSongMs = 180000;
  const avgListenPercentage = data.reduce((sum, r) => sum + Math.min((r.ms_played || 0) / avgSongMs, 1), 0) / data.length;

  // Completion by hour
  const hourlyCompletion = Array(24).fill(null).map(() => ({ total: 0, completed: 0 }));
  data.forEach((r) => {
    hourlyCompletion[r.hour].total += 1;
    if ((r.ms_played || 0) >= completionThresholdMs && !r.skipped) {
      hourlyCompletion[r.hour].completed += 1;
    }
  });

  const completionByHour = hourlyCompletion.map((h, hour) => ({
    hour,
    label: `${hour}:00`,
    completionRate: h.total > 0 ? h.completed / h.total : 0,
    total: h.total,
  }));

  return {
    completedCount: completed.length,
    skippedCount: skipped.length,
    partialCount: partial.length,
    completionRate: completed.length / data.length,
    avgListenPercentage,
    completionByHour,
  };
}

// 8. Start/End Reason Breakdown
export function getReasonBreakdown(data) {
  const startReasons = {};
  const endReasons = {};

  data.forEach((r) => {
    const start = r.reason_start || 'unknown';
    const end = r.reason_end || 'unknown';
    startReasons[start] = (startReasons[start] || 0) + 1;
    endReasons[end] = (endReasons[end] || 0) + 1;
  });

  const total = data.length;

  const startData = Object.entries(startReasons)
    .map(([reason, count]) => ({ reason, count, percentage: count / total }))
    .sort((a, b) => b.count - a.count);

  const endData = Object.entries(endReasons)
    .map(([reason, count]) => ({ reason, count, percentage: count / total }))
    .sort((a, b) => b.count - a.count);

  return { startReasons: startData, endReasons: endData };
}

// 9. Offline vs Online
export function getOfflineStats(data) {
  const offline = data.filter((r) => r.offline);
  const online = data.filter((r) => !r.offline);

  const offlineMinutes = offline.reduce((sum, r) => sum + r.minutesPlayed, 0);
  const onlineMinutes = online.reduce((sum, r) => sum + r.minutesPlayed, 0);

  // Offline by hour
  const hourlyOffline = Array(24).fill(null).map(() => ({ offline: 0, online: 0 }));
  data.forEach((r) => {
    if (r.offline) {
      hourlyOffline[r.hour].offline += r.minutesPlayed;
    } else {
      hourlyOffline[r.hour].online += r.minutesPlayed;
    }
  });

  const offlineByHour = hourlyOffline.map((h, hour) => ({
    hour,
    label: `${hour}:00`,
    offline: h.offline,
    online: h.online,
    offlineRate: (h.offline + h.online) > 0 ? h.offline / (h.offline + h.online) : 0,
  }));

  return {
    offlineCount: offline.length,
    onlineCount: online.length,
    offlineMinutes,
    onlineMinutes,
    offlineRate: offline.length / data.length,
    offlineByHour,
  };
}

// 10. Time-of-day Artist Mood
export function getTimeOfDayArtists(data) {
  const periods = {
    morning: { start: 5, end: 11, artists: {} },    // 5am-11am
    afternoon: { start: 12, end: 17, artists: {} }, // 12pm-5pm
    evening: { start: 18, end: 21, artists: {} },   // 6pm-9pm
    night: { start: 22, end: 4, artists: {} },      // 10pm-4am
  };

  data.forEach((r) => {
    let period;
    if (r.hour >= 5 && r.hour <= 11) period = 'morning';
    else if (r.hour >= 12 && r.hour <= 17) period = 'afternoon';
    else if (r.hour >= 18 && r.hour <= 21) period = 'evening';
    else period = 'night';

    periods[period].artists[r.artist] = (periods[period].artists[r.artist] || 0) + r.minutesPlayed;
  });

  // Get top 5 artists for each period
  const result = {};
  for (const [period, data] of Object.entries(periods)) {
    result[period] = Object.entries(data.artists)
      .map(([artist, minutes]) => ({ artist, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }

  return result;
}
