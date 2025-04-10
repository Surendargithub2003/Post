import { Component , OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model.js";
import { PostsService } from "../post.service.js";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../../auth/auth.service.js";
import { FormControl, Validators } from "@angular/forms";

@Component({
    selector : 'app-post-list',
    templateUrl : './post-list.component.html',
    styleUrl : './post-list.component.css',
    standalone : false
})

export class PostListComponent implements OnInit , OnDestroy {
    posts : Post[]= [];
    isLoading = false;
    totalPosts = 10;
    currentPage = 1;
    postPerPage = 5;
    pageSizeOptions = [1 ,2 ,5 , 10];
    userIsAuthenticated = false;
    userId : string = '';
    likedPostIds: Set<string> = new Set<string>();

    private postsSub !: Subscription;
    private authStatusSub : Subscription | undefined;
    commentControls: { [postId: string]: FormControl } = {};

   constructor(public postsService : PostsService , private authService : AuthService) {
    console.log('PostListComponent constructor called');
   }

   ngOnInit() {
    this.isLoading = true;
    console.log("ok")
       this.postsService.getPosts(this.postPerPage,this.currentPage);
       this.userId = this.authService.getUserId() as string;
       this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData : {posts : Post[],postCount : number})=>{
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
        this.posts.forEach(post => {
          this.commentControls[post.id] = new FormControl('', Validators.required);
          if (post.likes === undefined) {
            post.likes = 0;
          }
        });
       });
       this.userIsAuthenticated = this.authService.getIsAuth();
       this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(isAutenticated =>
       {
            this.userIsAuthenticated = isAutenticated;
       }
       )
   }

   onChangedPage(pageData : PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage,this.currentPage)
   }

   onDelete(postId : string){
    this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(()=>{
            this.postsService.getPosts(this.postPerPage,this.currentPage);
        }, () => {
            this.isLoading = false;
        });
   }

   onToggleComments(post: Post) {
    post.showComments = !post.showComments;
   }

   onAddComment(postId: string) {
    if (this.commentControls[postId].valid) {
      this.isLoading = true;
      this.postsService.addComment(postId, this.commentControls[postId].value).subscribe(() => {
        this.postsService.getPosts(this.postPerPage, this.currentPage); 
        this.commentControls[postId].reset();
      }, () => {
        this.isLoading = false;
      });
    }
   }

   onDeleteComment(postId: string, commentId: string) {
    this.isLoading = true;
    this.postsService.deleteComment(postId, commentId).subscribe(() => {
      this.postsService.getPosts(this.postPerPage, this.currentPage); 
    }, () => {
      this.isLoading = false;
    });
   }
   hasUserLiked(post: Post): boolean {
    return !!post.likedBy?.includes(this.userId);
  }
  
  onLikePost(postId: string) {
    this.postsService.likePost(postId).subscribe((response) => {
      const updatedPost = this.posts.find(post => post.id === postId);
      if (updatedPost) {
        updatedPost.likes = response.likes;
        updatedPost.likedBy = response.likedBy;
      }
    });
  }
  
   ngOnDestroy() {
        this.postsSub.unsubscribe();
        this.authStatusSub?.unsubscribe();
}
}