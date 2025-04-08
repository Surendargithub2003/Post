import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true},
  creator : {type : mongoose.Schema.Types.ObjectId ,ref:"User", required : true},
  comments: [commentSchema]
});

export default mongoose.model("Post", postSchema);







