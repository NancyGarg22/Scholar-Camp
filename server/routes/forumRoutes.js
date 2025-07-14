const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Reply = require("../models/Reply");
const verifyAuth = require("../middleware/verifyAuth");

// 🧵 Get all forum posts (threads)
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name linkedin instagram")

      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});




// ✍️ Create a new post
router.post("/posts", verifyAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content, user: req.user.id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// 💬 Get all replies for a post
router.get("/posts/:id/replies", async (req, res) => {
  try {
    const replies = await Reply.find({ post: req.params.id })
    .populate("user", "name linkedin instagram")

      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (err) {
    console.error("Error fetching replies:", err);
    res.status(500).json({ error: "Failed to fetch replies" });
  }
});

// ➕ Add a reply to a post
router.post("/posts/:id/replies", verifyAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const reply = new Reply({
      post: post._id,
      content: req.body.content,
      user: req.user.id,
    });

    await reply.save();

    post.replies.push(reply._id);
    await post.save();

    res.status(201).json(reply);
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
});


module.exports = router;
