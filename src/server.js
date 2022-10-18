import express from "express";
import session from "express-session";
// const express = require("express"); 와 같으나 위에가 더 최신 문법임.
// node_modules의 "express"에서 express패키지를 찾아 파일에서 활용할 수 있도록 가져옴. 즉 from "express"는 정확히 말하면 node_modules/express임
import morgan from "morgan";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

const app = express();
const logger = morgan("dev");

// express() 아래에 와야함. 순서에 유의.

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Hello!",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});

app.get("/add-one", (req, res, next) => {
  req.session.test += 1;
  return res.send(`${req.session.id}\n${req.session.test}`);
});

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
