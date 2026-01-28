# YouTube Clone – Full-Featured Video Platform

A modern YouTube clone built with React and Express, featuring video streaming, search, and a beautiful responsive UI.

## ✨ Features

- **Video Management**: Upload, import YouTube videos, delete videos
- **Video Playback**: Stream YouTube embeds and local video files
- **Search Functionality**: Search videos by title or description
- **Responsive Design**: Works on desktop, tablet, and mobile
- **YouTube Integration**: Import videos from YouTube with metadata
- **Real-time Metadata**: Fetch actual YouTube descriptions and thumbnails
- **Duplicate Detection**: Automatically prevent duplicate video imports
- **Sidebar Navigation**: YouTube-style navigation menu
- **PostgreSQL Database**: Persistent data storage with Render deployment
- **Default Videos**: 27 pre-loaded videos on first deployment

##  Quick Start

### Local Development (with SQLite)

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Start backend server**
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:5000`

3. **Start frontend (in another terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

4. **Open browser**
   Navigate to `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized build in `frontend/dist`

## 🌐 Deploy to Render

### Why PostgreSQL Instead of SQLite?

SQLite doesn't persist data on Render's ephemeral filesystem. PostgreSQL provides:
- ✅ Persistent data storage
- ✅ Automatic backups
- ✅ Reliable default video loading
- ✅ Better performance at scale

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy with PostgreSQL"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select branch to deploy

3. **Configure Services**
   
   **Option A: Using render.yaml (Recommended)**
   - Render will automatically create the PostgreSQL database
   - All services will be configured from `render.yaml`
   - Just deploy and it works!
   
   **Option B: Manual Configuration**
   
   - **Create PostgreSQL Database First**
     - Click "New +" → "PostgreSQL"
     - Give it a name (e.g., `youtube-clone-db`)
     - Note the database URL
   
   - **Configure Backend Service**
     - **Name**: `youtube-clone-backend`
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm run start-postgres`
     - **Environment Variables**:
       ```
       NODE_ENV=production
       PORT=5000
       DATABASE_URL=postgresql://user:password@host:5432/dbname
       JWT_SECRET=your-secret-key-change-this
       ```
   
   - **Configure Frontend Service**
     - **Name**: `youtube-clone-frontend`
     - **Environment**: Node
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Static Site**: Enable
     - **Publish directory**: `frontend/dist`

4. **Monitor First Deployment**
   - Check the backend logs in Render Dashboard
   - You should see:
     ```
     ✅ Starting to seed 27 default videos...
     ✅ Video 1/27: Amazing Music Video 1
     ...
     ✅ All 27 default videos seeded successfully!
     ✅ Server running on port 5000
     ```

5. **Verify Videos Are Loading**
   - Visit your frontend URL
   - Check that the default 27 videos appear on the home page
   - Use the search feature to test functionality

## 📁 Project Structure

```
youtube-clone/
├── backend/
│   ├── server.js               # Express server (SQLite - local dev)
│   ├── server-postgres.js      # Express server (PostgreSQL - production)
│   ├── package.json            # Backend dependencies
│   ├── youtube_clone.db        # SQLite database (local only)
│   └── uploads/                # Uploaded video files
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # Entry point
│   │   ├── style.css           # Styles
│   │   └── components/         # React components
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── package.json                # Root scripts
├── .gitignore                  # Git ignore rules
├── render.yaml                 # Render deployment config
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

**For Local Development (.env)**
```env
PORT=5000
NODE_ENV=development
```

**For Production (Render)**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-super-secret-key-here
```

## 📝 API Endpoints

### Videos
- `GET /videos` - Get all videos (with optional search query)
- `GET /videos?q=search` - Search videos by title
- `DELETE /videos/:id` - Delete a video
- `POST /import-youtube` - Import video from YouTube URL
- `POST /like/:id` - Like a video
- `DELETE /videos` - Clear all videos

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user

### Comments
- `POST /comment` - Add comment to video
- `GET /comments/:videoId` - Get comments for a video

### Health
- `GET /health` - Server health check

## 🛠️ Tech Stack

**Frontend**
- React 18.2.0
- Vite 5.0.0
- Axios 1.6.0
- CSS3

**Backend**
- Express.js
- PostgreSQL (production) / SQLite3 (development)
- Node.js
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- Multer (file uploads)
- pg (PostgreSQL driver)

## 🚀 Troubleshooting

### Default Videos Not Showing on Render
1. Check that `DATABASE_URL` environment variable is set correctly
2. Verify PostgreSQL database was created
3. Check Render logs for seeding messages
4. Delete the service and redeploy if database is corrupted

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/dbname`
- Check that PostgreSQL service is running
- Ensure SSL mode is correct for your environment

### Videos Disappearing After Restart
- This was the original issue with SQLite
- PostgreSQL persists data automatically
- No action needed - data survives restarts

## 📄 License

MIT

## 👨‍💻 Contributing

Feel free to fork and submit pull requests!

## 🤝 Support

For issues and questions, please open an issue on GitHub.
