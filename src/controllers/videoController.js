let videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "20 minutes ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 3,
    comments: 4,
    createdAt: "10 minutes ago",
    views: 19,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 1,
    comments: 0,
    createdAt: "1 minutes ago",
    views: 1,
    id: 3,
  },
];

export const trending = (req, res) =>
  res.render("home", { pageTitle: "Home", videos });

export const watch = (req, res) => {
  const { id } = req.params; // const id = req.params.id 와 같음. es6 문법.
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching ${video.title}`, video });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};
