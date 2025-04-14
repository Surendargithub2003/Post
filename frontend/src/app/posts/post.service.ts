import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Post } from './post.model';
import { UserLike } from './post.model'; 

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postPerPage: number, currentPage: number): Observable<{ posts: Post[]; postCount: number }> {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    return this.http
      .get<{ message: string; posts: any[]; maxPosts: number }>(BACKEND_URL + queryParams)
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => ({
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              comments: post.comments || [],
              likes: post.likes,
              likedBy: post.likedBy,
              showComments: false,
            }) as Post), 
            postCount: postData.maxPosts, 
          };
        }),
        tap((transformedPostData) => {
          console.log(transformedPostData);
          this.posts = transformedPostData.posts.reverse();
          this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostData.postCount }); // Use postCount from transformed data
        })
      );
  }

  getPostUpdateListener(): Observable<{ posts: Post[]; postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{
    _id: string;
    title: string;
    content: string;
    imagePath: string;
    creator: string;
    comments: any[];
    likes: number;
    likedBy: string[] | UserLike[];
  }> {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      comments: any[];
      likes: number;
      likedBy: string[] | UserLike[];
    }>(BACKEND_URL + id);
  }
  addPost(postData: FormData): void {
    this.http.post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
  
  updatePost(id: string, postData: FormData): void {
    this.http.put(BACKEND_URL + id, postData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }


  deletePost(postId: string): Observable<any> {
    return this.http.delete(BACKEND_URL + postId);
  }

  addComment(postId: string, content: string): Observable<{ message: string; post: Post }> {
    return this.http.post<{ message: string; post: Post }>(BACKEND_URL + postId + '/comments', { content });
  }

  deleteComment(postId: string, commentId: string): Observable<{ message: string; post: Post }> {
    return this.http.delete<{ message: string; post: Post }>(`${BACKEND_URL}${postId}/comments/${commentId}`);
  }

  likePost(postId: string): Observable<{ message: string; likes: number; likedBy: string[] | UserLike[] }> {
    return this.http.put<{ message: string; likes: number; likedBy: string[] | UserLike[] }>(
      BACKEND_URL + 'like/' + postId,
      {}
    );
  }
}