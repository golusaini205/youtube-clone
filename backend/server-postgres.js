import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "pg";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const SECRET = process.env.JWT_SECRET || "mysecretkey";

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Initialize database with proper error handling
let dbReady = false;

async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Create videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        category TEXT,
        thumbnail TEXT,
        likes INTEGER DEFAULT 0,
        "videoUrl" TEXT,
        is_default INTEGER DEFAULT 0,
        description TEXT
      )
    `);

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        video_id INTEGER,
        comment TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(video_id) REFERENCES videos(id)
      )
    `);

    // Seed default videos
    await seedDefaultVideos();
    
    dbReady = true;
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("Error during database initialization:", err);
    throw err;
  }
}

// Seed default YouTube videos
async function seedDefaultVideos() {
  const defaultVideos = [
    { videoId: 'KzXnXhekOz4', title: 'Amazing Music Video 1', description: 'An incredible music video with amazing visuals and great beats.' },
    { videoId: 'w9WgzE5WiyU', title: 'Great Content 2', description: 'High quality content that will keep you entertained.' },
    { videoId: 'iYqqP1qcv5c', title: 'Interesting Video 3', description: 'Discover something new and interesting in this video.' },
    { videoId: '5ukPCvdY0YY', title: 'Popular Video 4', description: 'One of the most popular videos with millions of views.' },
    { videoId: '0TMi1bnsUZo', title: 'Trending Video 5', description: 'Currently trending - check out what everyone is watching.' },
    { videoId: 'ZqwttIdH840', title: 'Top Video 6', description: 'Top rated content from creators you love.' },
    { videoId: 'xVGCFuIiIG0', title: 'Best Video 7', description: 'The best videos handpicked for your enjoyment.' },
    { videoId: 'aEw7d3EPnMU', title: 'Awesome Content 8', description: 'Awesome and engaging content that stands out.' },
    { videoId: 'SpMsTsnYOss', title: 'Live Stream Video 9', description: 'Live streaming experience with real-time engagement.' },
    { videoId: 'lZmvMW1ugRM', title: 'Featured Video 10', description: 'Featured content from the best creators.' },
    { videoId: 'oK9oTZR-ee4', title: 'Recommended Video 11', description: 'Recommended just for you based on your preferences.' },
    { videoId: '8CCh_GLviFc', title: 'Amazing Video 12', description: 'Discover amazing content you will love watching.' },
    { videoId: 'ZjxiNW-6aPU', title: 'Great Short Video 13', description: 'Quick and entertaining short form content.' },
    { videoId: 'dcPOFGOC58o', title: 'Interesting Video 14', description: 'Fascinating content that keeps you engaged.' },
    { videoId: 'to9DjfD-mm0', title: 'Popular Video 15', description: 'Popular video with thousands of views and engagement.' },
    { videoId: 'kiiP56E_cCQ', title: 'Trending Video 16', description: 'Latest trending content everyone is watching.' },
    { videoId: 'G9MPvy7RlS4', title: 'Featured Video 17', description: 'Specially featured content just for you.' },
    { videoId: 'scu6_n8ozqE', title: 'Best Video 18', description: 'Best of the best videos curated for quality.' },
    { videoId: 'r1ZM2vXiVvs', title: 'Top Video 19', description: 'Top rated and most viewed video of the month.' },
    { videoId: '_cESW8BwGoU', title: 'Awesome Video 20', description: 'Awesome content that stands out from the rest.' },
    { videoId: '4RW-vaVbS_0', title: 'Trending Video 21', description: 'Currently trending in the community worldwide.' },
    { videoId: 'RzH5P-f4abg', title: 'Recommended Video 22', description: 'Recommended based on your viewing preferences.' },
    { videoId: 'Ebe9NFgQnnU', title: 'Great Video 23', description: 'Great quality video with excellent production value.' },
    { videoId: 'EZ2ZJxZhBoA', title: 'Popular Video 24', description: 'Popular across all platforms with great engagement.' },
    { videoId: 'i40mxe8lUg0', title: 'Featured Video 25', description: 'Featured on homepage due to excellent quality.' },
    { videoId: 'jjpjjcMeujM', title: 'Best Video 26', description: 'Best of our collection that you should watch.' },
    { videoId: 'Z4hVGCWH1Kc', title: 'Trending Video 27', description: 'Trending now and gaining views every minute.' }
  ];

  try {
    // Check if videos already exist
    const result = await pool.query("SELECT COUNT(*) as count FROM videos");
    const videoCount = parseInt(result.rows[0].count);

    if (videoCount === 0) {
      console.log(`📺 Starting to seed ${defaultVideos.length} default videos...`);
      
      let insertedCount = 0;
      for (const video of defaultVideos) {
        const thumbnail = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
        const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
        const likes = Math.floor(Math.random() * 1000);

        await pool.query(
          `INSERT INTO videos (title, filename, category, thumbnail, "videoUrl", likes, is_default, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [video.title, video.videoId, 'Trending', thumbnail, embedUrl, likes, 1, video.description]
        );
        
        insertedCount++;
        console.log(`✅ Video ${insertedCount}/${defaultVideos.length}: ${video.title}`);
      }
      
      console.log(`✅ All ${defaultVideos.length} default videos seeded successfully!`);
    } else {
      console.log(`✅ Database already has ${videoCount} videos. Skipping seeding.`);
    }
  } catch (err) {
    console.error("Error seeding videos:", err);
    throw err;
  }
}

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]);

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hash]
    );
    
    res.json({ message: "User registered", userId: result.rows[0].id });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }
    
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/upload", uploadFields, async (req, res) => {
  try {
    const { title, category } = req.body;
    const videoFile = req.files.video[0].filename;
    const thumbFile = req.files.thumbnail[0].filename;
    
    await pool.query(
      "INSERT INTO videos (title, filename, category, thumbnail, \"videoUrl\") VALUES ($1, $2, $3, $4, $5)",
      [title, videoFile, category, thumbFile, null]
    );
    
    res.json({ message: "Video uploaded" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading video" });
  }
});

app.get("/videos", async (req, res) => {
  try {
    const q = req.query.q;
    let sql = "SELECT * FROM videos";
    let params = [];
    
    if (q) {
      sql += " WHERE title ILIKE $1";
      params.push("%" + q + "%");
    }
    
    sql += " ORDER BY id DESC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Videos error:", error);
    res.status(500).json({ error: "Error fetching videos" });
  }
});

app.post("/like/:id", async (req, res) => {
  try {
    await pool.query("UPDATE videos SET likes = likes + 1 WHERE id = $1", [req.params.id]);
    res.json({ message: "Liked" });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "Error updating likes" });
  }
});

app.post("/comment", async (req, res) => {
  try {
    const { user_id, video_id, comment } = req.body;
    await pool.query(
      "INSERT INTO comments (user_id, video_id, comment) VALUES ($1, $2, $3)",
      [user_id, video_id, comment]
    );
    res.json({ message: "Comment added" });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ error: "Error adding comment" });
  }
});

app.get("/comments/:videoId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comments WHERE video_id = $1",
      [req.params.videoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Comments error:", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

app.delete("/videos/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    
    // Get the video
    const videoResult = await pool.query(
      "SELECT filename, thumbnail, is_default FROM videos WHERE id = $1",
      [videoId]
    );
    
    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    const video = videoResult.rows[0];
    
    // Prevent deletion of default videos
    if (video.is_default === 1) {
      return res.status(403).json({ error: "Cannot delete default videos" });
    }

    // Delete from database
    await pool.query("DELETE FROM videos WHERE id = $1", [videoId]);
    
    // Delete associated comments
    await pool.query("DELETE FROM comments WHERE video_id = $1", [videoId]);

    // Try to delete files
    const fs = require('fs').promises;
    const filePath = require('path');
    
    const videoPath = filePath.join('uploads', video.filename);
    const thumbPath = filePath.join('uploads', video.thumbnail);
    
    Promise.all([
      fs.unlink(videoPath).catch(() => {}),
      fs.unlink(thumbPath).catch(() => {})
    ]).catch(err => {
      console.error("Error deleting files:", err);
    });

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Import video from YouTube URL
app.post("/import-youtube", async (req, res) => {
  try {
    const { url, title, category } = req.body;
    
    if (!url || !title || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Extract YouTube video ID
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Check if video already exists
    const existingResult = await pool.query(
      "SELECT id FROM videos WHERE filename = $1",
      [videoId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: "This video is already in your collection" });
    }

    // Get video metadata from YouTube
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    https.get(apiUrl, (apiRes) => {
      let data = '';
      
      apiRes.on('data', chunk => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        try {
          const videoData = JSON.parse(data);
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          
          pool.query(
            `INSERT INTO videos (title, filename, category, thumbnail, "videoUrl", likes, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [videoData.title || title, videoId, category, thumbnailUrl, `https://www.youtube.com/embed/${videoId}`, 0, 'Great video content from YouTube.'],
            (err, result) => {
              if (err) {
                console.error("Error inserting video:", err);
                return res.status(500).json({ error: "Error saving video" });
              }
              res.json({ 
                message: "Video imported successfully",
                videoId: result.rows[0].id,
                videoUrl: `https://www.youtube.com/embed/${videoId}`,
                thumbnail: thumbnailUrl
              });
            }
          );
        } catch (parseErr) {
          console.error("Error parsing YouTube data:", parseErr);
          pool.query(
            `INSERT INTO videos (title, filename, category, thumbnail, "videoUrl", likes, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [title, videoId, category, `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://www.youtube.com/embed/${videoId}`, 0, 'Great video content from YouTube.'],
            (err) => {
              if (err) {
                return res.status(500).json({ error: "Error saving video" });
              }
              res.json({ message: "Video imported successfully" });
            }
          );
        }
      });
    }).on('error', (err) => {
      console.error("Error fetching YouTube metadata:", err);
      pool.query(
        `INSERT INTO videos (title, filename, category, thumbnail, "videoUrl", likes, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [title, videoId, category, `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://www.youtube.com/embed/${videoId}`, 0, 'Great video content from YouTube.'],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Error saving video" });
          }
          res.json({ message: "Video imported successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all videos
app.delete("/videos", async (req, res) => {
  try {
    await pool.query("DELETE FROM videos");
    await pool.query("DELETE FROM comments");
    res.json({ message: "All videos deleted" });
  } catch (error) {
    console.error("Clear error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", ready: dbReady });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📺 Videos endpoint: http://localhost:${PORT}/videos`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });
