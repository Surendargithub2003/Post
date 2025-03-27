import express ,{ Request, Response, NextFunction } from "express";
import multer,{StorageEngine} from "multer";
import Post from '../models/post.js'
import checkAuth from "../middelware/check-auth.js";
const router = express.Router();


const MIME_TYPE_MAP = {
        'image/png' : 'png',
        'image/jpeg':'jpg',
        'image/jpg':'jpg'
};

const storage : StorageEngine = multer.diskStorage({
    destination:(req : Request , file : Express.Multer.File , cb : any) =>{
        console.log("Received file MIME type:", file.mimetype);
        const isValid = MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP]; 
        let error: Error | null = isValid ? null : new Error("Invalid mime type");
        cb(error , "backend/images");
    },
    filename : (req : Request, file : any, cb :any)=>{
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP];
        cb(null , name + '-' + Date.now()+ '.'+ ext);
    }
})


const upload = multer({ storage });
router.post(
    "",
    checkAuth,
    upload.single("image"),
    (req : any, res : any, next : any) => {
      const url = req.protocol + "://" + req.get("host");
      console.log(req.body.title)
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded!" });
    }
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename
      });
      post.save().then((createdPost: any) => {
        res.status(201).json({
          message: "Post added successfully",
          post: {
            ...createdPost,
            id: createdPost._id
          }
        });
      });
    }
  );


router.put("/:id", checkAuth,multer({ storage: storage }).single("image"),(req:any, res:any, next:any)=>{
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id : req.body.id,
        title : req.body.title,
        content:req.body.content,
        imagePath:imagePath
    })
    console.log(post);
    Post.updateOne({_id: req.params.id}, post).then((result : any)=>{
        console.log(result);
        res.status(200).json({message : "Update Succesfull!"})
    });
});

router.get('', (req: any, res: any, next: any) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts: any;
    if(pageSize && currentPage){
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    postQuery.then((documents : any)=>{
        fetchedPosts = documents;
      return Post.countDocuments();
    }).then(count=>{
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: fetchedPosts,
            maxPosts:count
     } )});
});

router.get("/:id", (req : any,res : any,next : any)=>{
    Post.findById(req.params.id).then((post : any) => {
        if(post){
            res.status(200).json(post);
        }
        else{
            res.status(404).json({message : 'Post not found!'})
        }
    })
})

router.delete("/:id" ,checkAuth,(req : any, res : any, next : any)=>{
    Post.deleteOne({_id:req.params.id}).then((result:any) =>{
        console.log(result);
        res.status(200).json({message : "Post deleted!"});
    })
   
});




export default router