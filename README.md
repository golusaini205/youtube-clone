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
- **SQLite Database**: Persistent data storage

##  Quick Start

### Local Development

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


### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select branch to deploy

3. **Configure Backend Service**
   - **Name**: `youtube-clone-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     PORT=5000
     NODE_ENV=production
     ```

4. **Configure Frontend Service**
   - **Name**: `youtube-clone-frontend`
   - **Environment**: Node
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Static Site**: Enable
   - **Publish directory**: `frontend/dist`

5. **Link Services**
   - Update frontend `vite.config.js` to use your backend URL
   - Set API proxy to your Render backend URL

## 📁 Project Structure

```
youtube-clone/
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   ├── youtube_clone.db    # SQLite database
│   └── uploads/            # Uploaded video files
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # Entry point
│   │   ├── style.css       # Styles
│   │   └── components/     # React components
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── package.json            # Root scripts
├── .gitignore              # Git ignore rules
├── render.yaml             # Render deployment config
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=production
DB_PATH=./youtube_clone.db
JWT_SECRET=your-secret-key-here
```

See `.env.example` for all available options.

## 📝 API Endpoints

### Videos
- `GET /videos` - Get all videos (with optional search query)
- `DELETE /videos/:id` - Delete a video
- `POST /import-youtube` - Import video from YouTube URL

### Authentication (if enabled)
- `POST /register` - Register new user
- `POST /login` - Login user

## 🛠️ Tech Stack

**Frontend**
- React 18.2.0
- Vite 5.0.0
- Axios 1.6.0
- CSS3

**Backend**
- Express.js
- SQLite3
- Node.js
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- Multer (file uploads)


## 🤝 Support

For issues and questions, please open an issue on GitHub.
