import { calculateAllSimilarities } from '../utils/similarity';

export default function SimilarityPanel({ data1, data2, label1, label2 }) {
  if (!data1 || !data2) return null;

  const sim = calculateAllSimilarities(data1, data2);

  const getScoreColor = (score) => {
    if (score < 0.3) return '#ef5350';
    if (score < 0.6) return '#ffb74d';
    return '#66bb6a';
  };

  const getInterpretation = (composite) => {
    if (composite < 0.3) return 'Very different listeners';
    if (composite < 0.6) return 'Moderately similar listeners';
    return 'Quite similar listeners';
  };

  const metrics = [
    { label: 'Artist Overlap (Jaccard)', value: sim.artistJaccard },
    { label: 'Hourly Pattern (Cosine)', value: sim.hourlyCosSim },
    { label: 'Day of Week (Cosine)', value: sim.dayOfWeekCosSim },
    { label: 'Monthly Pattern (Cosine)', value: sim.monthlyCosSim },
    { label: 'COMPOSITE SCORE', value: sim.composite, isComposite: true },
  ];

  return (
    <div className="similarity-panel">
      <h2>Similarity Analysis</h2>
      <p className="similarity-subtitle">
        Comparing {label1} vs {label2}
      </p>

      <div className="similarity-metrics">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`similarity-metric ${metric.isComposite ? 'composite' : ''}`}
          >
            <div className="metric-label">{metric.label}</div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${metric.value * 100}%`,
                  backgroundColor: getScoreColor(metric.value),
                }}
              />
            </div>
            <div
              className="metric-value"
              style={{ color: getScoreColor(metric.value) }}
            >
              {(metric.value * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div
        className="similarity-interpretation"
        style={{ color: getScoreColor(sim.composite) }}
      >
        {getInterpretation(sim.composite)}
      </div>

      {sim.sharedArtists.length > 0 && (
        <div className="shared-artists">
          <h4>Shared Top Artists ({sim.sharedArtists.length})</h4>
          <div className="artist-tags">
            {sim.sharedArtists.map((artist) => (
              <span key={artist} className="artist-tag">
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
