import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { async } from "regenerator-runtime";

/* <callback 방식>
Video.find({}, (error, videos) => {
    return res.render("home", { pageTitle: "Home", videos }); (retrun은 여기선 별 역할을 하지 않는다)(callback은 return이 필요없음))
  });
*/

/* promise error
export const home = async (req, res) => {
  try {
    const videos = await Video.find({});
    return res.render("home", { pageTitle: "Home", videos });
  } catch {
    return res.render("server-error");
  }
};
*/

export const home = async (req, res) => {
  const videos = await Video.find({})
    .populate("owner")
    .sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; // const id = req.params.id 와 같음. es6 문법.
  const video = await Video.findById(id).populate("owner").populate("comments");
  console.log(video);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: `404 | Video Not Found` });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: `404 | Video Not Found` });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit | ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "404 | Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Your not the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtag(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files; //es6문법, videoUrl을 치면 req.file.path가 실행됨.
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      owner: _id,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      title,
      description,
      hashtags: Video.formatHashtag(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "404 | Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const userModel = await User.findById(user._id);
  if (!userModel) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  userModel.comments.push(comment._id);
  video.save();
  userModel.save();
  return res.status(201).json({ newCommentId: comment._id });
  //json은 프론트엔드에 댓글Id를 보내기 위한 작업임
};

export const editComment = async (req, res) => {
  const {
    body: { text },
    params: { commentId: id },
    session: {
      user: { _id: userId },
    },
  } = req;
  const comment = await Comment.findById(id).populate("owner");
  if (userId !== String(comment.owner._id)) {
    return res.sendStatus(403);
  }
  await Comment.findByIdAndUpdate(id, {
    text,
  });
  return res.sendStatus(200);
};

export const deleteComment = async (req, res) => {
  const {
    params: { commentId },
    session: {
      user: { _id: userId },
    },
  } = req;
  const comment = await Comment.findById(commentId).populate("owner");
  const videoId = comment.video;
  if (userId !== String(comment.owner._id)) {
    return res.sendStatus(403);
  }
  await Video.updateOne(
    { _id: videoId },
    { $pullAll: { comments: [commentId] } }
  );
  await User.updateOne(
    { _id: userId },
    { $pullAll: { comments: [commentId] } }
  );
  await Comment.findByIdAndDelete(commentId);
  return res.sendStatus(200);
};
