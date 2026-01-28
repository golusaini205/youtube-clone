import { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../api';

export default function YouTubeFetch() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchYouTubeData = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL or Video ID');
      return;
    }

    setLoading(true);
    setError('');
    setVideoData(null);
    setPreview(null);

    try {
      const videoId = extractVideoId(youtubeUrl);
      
      if (!videoId) {
        setError('Invalid YouTube URL or Video ID. Please check and try again.');
        setLoading(false);
        return;
      }

      // Fetch video metadata from YouTube oEmbed API
      const response = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      const data = {
        videoId,
        title: response.data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        author: response.data.author_name,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };

      setVideoData(data);
      setPreview({
        id: videoId,
        thumbnail: data.thumbnail,
        title: data.title,
        author: data.author
      });

      // Auto-scroll to preview
      setTimeout(() => {
        const previewElement = document.querySelector('.youtube-preview');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

    } catch (err) {
      console.error('Error fetching YouTube data:', err);
      setError('Could not fetch video data. The video might be private or the URL is invalid.');
      setVideoData(null);
    } finally {
      setLoading(false);
    }
  };

  const addVideoToPlaylist = async () => {
    if (!videoData) return;

    try {
      setLoading(true);
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        setError('Please log in to add videos');
        return;
      }

      const response = await axios.post(apiUrl('/import-youtube'), {
        url: videoData.embedUrl,
        title: videoData.title,
        category: 'YouTube',
        videoId: videoData.videoId
      });

      setError('');
      setYoutubeUrl('');
      setVideoData(null);
      setPreview(null);
      
      // Dispatch event to refresh video list
      window.dispatchEvent(new Event('videoImported'));
      
      alert('✅ Video added successfully!');
      
    } catch (err) {
      console.error('Error adding video:', err);
      setError('Failed to add video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="youtube-fetch-container">
      <div className="youtube-fetch-card">
        <h2>📺 Fetch from YouTube</h2>
        
        <form onSubmit={fetchYouTubeData} className="youtube-fetch-form">
          <div className="form-group">
            <label>YouTube URL or Video ID</label>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=... or Video ID"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading}
              className="youtube-input"
            />
            <small>Examples: youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || !youtubeUrl.trim()}
            className="fetch-btn"
          >
            {loading ? '⏳ Fetching...' : '🔍 Search'}
          </button>
        </form>

        {preview && (
          <div className="youtube-preview">
            <div className="preview-thumbnail">
              <img src={preview.thumbnail} alt={preview.title} />
              <div className="play-overlay">▶</div>
            </div>
            
            <div className="preview-info">
              <h3>{preview.title}</h3>
              <p className="preview-author">By: {preview.author}</p>
              
              <button 
                onClick={addVideoToPlaylist}
                disabled={loading}
                className="add-btn"
              >
                {loading ? '⏳ Adding...' : '✅ Add to Playlist'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
