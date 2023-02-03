import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
// const express = require("express"); 와 같으나 위에가 더 최신 문법임.
// node_modules의 "express"에서 express패키지를 찾아 파일에서 활용할 수 있도록 가져옴. 즉 from "express"는 정확히 말하면 node_modules/express임
import morgan from "morgan";
import { localsMiddleware } from "./middleware.js";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import apiRouter from "./routers/apiRouter.js";
import flash from "express-flash";

const app = express();
const logger = morgan("dev");

// express() 아래에 와야함. 순서에 유의.

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Embedder-Policy", "credentialless");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKEI_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: {
      maxAge: 86400000,
    },
  })
);

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
