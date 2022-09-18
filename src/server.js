import express from "express";
// const express = require("express"); 와 같으나 위에가 더 최신 문법임.
// node_modules의 "express"에서 express패키지를 찾아 파일에서 활용할 수 있도록 가져옴. 즉 from "express"는 정확히 말하면 node_modules/express임
const PORT = 4000;
const app = express();

// express() 아래에 와야함. 순서에 유의.

const globalRouter = express.Router();
const handleHome = (req, res) => res.send("Home");
globalRouter.get("/home", handleHome);

const userRouter = express.Router();
const handleEditUser = (req, res) => res.send("Edit user");
userRouter.get("/edit", handleEditUser);

const videoRouter = express.Router();
const handleWatch = (req, res) => res.send("Watch video");
videoRouter.get("/watch", handleWatch);

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
