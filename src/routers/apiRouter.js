import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
  editComment,
} from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post("/videos/:commentId([0-9a-f]{24})/edit", editComment);
apiRouter.delete("/comments/:commentId([0-9a-f]{24})/delete", deleteComment);
export default apiRouter;
