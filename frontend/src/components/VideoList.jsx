
import {useEffect, useState} from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

export default function VideoList({ searchQuery = '' }){
 const [videos, setVideos] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedVideo, setSelectedVideo] = useState(null);

 const load = (q) => {
  setLoading(true);
  let url = '/api/videos';
  if(q) url += '?q=' + q;
  console.log('Fetching videos from:', url);
  axios.get(url)
   .then(r => {
    console.log('Videos loaded:', r.data);
    setVideos(r.data);
   })
   .catch(err => {
    console.error('Error loading videos:', err);
    console.error('Error response:', err.response);
   })
   .finally(() => setLoading(false));
 };

 const deleteVideo = async(id, title) => {
  const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
  if(!confirmed) return;
  
  try {
   await axios.delete('/api/videos/' + id);
   load();
  } catch(err) {
   console.error('Error deleting video:', err);
   const errorMsg = err.response?.data?.error || 'Error deleting video';
   alert(errorMsg);
  }
 };

 useEffect(() => {
  if(searchQuery) {
   load(searchQuery);
  } else {
   load();
  }
 }, [searchQuery]);

 useEffect(() => load(), []);

 useEffect(() => {
  const handleVideoImported = () => {
   load();
  };
  
  window.addEventListener('videoImported', handleVideoImported);
  return () => window.removeEventListener('videoImported', handleVideoImported);
 }, []);

 if(loading) {
  return <div className='loading'>Loading videos...</div>;
 }

 return(
  <div className='home-container'>
   <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
   
   <div className='video-grid'>
    {videos.length === 0 ? (
     <div className='no-videos'>No videos found. Start by uploading one!</div>
    ) : (
     videos.map(v => (
      <div key={v.id} className='video-card'>
       <div className='video-thumbnail'>
        <img src={v.thumbnail} alt={v.title}/>
        <div className='video-overlay'>
         <button className='play-btn' onClick={() => setSelectedVideo(v)}>▶</button>
        </div>
       </div>

       <div className='video-info'>
        {v.description && <p className='video-description'>{v.description}</p>}
       </div>
      </div>
     ))
    )}
   </div>
  </div>
 );
}
