import Video from "../models/Video.js";
import User from "../models/User.js";

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
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; // const id = req.params.id 와 같음. es6 문법.
  const video = await Video.findById(id);
  const user = await User.findById(video.owner);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: `404 | Video Not Found` });
  }
  return res.render("watch", { pageTitle: video.title, video, user });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: `404 | Video Not Found` });
  } else {
    return res.render("edit", { pageTitle: `Edit | ${video.title}`, video });
  }
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "404 | Video Not Found" });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtag(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { path: fileUrl } = req.file; //es6문법, videoUrl을 치면 req.file.path가 실행됨.
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      owner: _id,
      fileUrl,
      title,
      description,
      hashtags: Video.formatHashtag(hashtags),
    });
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
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
