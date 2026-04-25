export default function Sidebar({ activeTab, setActiveTab, hasComparison, hasData }) {
  if (!hasData) return null;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patterns', label: 'Patterns', icon: '📈' },
    { id: 'top', label: 'Top Items', icon: '🏆' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'behavior', label: 'Behavior', icon: '🎯' },
    { id: 'deepdive', label: 'Deep Dive', icon: '🔍' },
  ];

  if (hasComparison) {
    navItems.push({ id: 'similarity', label: 'Similarity', icon: '🔗' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🎧</span>
        <span className="brand-text">Spotify Stats</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="footer-text">Spotify Dashboard</span>
      </div>
    </aside>
  );
}
