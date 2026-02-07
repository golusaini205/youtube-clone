import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import https from "https";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const SECRET = process.env.JWT_SECRET || "3f8df97f7c75d7d478e34b364dc7d37b";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI (or MONGO_URI) is required");
  process.exit(1);
}

mongoose.set("strictQuery", true);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true, unique: true },
    category: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    videoUrl: { type: String, default: null },
    is_default: { type: Boolean, default: false },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: "" },
    video_id: { type: String, required: true },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

videoSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

commentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model("User", userSchema);
const Video = mongoose.model("Video", videoSchema);
const Comment = mongoose.model("Comment", commentSchema);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Initialize database with proper error handling
let dbReady = false;

async function initializeDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    await seedDefaultVideos();
    dbReady = true;
    console.log("OK: MongoDB connected and ready");
  } catch (err) {
    console.error("ERROR: Database initialization failed:", err);
    throw err;
  }
}

// Seed default YouTube videos
async function seedDefaultVideos() {
  const defaultVideos = [
    { videoId: "KzXnXhekOz4", title: "Amazing Music Video 1", description: "An incredible music video with amazing visuals and great beats." },
    { videoId: "w9WgzE5WiyU", title: "Great Content 2", description: "High quality content that will keep you entertained." },
    { videoId: "iYqqP1qcv5c", title: "Interesting Video 3", description: "Discover something new and interesting in this video." },
    { videoId: "5ukPCvdY0YY", title: "Popular Video 4", description: "One of the most popular videos with millions of views." },
    { videoId: "0TMi1bnsUZo", title: "Trending Video 5", description: "Currently trending - check out what everyone is watching." },
    { videoId: "ZqwttIdH840", title: "Top Video 6", description: "Top rated content from creators you love." },
    { videoId: "xVGCFuIiIG0", title: "Best Video 7", description: "The best videos handpicked for your enjoyment." },
    { videoId: "aEw7d3EPnMU", title: "Awesome Content 8", description: "Awesome and engaging content that stands out." },
    { videoId: "SpMsTsnYOss", title: "Live Stream Video 9", description: "Live streaming experience with real-time engagement." },
    { videoId: "lZmvMW1ugRM", title: "Featured Video 10", description: "Featured content from the best creators." },
    { videoId: "oK9oTZR-ee4", title: "Recommended Video 11", description: "Recommended just for you based on your preferences." },
    { videoId: "8CCh_GLviFc", title: "Amazing Video 12", description: "Discover amazing content you will love watching." },
    { videoId: "ZjxiNW-6aPU", title: "Great Short Video 13", description: "Quick and entertaining short form content." },
    { videoId: "dcPOFGOC58o", title: "Interesting Video 14", description: "Fascinating content that keeps you engaged." },
    { videoId: "to9DjfD-mm0", title: "Popular Video 15", description: "Popular video with thousands of views and engagement." },
    { videoId: "kiiP56E_cCQ", title: "Trending Video 16", description: "Latest trending content everyone is watching." },
    { videoId: "G9MPvy7RlS4", title: "Featured Video 17", description: "Specially featured content just for you." },
    { videoId: "scu6_n8ozqE", title: "Best Video 18", description: "Best of the best videos curated for quality." },
    { videoId: "r1ZM2vXiVvs", title: "Top Video 19", description: "Top rated and most viewed video of the month." },
    { videoId: "_cESW8BwGoU", title: "Awesome Video 20", description: "Awesome content that stands out from the rest." },
    { videoId: "4RW-vaVbS_0", title: "Trending Video 21", description: "Currently trending in the community worldwide." },
    { videoId: "RzH5P-f4abg", title: "Recommended Video 22", description: "Recommended based on your viewing preferences." },
    { videoId: "Ebe9NFgQnnU", title: "Great Video 23", description: "Great quality video with excellent production value." },
    { videoId: "EZ2ZJxZhBoA", title: "Popular Video 24", description: "Popular across all platforms with great engagement." },
    { videoId: "i40mxe8lUg0", title: "Featured Video 25", description: "Featured on homepage due to excellent quality." },
    { videoId: "jjpjjcMeujM", title: "Best Video 26", description: "Best of our collection that you should watch." },
    { videoId: "Z4hVGCWH1Kc", title: "Trending Video 27", description: "Trending now and gaining views every minute." }
  ];

  const videoCount = await Video.countDocuments();
  if (videoCount > 0) {
    console.log(`OK: Videos already exist (${videoCount} videos found). Skipping seeding.`);
    return;
  }

  console.log(`Seeding ${defaultVideos.length} default videos...`);

  const docs = defaultVideos.map((video) => {
    const thumbnail = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
    const likes = Math.floor(Math.random() * 1000);

    return {
      title: video.title,
      filename: video.videoId,
      category: "Trending",
      thumbnail,
      videoUrl: embedUrl,
      likes,
      is_default: true,
      description: video.description
    };
  });

  await Video.insertMany(docs, { ordered: false });
  console.log(`OK: Seeded ${defaultVideos.length} default videos`);
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
    const user = await User.create({ name, email, password: hash });
    res.json({ message: "User registered", userId: user._id.toString() });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign({ id: user._id.toString() }, SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user._id.toString(),
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
    if (!req.files?.video?.[0] || !req.files?.thumbnail?.[0]) {
      return res.status(400).json({ error: "Missing video or thumbnail file" });
    }
    const videoFile = req.files.video[0].filename;
    const thumbFile = req.files.thumbnail[0].filename;

    await Video.create({
      title,
      filename: videoFile,
      category,
      thumbnail: thumbFile,
      videoUrl: null
    });

    res.json({ message: "Video uploaded" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading video" });
  }
});

app.get("/videos", async (req, res) => {
  try {
    const q = req.query.q;
    const filter = q ? { title: { $regex: q, $options: "i" } } : {};
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json(videos.map((video) => video.toJSON()));
  } catch (error) {
    console.error("Videos error:", error);
    res.status(500).json({ error: "Error fetching videos" });
  }
});

app.post("/like/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid video id" });
    }
    const result = await Video.updateOne({ _id: req.params.id }, { $inc: { likes: 1 } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({ message: "Liked" });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "Error updating likes" });
  }
});

app.post("/comment", async (req, res) => {
  try {
    const { user_id, video_id, comment } = req.body;
    if (!video_id || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await Comment.create({ user_id, video_id, comment });
    res.json({ message: "Comment added" });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ error: "Error adding comment" });
  }
});

app.get("/comments/:videoId", async (req, res) => {
  try {
    const comments = await Comment.find({ video_id: req.params.videoId }).sort({ createdAt: -1 });
    res.json(comments.map((comment) => comment.toJSON()));
  } catch (error) {
    console.error("Comments error:", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

app.delete("/videos/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    if (!isValidObjectId(videoId)) {
      return res.status(400).json({ error: "Invalid video id" });
    }
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (video.is_default) {
      return res.status(403).json({ error: "Cannot delete default videos" });
    }

    await Video.deleteOne({ _id: videoId });
    await Comment.deleteMany({ video_id: videoId });

    const videoPath = path.join(__dirname, "uploads", video.filename);
    const thumbPath = path.join(__dirname, "uploads", video.thumbnail);

    await Promise.all([
      fs.unlink(videoPath).catch(() => {}),
      fs.unlink(thumbPath).catch(() => {})
    ]);

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
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ filename: videoId });
    if (existingVideo) {
      return res.status(400).json({ error: "This video is already in your collection" });
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    const saveVideo = async (videoTitle, description) => {
      const newVideo = await Video.create({
        title: videoTitle,
        filename: videoId,
        category,
        thumbnail: thumbnailUrl,
        videoUrl: embedUrl,
        likes: 0,
        description
      });

      res.json({
        message: "Video imported successfully",
        videoId: newVideo._id.toString(),
        videoUrl: embedUrl,
        thumbnail: thumbnailUrl
      });
    };

    // Get video metadata from YouTube
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    https.get(apiUrl, (apiRes) => {
      let data = "";

      apiRes.on("data", (chunk) => {
        data += chunk;
      });

      apiRes.on("end", async () => {
        try {
          const videoData = JSON.parse(data);
          await saveVideo(videoData.title || title, "Great video content from YouTube.");
        } catch (parseErr) {
          console.error("Error parsing YouTube data:", parseErr);
          await saveVideo(title, "Great video content from YouTube.");
        }
      });
    }).on("error", async (err) => {
      console.error("Error fetching YouTube metadata:", err);
      await saveVideo(title, "Great video content from YouTube.");
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all videos
app.delete("/videos", async (req, res) => {
  try {
    await Video.deleteMany({});
    await Comment.deleteMany({});
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
      console.log(`OK: Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Videos endpoint: http://localhost:${PORT}/videos`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("ERROR: Failed to initialize database:", err);
    process.exit(1);
  });
