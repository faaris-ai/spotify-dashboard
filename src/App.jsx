import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import StatsCard from './components/StatsCard';
import PatternCharts from './components/PatternCharts';
import ListeningHeatmap from './components/ListeningHeatmap';
import TopItemsTable from './components/TopItemsTable';
import SimilarityPanel from './components/SimilarityPanel';
import TimelineCharts from './components/TimelineCharts';
import BehaviorCharts from './components/BehaviorCharts';
import DeepDiveCharts from './components/DeepDiveCharts';
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
  const [isLoading, setIsLoading] = useState(true);

  // Auto-load pre-bundled datasets on startup
  useEffect(() => {
    const loadPreloadedData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch('/data/faaris.json'),
          fetch('/data/person2.json')
        ]);

        if (res1.ok && res2.ok) {
          const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
          setDataset1(processSpotifyData(data1, 1));
          setDataset2(processSpotifyData(data2, 2));
          setLabel1('Faaris');
          setLabel2('Person 2');
        }
      } catch (error) {
        console.log('No preloaded data found, starting fresh');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreloadedData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🎧</div>
          <h2>Loading Spotify Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${hasData ? 'with-sidebar' : ''}`}>
      {hasData && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasComparison={hasComparison}
          hasData={hasData}
        />
      )}

      <div className="app-main">
        {!hasData && (
          <>
            <header className="header">
              <div className="header-icon">🎧</div>
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
            </div>

            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h2>No data loaded</h2>
              <p>Upload a Spotify Extended Streaming History JSON file to get started.</p>
              <p className="hint">
                Your JSON should be an array of listening records with fields like
                <code>ts</code>, <code>ms_played</code>, <code>master_metadata_track_name</code>, etc.
              </p>
            </div>
          </>
        )}

        {hasData && (
          <>
            <header className="header-compact">
              <div className="upload-controls">
                <FileUpload
                  onDataLoaded={handleData1Loaded}
                  datasetLabel={dataset1 ? label1 : 'Dataset 1'}
                />
                <FileUpload
                  onDataLoaded={handleData2Loaded}
                  datasetLabel={dataset2 ? label2 : 'Dataset 2 (optional)'}
                />
                <button className="clear-btn" onClick={clearData}>
                  Clear All
                </button>
              </div>
            </header>

            <main className="main-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  {/* Hero Sections */}
                  <div className="hero-row">
                    {stats1 && (
                      <HeroSection
                        stats={stats1}
                        data={dataset1}
                        label={label1}
                        color={P1_COLOR}
                      />
                    )}
                    {stats2 && (
                      <HeroSection
                        stats={stats2}
                        data={dataset2}
                        label={label2}
                        color={P2_COLOR}
                      />
                    )}
                  </div>

                  {/* Detailed Stats */}
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
                <div className="patterns-tab">
                  {/* Heatmap first for the "at a glance" view */}
                  <ListeningHeatmap
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />

                  {/* Traditional charts below */}
                  <PatternCharts
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />
                </div>
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
                  <ListeningHeatmap
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="timeline-tab">
                  <TimelineCharts
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />
                </div>
              )}

              {activeTab === 'behavior' && (
                <div className="behavior-tab">
                  <BehaviorCharts
                    data1={dataset1}
                    data2={dataset2}
                    label1={label1}
                    label2={label2}
                  />
                </div>
              )}

              {activeTab === 'deepdive' && (
                <div className="deepdive-tab">
                  <DeepDiveCharts
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
      </div>
    </div>
  );
}

export default App;
