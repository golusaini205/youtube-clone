
import { useState } from 'react';
import { API_BASE } from '../api';

export default function VideoPlayer({ video, onClose }) {
  if (!video) return null;

  const isYouTubeVideo = video.videoUrl;

  return (
    <div className="video-player-modal" onClick={onClose}>
      <div className="video-player-container" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="video-player-wrapper">
          {isYouTubeVideo ? (
            <iframe
              width="100%"
              height="100%"
              src={`${video.videoUrl}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '8px' }}
            ></iframe>
          ) : (
            <video
              width="100%"
              height="100%"
              controls
              autoPlay
              style={{ borderRadius: '8px', backgroundColor: '#000' }}
            >
              <source src={`${API_BASE}/uploads/${video.filename}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="video-details">
          <h2>{video.title}</h2>
          <p className="category">📂 {video.category}</p>
          <p className="likes">👍 {video.likes} Likes</p>
        </div>
      </div>
    </div>
  );
}
