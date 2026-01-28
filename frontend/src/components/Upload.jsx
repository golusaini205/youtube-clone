
import {useState} from 'react';
import axios from 'axios';
import { apiUrl } from '../api';

export default function Upload(){
 const [title, setTitle] = useState('');
 const [category, setCategory] = useState('');
 const [video, setVideo] = useState(null);
 const [thumbnail, setThumbnail] = useState(null);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState('');

 const uploadVideo = async() => {
  if(!title || !category || !video || !thumbnail) {
   setMessage('Please fill all fields');
   return;
  }
  
  setLoading(true);
  setMessage('');
  try {
   const fd = new FormData();
   fd.append('title', title);
   fd.append('category', category);
   fd.append('video', video);
   fd.append('thumbnail', thumbnail);
   await axios.post(apiUrl('/upload'), fd);
   setMessage('✓ Video uploaded successfully!');
   setTitle('');
   setCategory('');
   setVideo(null);
   setThumbnail(null);
   setTimeout(() => setMessage(''), 3000);
  } catch(err) {
   setMessage('Error uploading video');
  } finally {
   setLoading(false);
  }
 };

 return(
  <div className='upload-container'>
   <div className='upload-card'>
    <h3>📤 Upload Video</h3>
    {message && <div className={message.includes('✓') ? 'success-msg' : 'error-msg'}>{message}</div>}
    
    <div className='form-group'>
     <label>Video Title</label>
     <input 
      type='text'
      placeholder='Enter video title' 
      value={title}
      onChange={e=>setTitle(e.target.value)}
      className='form-input'
     />
    </div>

    <div className='form-group'>
     <label>Category</label>
     <input 
      type='text'
      placeholder='e.g., Music, Comedy, Tutorial' 
      value={category}
      onChange={e=>setCategory(e.target.value)}
      className='form-input'
     />
    </div>

    <div className='file-group'>
     <label>Video File</label>
     <input 
      type='file' 
      accept='video/*'
      onChange={e=>setVideo(e.target.files[0])}
      className='file-input'
     />
     {video && <p className='file-name'>✓ {video.name}</p>}
    </div>

    <div className='file-group'>
     <label>Thumbnail Image</label>
     <input 
      type='file' 
      accept='image/*'
      onChange={e=>setThumbnail(e.target.files[0])}
      className='file-input'
     />
     {thumbnail && <p className='file-name'>✓ {thumbnail.name}</p>}
    </div>

    <button onClick={uploadVideo} disabled={loading} className='upload-btn'>
     {loading ? 'Uploading...' : '📤 Upload Video'}
    </button>
   </div>
  </div>
 );
}
