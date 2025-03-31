import Post from '../models/post.js'

const createPost = (req : any, res : any, next : any) => {
      console.log("User Data:", req.userData);
      const url = req.protocol + "://" + req.get("host");
      console.log(req.body.title)
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded!" });
    }
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator : req.userData.userId
      });


      post.save().then((createdPost: any) => {
        res.status(201).json({
          message: "Post added successfully",
          post: {
            ...createdPost,
            id: createdPost._id
          }
        });
      }).catch(error=>{
        res.status(500).json({
          message : "Creating a Post Failed!"
        })
      });
    }

const updatePost = (req:any, res:any, next:any)=>{
    console.log("User Data in updatePost:", req.userData);
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id : req.body.id,
        title : req.body.title,
        content:req.body.content,
        imagePath:imagePath,
        creator : req.userData.userId
    })
    console.log(post);
    Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then((result : any)=>{
       if(result.modifiedCount > 0){
        res.status(200).json({message : "Update Succesfull!"})
       }
       else{
        res.status(401).json({message : "Not authorized!"})
       }
    })
    .catch(error =>{
      res.status(500).json({
        message : "Couldn't update post!"
      });
    });
}

const getPosts = (req: any, res: any, next: any) => {
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
     } )}).catch(error =>{
      res.status(500).json({
        message : "Fetching posts failed!"
      })
     });
}

const getPost = (req : any,res : any,next : any)=>{
    Post.findById(req.params.id).then((post : any) => {
        if(post){
            res.status(200).json(post);
        }
        else{
            res.status(404).json({message : 'Post not found!'})
        }
    }).catch(error=>{
      res.status(500).json({
        message : "Fetching post failed!"
      })
    })
}

const deletePost = (req : any, res : any, next : any)=>{
    Post.deleteOne({_id:req.params.id , creator : req.userData.userId}).then((result:any) =>{
        if(result.deletedCount > 0){
            res.status(200).json({message : "Deletion Succesfull!"})
           }
           else{
            res.status(401).json({message : "Not authorized!"})
           }
    })
   
}

export default {createPost , updatePost , getPosts , getPost , deletePost};