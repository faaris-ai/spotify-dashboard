import { useState } from 'react';
import FileUpload from './components/FileUpload';
import StatsCard from './components/StatsCard';
import PatternCharts from './components/PatternCharts';
import TopItemsTable from './components/TopItemsTable';
import SimilarityPanel from './components/SimilarityPanel';
import { processSpotifyData, getStats } from './utils/dataProcessing';
import './App.css';

const P1_COLOR = '#1DB954';
const P2_COLOR = '#E91E63';

function App() {
  const [dataset1, setDataset1] = useState(null);
  const [dataset2, setDataset2] = useState(null);
  const [label1, setLabel1] = useState('Person 1');
  const [label2, setLabel2] = useState('Person 2');
  const [activeTab, setActiveTab] = useState('overview');

  const handleData1Loaded = (rawData, fileName) => {
    const processed = processSpotifyData(rawData, 1);
    setDataset1(processed);
    setLabel1(fileName.replace('.json', '').replace(/_/g, ' '));
  };

  const handleData2Loaded = (rawData, fileName) => {
    const processed = processSpotifyData(rawData, 2);
    setDataset2(processed);
    setLabel2(fileName.replace('.json', '').replace(/_/g, ' '));
  };

  const clearData = () => {
    setDataset1(null);
    setDataset2(null);
    setLabel1('Person 1');
    setLabel2('Person 2');
  };

  const stats1 = dataset1 ? getStats(dataset1) : null;
  const stats2 = dataset2 ? getStats(dataset2) : null;
  const hasData = dataset1 || dataset2;
  const hasComparison = dataset1 && dataset2;

  return (
    <div className="app">
      <header className="header">
        <h1>Spotify Listening Dashboard</h1>
        <p>Upload Spotify Extended Streaming History JSON files to visualize and compare</p>
      </header>

      <div className="upload-section">
        <FileUpload
          onDataLoaded={handleData1Loaded}
          datasetLabel="Dataset 1"
        />
        <FileUpload
          onDataLoaded={handleData2Loaded}
          datasetLabel="Dataset 2 (optional)"
        />
        {hasData && (
          <button className="clear-btn" onClick={clearData}>
            Clear All
          </button>
        )}
      </div>

      {hasData && (
        <>
          <nav className="tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'patterns' ? 'active' : ''}
              onClick={() => setActiveTab('patterns')}
            >
              Patterns
            </button>
            <button
              className={activeTab === 'top' ? 'active' : ''}
              onClick={() => setActiveTab('top')}
            >
              Top Items
            </button>
            {hasComparison && (
              <button
                className={activeTab === 'similarity' ? 'active' : ''}
                onClick={() => setActiveTab('similarity')}
              >
                Similarity
              </button>
            )}
          </nav>

          <main className="main-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-row">
                  {stats1 && (
                    <StatsCard stats={stats1} label={label1} color={P1_COLOR} />
                  )}
                  {stats2 && (
                    <StatsCard stats={stats2} label={label2} color={P2_COLOR} />
                  )}
                </div>
                {hasComparison && (
                  <SimilarityPanel
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />
                )}
              </div>
            )}

            {activeTab === 'patterns' && (
              <PatternCharts
                data1={dataset1}
                data2={dataset2}
                label1={label1}
                label2={label2}
              />
            )}

            {activeTab === 'top' && (
              <div className="top-tab">
                {dataset1 && (
                  <TopItemsTable data={dataset1} label={label1} color={P1_COLOR} />
                )}
                {dataset2 && (
                  <TopItemsTable data={dataset2} label={label2} color={P2_COLOR} />
                )}
              </div>
            )}

            {activeTab === 'similarity' && hasComparison && (
              <div className="similarity-tab">
                <SimilarityPanel
                  data1={dataset1}
                  data2={dataset2}
                  label1={label1}
                  label2={label2}
                />
                <PatternCharts
                  data1={dataset1}
                  data2={dataset2}
                  label1={label1}
                  label2={label2}
                />
              </div>
            )}
          </main>
        </>
      )}

      {!hasData && (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h2>No data loaded</h2>
          <p>Upload a Spotify Extended Streaming History JSON file to get started.</p>
          <p className="hint">
            Your JSON should be an array of listening records with fields like
            <code>ts</code>, <code>ms_played</code>, <code>master_metadata_track_name</code>, etc.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
