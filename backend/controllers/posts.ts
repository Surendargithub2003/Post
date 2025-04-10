import { Request, Response, NextFunction } from "express";
import Post from '../models/post.js';

export interface AuthenticatedRequest extends Request {
  userData?: {
    userId: string;
  };
}

export interface ImageLocals {
  imageUrl?: string;
}
const createPost = (req: AuthenticatedRequest, res: Response<any, ImageLocals>, next: NextFunction) => {
  console.log("User Data:", req.userData);
  console.log("Title:", req.body.title);
  console.log("S3 Image URL:", res.locals.imageUrl);

  if (!res.locals.imageUrl) {
    return res.status(400).json({ message: "Image upload failed!" });
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: res.locals.imageUrl,
    creator: req.userData?.userId
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

const updatePost = (req: AuthenticatedRequest, res: Response<any, ImageLocals>, next: NextFunction) => {
  console.log("User Data in updatePost:", req.userData);

  let imagePath = req.body.imagePath;
  if (res.locals.imageUrl) {
    imagePath = res.locals.imageUrl;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData?.userId
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData?.userId }, post)
    .then((result) => {
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Update Successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Couldn't update post!" });
    });
};

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query.pagesize) || 0;
    const currentPage = Number(req.query.page) || 1;

    const postQuery = Post.find().populate('comments.creator', 'email'); 
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
  Post.findById(req.params.id).populate('comments.creator', 'email').then((post) => { 
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
  Post.deleteOne({ _id: req.params.id, creator: req.userData?.userId }).then((result) => {
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
  Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { content: req.body.content, creator: req.userData?.userId } } },
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
  Post.findByIdAndUpdate(
    req.params.postId,
    { $pull: { comments: { _id: req.params.commentId, creator: req.userData?.userId } } },
    { new: true }
  ).populate('comments.creator', 'email') 
    .then(post => {
      if (post) {
        const commentRemoved = post.comments.some(comment => comment._id?.toString() === req.params.commentId);
        if (!commentRemoved) {
          return res.status(200).json({ message: 'Comment deleted!', post: post });
        } else {
          return res.status(403).json({ message: 'Not authorized to delete this comment!' });
        }
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Deleting comment failed!', error: error.message });
    });
};

const likePost = async (req :any, res : Response) => {
  try {
    const postId = req.params.id;
    const userId = req.userData.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likedBy.includes(userId);

    if (hasLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
    } else {
      post.likedBy.push(userId);
    }

    post.likes = post.likedBy.length;

    await post.save();

    res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: post.likes,
      likedBy: post.likedBy,
    });
  } catch (error) {
    res.status(500).json({ message: "Liking/unliking post failed", error });
  }
};


export default { createPost, updatePost, getPosts, getPost, deletePost, addComment, deleteComment , likePost};