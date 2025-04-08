import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.js';
import { Post } from './post.model.js';

const BACKEND_URL = environment.apiUrl + '/posts/'
@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts:Post[] , postCount : number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postPerPage : number , currentPage : number) {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any  , maxPosts : number}>(BACKEND_URL+queryParams)
      .pipe(
        map((postData) => {
          return { posts : postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              comments: post.comments || [], 
              showComments: false,
            };
          }), 
          maxPosts :postData.maxPosts
        } 
        })
      )
      .subscribe((transformedPostData) => {
        console.log(transformedPostData)
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({ posts : [...this.posts], 
          postCount:transformedPostData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator : string;
    }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    console.log("Title:", title);
    console.log("Content:", content);
    console.log("Image:", image);

    if (!image) {
      console.error(" No image ");
      return;
    }

    const postData = new FormData();
    postData.append("title", title || ''); 
    postData.append("content", content || '');
    postData.append("image", image,title);

    console.log(" Logging FormData Contents:");
    for (let pair of postData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    console.log(" Sending POST request:", postData);

    this.http.post<{ message: String; post: Post }>(
        BACKEND_URL,
        postData
      )
      .subscribe({
        next: (responseData) => {
              this.router.navigate(["/"]);
        },
        error: (err) => {
          console.error(" Error : HTTP Request Failed:", err);
        }
      });
}

updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    let imagePath : string;

    if (typeof image === 'object') {
        postData = new FormData();
        postData.append('id', id);
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
    } else {
        postData = {
            id: id,
            title: title,
            content: content,
            imagePath: image,
            creator : ""
        };
    }
    this.http
        .put(BACKEND_URL + id, postData)
        .subscribe((responseData : any) => {
            this.router.navigate(['/']);
        });
}

  deletePost(postId: string) {
    return this.http
      .delete(BACKEND_URL + postId);
  }

  addComment(postId: string, comment: { text: string, timestamp: Date }) {
    return this.http.post(`http://localhost:3000/api/posts/${postId}/comments`, comment);
  }
  deleteComment(postId: string, commentId: any) {
    return this.http.delete<{ message: string }>(`${BACKEND_URL}${postId}/comments/${commentId}`);
  }
  
}
