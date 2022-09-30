import "./db.js";
import Video from "./models/Video.js";
import app from "./server.js";

const PORT = 4000;

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
