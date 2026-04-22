// Similarity calculation utilities

export function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}

export function calculateArtistOverlap(data1, data2, topN = 50) {
  const getTopArtists = (data) => {
    const counts = {};
    data.forEach((r) => {
      counts[r.artist] = (counts[r.artist] || 0) + 1;
    });
    return new Set(
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([artist]) => artist)
    );
  };

  const artists1 = getTopArtists(data1);
  const artists2 = getTopArtists(data2);
  const shared = [...artists1].filter((a) => artists2.has(a));

  return {
    jaccard: jaccardSimilarity(artists1, artists2),
    sharedArtists: shared,
    person1Artists: [...artists1],
    person2Artists: [...artists2],
  };
}

export function calculateTemporalSimilarity(data1, data2) {
  // Hourly pattern
  const hourly1 = Array(24).fill(0);
  const hourly2 = Array(24).fill(0);
  data1.forEach((r) => { hourly1[r.hour] += r.minutesPlayed; });
  data2.forEach((r) => { hourly2[r.hour] += r.minutesPlayed; });

  // Day of week pattern
  const dow1 = Array(7).fill(0);
  const dow2 = Array(7).fill(0);
  data1.forEach((r) => { dow1[r.dayOfWeek] += r.minutesPlayed; });
  data2.forEach((r) => { dow2[r.dayOfWeek] += r.minutesPlayed; });

  // Monthly pattern
  const monthly1 = Array(12).fill(0);
  const monthly2 = Array(12).fill(0);
  data1.forEach((r) => { monthly1[r.month] += r.minutesPlayed; });
  data2.forEach((r) => { monthly2[r.month] += r.minutesPlayed; });

  return {
    hourly: cosineSimilarity(hourly1, hourly2),
    dayOfWeek: cosineSimilarity(dow1, dow2),
    monthly: cosineSimilarity(monthly1, monthly2),
  };
}

export function calculateAllSimilarities(data1, data2) {
  const artistOverlap = calculateArtistOverlap(data1, data2);
  const temporal = calculateTemporalSimilarity(data1, data2);

  const composite = (
    artistOverlap.jaccard +
    temporal.hourly +
    temporal.dayOfWeek +
    temporal.monthly
  ) / 4;

  return {
    artistJaccard: artistOverlap.jaccard,
    sharedArtists: artistOverlap.sharedArtists,
    hourlyCosSim: temporal.hourly,
    dayOfWeekCosSim: temporal.dayOfWeek,
    monthlyCosSim: temporal.monthly,
    composite,
  };
}
