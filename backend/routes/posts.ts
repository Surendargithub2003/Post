import express ,{ Request, Response, NextFunction } from "express";
import multer,{StorageEngine} from "multer";
import checkAuth from "../middelware/check-auth.js";
import PostConroller from '../controllers/posts.js'
import files from "../middelware/file.js";
const router = express.Router();



router.post(
    "",
    checkAuth,
    files.upload,
    PostConroller.createPost
    );

  
    
router.put("/:id",checkAuth, files.upload,PostConroller.updatePost);

router.get('',PostConroller.getPosts );

router.get("/:id",PostConroller.getPost )

router.delete("/:id" ,checkAuth, PostConroller.deletePost);




export default router