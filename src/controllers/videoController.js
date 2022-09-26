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
    views: 0,
    id: 3,
  },
];

export const trending = (req, res) =>
  res.render("home", { pageTitle: "Home", videos });
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => {
  res.send(`Delete Video #${req.params.id}`);
};
