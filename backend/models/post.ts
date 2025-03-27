import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true,  default:"../images/work-1742444935741-png"}
});

export default mongoose.model("Post", postSchema);







