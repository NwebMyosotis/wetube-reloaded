import express from "express";
import { getJoin, postJoin, getLogin } from "../controllers/userController.js";
import { home, search } from "../controllers/videoController.js";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin);
rootRouter.get("/search", search);

export default rootRouter;
