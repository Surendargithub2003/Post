import express, { Router } from "express";
import checkAuth from "../middelware/check-auth.js";
import PostConroller from '../controllers/posts.js';
import image from "../middelware/file.js";

const router: Router = express.Router();

router.post(
  "",
  checkAuth,
  image.uploadSingleImage,
  image.uploadToS3,
  PostConroller.createPost
);

router.put(
  "/:id",
  checkAuth,
  image.uploadSingleImage,
  image.uploadToS3,
  PostConroller.updatePost
);

router.get('', PostConroller.getPosts);

router.get("/:id", PostConroller.getPost);

router.delete("/:id", checkAuth, PostConroller.deletePost);

router.post("/:id/comments", checkAuth, PostConroller.addComment);

router.delete("/:postId/comments/:commentId", checkAuth, PostConroller.deleteComment);

export default router;