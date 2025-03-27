import {Component , OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model.js";
import { PostsService } from "../post.service.js";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";

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
  pageSizeOptions = [1 ,2 ,5 , 10

  ];
  private postsSub !: Subscription;

   constructor(public postsService : PostsService) {}

   ngOnInit() {
    this.isLoading = true;
       this.postsService.getPosts(this.postPerPage,1);
       this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData : {posts : Post[],postCount : number})=>{
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
       });
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
        });
   }

   ngOnDestroy() {
        this.postsSub.unsubscribe();
}
}

