import express from "express";
// const express = require("express"); 와 같으나 위에가 더 최신 문법임.
// node_modules의 "express"에서 express패키지를 찾아 파일에서 활용할 수 있도록 가져옴.
const PORT = 4000;
const app = express();

// express() 아래에 와야함. 순서에 유의.

const priavteMiddleware = (req, res, next) => {
  const url = req.url;
  if (url === "/protected") {
    return res.send("<h1>Not Allowed</h1>");
  } else {
    console.log("Allowed, you may continue.");
    next();
  }
};

const handleProtect = (req, res) => {
  return res.send("Welcome to the private lounge.");
};

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const handleHome = (req, res) => {
  return res.send("It's not middleware");
};

// app.use(logger);
app.use(priavteMiddleware);
app.get("/", logger, handleHome);
app.get("/protected", logger, handleProtect);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
