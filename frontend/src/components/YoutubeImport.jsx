
import {useState} from 'react';
import axios from 'axios';

export default function YoutubeImport(){
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const extractVideoId = (videoUrl) => {
    let videoId = null;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('embed/')[1]?.split('?')[0];
    }
    return videoId;
  };

  const handleUrlChange = (e) => {
    const videoUrl = e.target.value;
    setUrl(videoUrl);
    
    const videoId = extractVideoId(videoUrl);
    if(videoId) {
      setPreview({
        id: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      });
    } else {
      setPreview(null);
    }
  };

  const importVideo = async() => {
    if(!url || !title || !category) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/import-youtube', { url, title, category });
      setMessage('✓ Video imported successfully!');
      setUrl('');
      setTitle('');
      setCategory('');
      setPreview(null);
      setTimeout(() => setMessage(''), 3000);
      
      // Dispatch custom event instead of reloading
      window.dispatchEvent(new Event('videoImported'));
    } catch(err) {
      console.error('Import error:', err);
      setMessage(err.response?.data?.error || 'Error importing video');
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className='youtube-import-container'>
      <div className='import-card'>
        <h3>📺 Import from YouTube</h3>
        <p className='import-subtitle'>Paste YouTube link to add video to your collection</p>
        
        {message && <div className={message.includes('✓') ? 'success-msg' : 'error-msg'}>{message}</div>}
        
        <div className='form-group'>
          <label>YouTube URL</label>
          <input 
            type='text'
            placeholder='https://www.youtube.com/watch?v=...' 
            value={url}
            onChange={handleUrlChange}
            className='form-input'
          />
          <p className='help-text'>Paste YouTube link or embed URL</p>
        </div>

        <div className='preview-box'>
          {preview && (
            <div className='youtube-preview'>
              <img src={preview.thumbnail} alt='Preview' />
              <div className='preview-icon'>▶</div>
            </div>
          )}
        </div>

        <div className='form-group'>
          <label>Video Title</label>
          <input 
            type='text'
            placeholder='Enter custom title (optional)' 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <label>Category</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className='form-input'
          >
            <option value=''>Select Category</option>
            <option value='Music'>Music</option>
            <option value='Entertainment'>Entertainment</option>
            <option value='Education'>Education</option>
            <option value='Tutorial'>Tutorial</option>
            <option value='Gaming'>Gaming</option>
            <option value='Sports'>Sports</option>
            <option value='News'>News</option>
            <option value='Other'>Other</option>
          </select>
        </div>

        <button 
          onClick={importVideo} 
          disabled={loading} 
          className='import-btn'
        >
          {loading ? 'Importing...' : '📺 Import Video'}
        </button>
      </div>
    </div>
  );
}
