import express from "express";
import {
  edit,
  remove,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/remove", remove);
userRouter.get(":/id", see);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);

export default userRouter;
