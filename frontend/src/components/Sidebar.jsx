import { useState } from 'react';

export default function Sidebar({ activeSection, onSectionChange }) {
  const [expanded, setExpanded] = useState(true);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'history', label: 'History', icon: '⏰' },
    { id: 'playlist', label: 'Playlists', icon: '📋' },
    { id: 'watchlater', label: 'Watch Later', icon: '🕐' },
    { id: 'liked', label: 'Liked Videos', icon: '👍' },
    { id: 'yourvideos', label: 'Your Videos', icon: '📹' },
  ];

  const secondaryItems = [
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'report', label: 'Report History', icon: '⚠️' },
    { id: 'help', label: 'Help', icon: '❓' },
    { id: 'feedback', label: 'Send Feedback', icon: '💬' },
  ];

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        ☰
      </button>

      <div className="sidebar-content">
        {/* Primary Menu */}
        <div className="menu-section">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={!expanded ? item.label : ''}
            >
              <span className="menu-icon">{item.icon}</span>
              {expanded && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Divider */}
        {expanded && <div className="menu-divider"></div>}

        {/* Secondary Menu */}
        <div className="menu-section">
          {secondaryItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={!expanded ? item.label : ''}
            >
              <span className="menu-icon">{item.icon}</span>
              {expanded && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
