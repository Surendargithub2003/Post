import {Component , OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../post.service";
import { Subscription } from "rxjs";

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
  private postsSub !: Subscription;

   constructor(public postsService : PostsService) {}

   ngOnInit() {
    this.isLoading = true;
       this.postsService.getPosts();
       this.postsSub = this.postsService.getPostUpdateListener().subscribe((posts : Post[])=>{
        this.isLoading = false;
        this.posts = posts;
       });
   }

   onDelete(postId : string){
        this.postsService.deletePost(postId);
   }

   ngOnDestroy() {
        this.postsSub.unsubscribe();
}
}

