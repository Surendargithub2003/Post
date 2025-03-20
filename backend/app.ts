import path from 'path'
import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
import cors from 'cors'
import Post from './models/post.js'
import postsRoutes from './routes/posts.js' 
const app = express();



mongoose.connect("mongodb+srv://admin:123@cluster0.wdvb3.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0")
    .then(()=> {
        console.log("Connected to database!");
    })
    .catch(()=>{
        console.log('Connection failed');
    })
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use("/images", express.static(path.join("backend/images")));

app.use(cors())
app.use((req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type , Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET , POST , PATCH ,PUT, DELETE, OPTIONS'
  );
  res.setHeader("Content-Type", "application/json");
  next();
});

app.post("/api/posts" , (req : any , res : any , next : any )=>{
    const post = new Post({
        title : req.body.title,
        content : req.body.content
    });
    post.save().then((createdPost:any) =>{
        res.status(201).json({
            message : 'Post added successfully',
            postId : createdPost._id
        });
    });  
})

app.put("/api/posts/:id",(req:any, res:any, next:any)=>{
    const post = new Post({
        _id : req.body.id,
        title : req.body.title,
        content:req.body.content
    })
    Post.updateOne({_id: req.params.id}, post).then((result : any)=>{
        console.log(result);
        res.status(200).json({message : "Update Succesfull!"})
    });
});

app.get('/api/posts', (req: any, res: any, next: any) => {
  
    Post.find().then((documents : any)=>{
        return res.status(200).json({
            message: ' Posts fetched Succesfully !',
            posts: documents,
          });
    });
});

app.get("/api/posts/:id", (req : any,res : any,next : any)=>{
    Post.findById(req.params.id).then((post : any) => {
        if(post){
            res.status(200).json(post);
        }
        else{
            res.satus(404).json({message : 'Post not found!'})
        }
    })
})

app.delete("/api/posts/:id" , (req : any, res : any, next : any)=>{
    Post.deleteOne({_id:req.params.id}).then((result:any) =>{
        console.log(result);
    })
    res.status(200).json({message : "Post deleted!"});
});

app.use("/api/posts",postsRoutes)

export default app;
