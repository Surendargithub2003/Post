import { Request, Response, NextFunction } from "express";
import Post from '../models/post.js';
import mongoose from 'mongoose';
const { Types } = mongoose;
import image from "../middelware/file.js";
import multer from 'multer';

export interface AuthenticatedRequest extends Request {
  userData?: {
    userId: string;
  };
}

export interface ImageLocals {
  imageUrl?: string;
}

const upload = multer().single('image');

const createPost = (req: AuthenticatedRequest, res: Response<any, ImageLocals>, next: NextFunction) => {
  console.log("User Data:", req.userData);
  console.log("Title:", req.body.title);
  console.log("S3 Image URL:", res.locals.imageUrl);

  if (!res.locals.imageUrl) {
    return res.status(400).json({ message: "Image upload failed!" });
  }

  if (!req.userData?.userId) {
    return res.status(401).json({ message: "Authentication required to create a post." });
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: res.locals.imageUrl,
    creator: new Types.ObjectId(req.userData.userId)
  });

  post.save().then((createdPost) => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...createdPost.toObject(),
        id: createdPost._id
      }
    });
  }).catch(error => {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Creating a Post Failed!",
      error: error.message
    });
  });
};

const updatePost = async (
  req: AuthenticatedRequest,
  res: Response<any, ImageLocals>,
  next: NextFunction
) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file.', error: err });
    }

    try {
      console.log("User Data in updatePost:", req.userData);

      if (!req.userData?.userId) {
        return res.status(401).json({ message: "Authentication required to update a post." });
      }

      const postId = req.params.id;

      if (!Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid Post ID!" });
      }

      let finalImagePath = req.body.imagePath || "";

      if (req.file) {
        await image.uploadToS3(req, res, () => {
          finalImagePath = res.locals?.imageUrl || finalImagePath;
        });
      }

      const result = await Post.updateOne(
        {
          _id: new Types.ObjectId(postId),
          creator: new Types.ObjectId(req.userData.userId),
        },
        {
          $set: {
            title: req.body.title,
            content: req.body.content,
            imagePath: finalImagePath,
          },
        }
      );

      console.log("Mongo Update Result:", result);

      if (result.modifiedCount > 0) {
        return res.status(200).json({ message: "Update Successful!" });
      } else {
       
        return res.status(200).json({ message: "No changes made!" });
      }
    } catch (error: any) {
      console.error("Error updating post:", error);
      return res.status(500).json({
        message: "Couldn't update post!",
        error: error.message || error,
      });
    }
  });
};

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query.pagesize) || 0;
    const currentPage = Number(req.query.page) || 1;

    const postQuery = Post.find()
      .populate('comments.creator', 'email')
      .populate('likedBy', 'email');
    if (pageSize && currentPage) {
      postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }

    const [fetchedPosts, totalPosts] = await Promise.all([
      postQuery.exec(),
      Post.countDocuments().exec()
    ]);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: fetchedPosts,
      maxPosts: totalPosts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Fetching posts failed!" });
  }
};

const getPost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;
  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid Post ID!" });
  }

  Post.findById(new Types.ObjectId(postId)) // Convert postId to ObjectId
    .populate('comments.creator', 'email')
    .populate('likedBy', 'email')
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    }).catch(error => {
      res.status(500).json({ message: "Fetching post failed!" });
    });
};

const deletePost = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userData?.userId) {
    return res.status(401).json({ message: "Authentication required to delete a post." });
  }

  const postId = req.params.id;
  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid Post ID!" });
  }

  Post.deleteOne({ _id: new Types.ObjectId(postId), creator: new Types.ObjectId(req.userData.userId) }) // Convert both to ObjectId
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deletion Successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }).catch(error => {
      res.status(500).json({ message: "Deleting post failed!" });
    });
};

const addComment = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userData?.userId) {
    return res.status(401).json({ message: "Authentication required to add a comment." });
  }

  const postId = req.params.id;
  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid Post ID!" });
  }

  Post.findByIdAndUpdate(
    new Types.ObjectId(postId), 
    { $push: { comments: { content: req.body.content, creator: new Types.ObjectId(req.userData.userId) } } }, // Convert userId to ObjectId
    { new: true }
  ).populate('comments.creator', 'email')
    .then(post => {
      if (post) {
        res.status(201).json({ message: 'Comment added!', post: post });
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Adding comment failed!', error: error.message });
    });
};

const deleteComment = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userData?.userId) {
    return res.status(401).json({ message: "Authentication required to delete a comment." });
  }

  const postId = req.params.postId;
  const commentId = req.params.commentId;

  if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid Post or Comment ID!" });
  }

  Post.findByIdAndUpdate(
    new Types.ObjectId(postId),
    { $pull: { comments: { _id: new Types.ObjectId(commentId), creator: new Types.ObjectId(req.userData.userId) } } }, // Convert commentId and userId to ObjectId
    { new: true }
  ).populate('comments.creator', 'email')
    .then(post => {
      if (post) {
        const commentRemoved = post.comments.some(comment => comment._id?.toString() === commentId); // Comparing string to string here is okay
        if (!commentRemoved) {
          return res.status(200).json({ message: 'Comment deleted!', post: post });
        } else {
          return res.status(403).json({ message: 'Not authorized to delete this comment!' });
        }
      } else {
        return res.status(404).json({ message: 'Post not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Deleting comment failed!', error: error.message });
    });
};

const likePost = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userData?.userId) {
    return res.status(401).json({ message: "Authentication required to like/unlike a post." });
  }

  try {
    const postId = req.params.id;
    const userId = req.userData.userId;

    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid Post ID!" });
    }

    const post = await Post.findById(new Types.ObjectId(postId)).populate('likedBy', 'email'); // <- populate with email

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const objectIdUserId = new Types.ObjectId(userId);
    const hasLiked = post.likedBy.some(user => user._id.equals(objectIdUserId));

    if (hasLiked) {
      post.likedBy = post.likedBy.filter(user => !user._id.equals(objectIdUserId));
    } else {
      post.likedBy.push(objectIdUserId);
    }

    post.likes = post.likedBy.length;
    await post.save();
    const updatedPost = await Post.findById(postId).populate('likedBy', 'email');

    res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: updatedPost?.likes,
      likedBy: updatedPost?.likedBy.map((user: any) => user.email), 
    });
  } catch (error) {
    res.status(500).json({ message: "Liking/unliking post failed", error });
  }
};

export default { createPost, updatePost, getPosts, getPost, deletePost, addComment, deleteComment, likePost };