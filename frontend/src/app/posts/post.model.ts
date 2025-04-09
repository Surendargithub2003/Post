export interface Comment {
  _id?: string;
  content: string;
  creator?: { _id: string; email: string };
  createdAt?: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
  comments: Comment[]; 
  showComments?: boolean; 
}