
import { Request, Response, NextFunction } from "express";
import Post from '../models/post.js';

// Custom request type to include userData (from auth middleware)
interface AuthenticatedRequest extends Request {
  userData?: {
    userId: string;
  };
}

// Custom response type to include imageUrl in res.locals
interface ImageLocals {
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

    const postQuery = Post.find();
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
  Post.findById(req.params.id).then((post) => {
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

const comments = async (req :Request, res : Response) => {
  const postId = req.params.id;
  const { text, timestamp } = req.body;

  if (!text || !timestamp) {
    return res.status(400).json({ message: 'Text and timestamp are required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = { text, timestamp };
    post.comments.push(newComment);

    await post.save();
    res.status(200).json({
      message: 'Comment added successfully',
      comment: newComment,
      postId: post._id
    });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Error adding comment', error });
  }
};

const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove the comment from the comments array
    const commentIndex = post.comments.findIndex((comment: any) => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};


export default { createPost, updatePost, getPosts, getPost, deletePost , comments , deleteComment};
