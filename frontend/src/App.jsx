
import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import YouTubeFetch from './components/YouTubeFetch';
import VideoList from './components/VideoList';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="app-container">
      <Navbar onSearch={handleSearch} setUser={null} />
      <div className="home-layout">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="main-content">
          <YouTubeFetch />
          <VideoList searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
}
