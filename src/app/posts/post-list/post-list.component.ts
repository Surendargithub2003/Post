import {Component , OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model.js";
import { PostsService } from "../post.service.js";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../../auth/auth.service.js";

@Component({
    selector : 'app-post-list',
    templateUrl : './post-list.component.html',
    styleUrl : './post-list.component.css',
    standalone : false
})

export class PostListComponent implements OnInit , OnDestroy {
    // posts = [
    //     {title: 'First Post', content : "This is the First post's content"},
    //     {title: 'Second Post', content : "This is the Second post's content"},
    //     {title: 'Third Post', content : "This is the Third post's content"}
    // ]

  posts : Post[]= [];
  isLoading = false;
  totalPosts = 10;
  currentPage = 1;
  postPerPage = 2;
  pageSizeOptions = [1 ,2 ,5 , 10];
  userIsAuthenticated = false;
  userId : string = '';
  private postsSub !: Subscription;
  private authStatusSub : Subscription | undefined;

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

   ngOnDestroy() {
        this.postsSub.unsubscribe();
        this.authStatusSub?.unsubscribe();
}
}

