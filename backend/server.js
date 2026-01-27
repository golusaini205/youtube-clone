
import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const SECRET = "mysecretkey";
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "youtube_clone.db");
const db = new sqlite3.Database(DB_PATH);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    category TEXT,
    thumbnail TEXT,
    likes INTEGER DEFAULT 0,
    videoUrl TEXT,
    is_default INTEGER DEFAULT 0,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    video_id INTEGER,
    comment TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(video_id) REFERENCES videos(id)
  )`, () => {
    // After tables are created, seed default videos and remove duplicates
    seedDefaultVideos();
    setTimeout(() => removeDuplicateVideos(), 2000);
  });
});

// Seed default YouTube videos
function seedDefaultVideos() {
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

  // Check if videos already exist
  db.get("SELECT COUNT(*) as count FROM videos", (err, result) => {
    if (err) {
      console.error("Error checking videos:", err);
      return;
    }

    // Only seed if table is empty
    if (result.count === 0) {
      defaultVideos.forEach(video => {
        const thumbnail = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
        const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;

        db.run(
          "INSERT INTO videos (title, filename, category, thumbnail, videoUrl, likes, is_default, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [video.title, video.videoId, 'Trending', thumbnail, embedUrl, Math.floor(Math.random() * 1000), 1, video.description],
          (err) => {
            if (err) {
              console.error(`Error inserting video ${video.videoId}:`, err);
            } else {
              console.log(`✅ Default video added: ${video.title}`);
            }
          }
        );
      });
    }
  });
}

// Remove duplicate videos - keep the first occurrence, delete duplicates
function removeDuplicateVideos() {
  db.all(
    `SELECT filename, COUNT(*) as count, GROUP_CONCAT(id) as ids 
     FROM videos 
     GROUP BY filename 
     HAVING count > 1`,
    (err, duplicates) => {
      if (err) {
        console.error("Error finding duplicates:", err);
        return;
      }

      if (!duplicates || duplicates.length === 0) {
        console.log("✅ No duplicate videos found");
        return;
      }

      duplicates.forEach(dup => {
        const ids = dup.ids.split(',');
        // Keep the first ID, delete the rest
        const idsToDelete = ids.slice(1);
        
        idsToDelete.forEach(id => {
          db.run(
            "DELETE FROM videos WHERE id = ?",
            [id],
            (err) => {
              if (err) {
                console.error(`Error deleting duplicate video ${id}:`, err);
              } else {
                console.log(`🗑️ Removed duplicate video ID: ${id}`);
              }
            }
          );

          // Also delete associated comments
          db.run(
            "DELETE FROM comments WHERE video_id = ?",
            [id],
            (err) => {
              if (err) console.error(`Error deleting comments for video ${id}:`, err);
            }
          );
        });
      });
    }
  );
}

// Function to fetch YouTube video description from initial data
function fetchYouTubeDescription(videoId) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    https.get(url, (res) => {
      let html = '';
      res.on('data', chunk => {
        html += chunk;
      });
      res.on('end', () => {
        try {
          // Extract description from JSON-LD in the HTML
          const jsonLdMatch = html.match(/"description":"([^"\\]*(\\.[^"\\]*)*?)"/);
          if (jsonLdMatch && jsonLdMatch[1]) {
            // Unescape the description
            let description = jsonLdMatch[1]
              .replace(/\\u0022/g, '"')
              .replace(/\\u0027/g, "'")
              .replace(/\\\//g, '/')
              .replace(/\\\\/g, '\\')
              .replace(/\\n/g, ' ')
              .trim();
            // Limit to first 150 characters
            description = description.substring(0, 150);
            resolve(description);
          } else {
            resolve('Great video content from YouTube.');
          }
        } catch (err) {
          resolve('Great video content from YouTube.');
        }
      });
    }).on('error', () => {
      resolve('Great video content from YouTube.');
    });
  });
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
    db.run("INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hash],
      function(err) {
        if (err) {
          console.error("Register error:", err);
          return res.status(400).json({ error: "Email already exists" });
        }
        res.json({ message: "User registered", userId: this.lastID });
      });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    
    db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
      try {
        if (err) {
          console.error("Login database error:", err);
          return res.status(500).json({ error: "Database error. Please try again." });
        }
        
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
      } catch (innerErr) {
        console.error("Login inner error:", innerErr);
        res.status(500).json({ error: "Authentication error. Please try again." });
      }
    });
  } catch (error) {
    console.error("Login outer error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

app.post("/upload", uploadFields, (req, res) => {
  const { title, category } = req.body;
  const videoFile = req.files.video[0].filename;
  const thumbFile = req.files.thumbnail[0].filename;
  db.run("INSERT INTO videos (title,filename,category,thumbnail,videoUrl) VALUES (?,?,?,?,?)",
    [title, videoFile, category, thumbFile, null],
    () => res.json({ message: "Video uploaded" })
  );
});

app.get("/videos", (req, res) => {
  const q = req.query.q;
  let sql = "SELECT * FROM videos";
  let params = [];
  if (q) {
    sql += " WHERE title LIKE ?";
    params.push("%" + q + "%");
  }
  sql += " ORDER BY id DESC";
  db.all(sql, params, (err, rows) => res.json(rows));
});

app.post("/like/:id", (req, res) => {
  db.run("UPDATE videos SET likes=likes+1 WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Liked" })
  );
});

app.post("/comment", (req, res) => {
  const { user_id, video_id, comment } = req.body;
  db.run("INSERT INTO comments (user_id,video_id,comment) VALUES (?,?,?)",
    [user_id, video_id, comment],
    () => res.json({ message: "Comment added" })
  );
});

app.get("/comments/:videoId", (req, res) => {
  db.all("SELECT * FROM comments WHERE video_id=?",
    [req.params.videoId],
    (err, rows) => res.json(rows)
  );
});

app.delete("/videos/:id", (req, res) => {
  try {
    const videoId = req.params.id;
    
    // First, get the video to check if it's a default video
    db.get("SELECT filename, thumbnail, is_default FROM videos WHERE id=?", [videoId], (err, video) => {
      if (err) {
        console.error("Error fetching video:", err);
        return res.status(500).json({ error: "Server error" });
      }
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      // Prevent deletion of default videos
      if (video.is_default === 1) {
        return res.status(403).json({ error: "Cannot delete default videos" });
      }

      // Delete from database
      db.run("DELETE FROM videos WHERE id=?", [videoId], (deleteErr) => {
        if (deleteErr) {
          console.error("Error deleting video:", deleteErr);
          return res.status(500).json({ error: "Error deleting video" });
        }

        // Delete associated comments
        db.run("DELETE FROM comments WHERE video_id=?", [videoId], (commentErr) => {
          if (commentErr) {
            console.error("Error deleting comments:", commentErr);
          }
        });

        // Try to delete files (optional - won't fail if files don't exist)
        const fs = require('fs').promises;
        const path = require('path');
        
        const videoPath = path.join('uploads', video.filename);
        const thumbPath = path.join('uploads', video.thumbnail);
        
        Promise.all([
          fs.unlink(videoPath).catch(() => {}),
          fs.unlink(thumbPath).catch(() => {})
        ]).then(() => {
          res.json({ message: "Video deleted successfully" });
        }).catch(err => {
          console.error("Error deleting files:", err);
          res.json({ message: "Video deleted from database" });
        });
      });
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Import video from YouTube URL
app.post("/import-youtube", (req, res) => {
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
    db.get("SELECT id FROM videos WHERE filename = ?", [videoId], (err, existingVideo) => {
      if (err) {
        console.error("Error checking for duplicate:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (existingVideo) {
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
          
          // Fetch the actual YouTube description
          fetchYouTubeDescription(videoId).then(description => {
            // Store in database with YouTube URL
            db.run(
              "INSERT INTO videos (title, filename, category, thumbnail, videoUrl, likes, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [videoData.title || title, videoId, category, thumbnailUrl, `https://www.youtube.com/embed/${videoId}`, 0, description],
              function(err) {
                if (err) {
                  console.error("Error inserting video:", err);
                  return res.status(500).json({ error: "Error saving video" });
                }
                res.json({ 
                  message: "Video imported successfully",
                  videoId: this.lastID,
                  videoUrl: `https://www.youtube.com/embed/${videoId}`,
                  thumbnail: thumbnailUrl
                });
              }
            );
          });
        } catch (parseErr) {
          console.error("Error parsing YouTube data:", parseErr);
          // Fallback: store without metadata
          db.run(
            "INSERT INTO videos (title, filename, category, thumbnail, videoUrl, likes, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, videoId, category, `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://www.youtube.com/embed/${videoId}`, 0, 'Great video content from YouTube.'],
            function(err) {
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
      // Store without metadata
      db.run(
        "INSERT INTO videos (title, filename, category, thumbnail, videoUrl, likes, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, videoId, category, `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://www.youtube.com/embed/${videoId}`, 0, 'Great video content from YouTube.'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: "Error saving video" });
          }
          res.json({ message: "Video imported successfully" });
        }
      );
    });
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all videos (for cleanup)
app.delete("/videos", (req, res) => {
  try {
    db.run("DELETE FROM videos", (err) => {
      if (err) {
        return res.status(500).json({ error: "Error clearing videos" });
      }
      db.run("DELETE FROM comments", (commentErr) => {
        if (commentErr) console.error("Error clearing comments:", commentErr);
        res.json({ message: "All videos deleted" });
      });
    });
  } catch (error) {
    console.error("Clear error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
