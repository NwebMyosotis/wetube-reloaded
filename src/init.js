import "dotenv/config";
import "./db.js";
import "regenerator-runtime";
import Video from "./models/Video.js";
import User from "./models/User.js";
import Comment from "./models/Comment.js";
import app from "./server.js";

const PORT = process.env.PORT || 4000;

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
