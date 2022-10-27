import express from "express";
import {
  getEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
  postEdit,
} from "../controllers/userController.js";
import { protectorMiddleware, publicOnlyMiddleware } from "../middleware.js";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);

userRouter.get(":/id", see);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);

export default userRouter;
