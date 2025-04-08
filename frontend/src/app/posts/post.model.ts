export interface Comment {
  text: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;


  comments?: Comment[];       
  showComments?: boolean;     
  newComment?: string;       
}
