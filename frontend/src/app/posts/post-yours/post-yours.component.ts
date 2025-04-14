//PostYoursComponent
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Post, UserLike } from "../post.model";
import { PostsService } from "../post.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../../auth/auth.service";
import { FormControl, Validators } from "@angular/forms";
import { tap } from "rxjs/operators";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-yours.component.html',
  styleUrl: './post-yours.component.css',
  standalone : false
})
export class PostYoursComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  currentPage = 1;
  postPerPage = 5;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string = '';
  commentControls: { [postId: string]: FormControl } = {};
  private users: { [userId: string]: string | undefined } = {};

  private authStatusSub?: Subscription;

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId() as string;
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
    this.fetchPosts();
  }

  fetchPosts() {
    this.isLoading = true;
    this.postsService.getPosts(this.postPerPage, this.currentPage)
      .pipe(
        tap(postData => {
          this.totalPosts = postData.postCount;
          this.posts = postData.posts.filter(post => post.creator === this.userId);
          this.processPosts();
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  processPosts() {
    this.posts.forEach(post => {
      if (!this.commentControls[post.id]) {
        this.commentControls[post.id] = new FormControl('', Validators.required);
      }
      post.likes ??= 0;

      post.likedBy?.forEach(liker => {
        const id = typeof liker === 'string' ? liker : liker?._id;
        if (id && !this.users[id]) {
          this.users[id] = typeof liker === 'string' ? undefined : liker.email;
        }
      });
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.fetchPosts();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).pipe(
      tap(() => this.fetchPosts())
    ).subscribe(() => this.isLoading = false);
  }

  onToggleComments(post: Post) {
    post.showComments = !post.showComments;
  }

  onAddComment(postId: string) {
    const control = this.commentControls[postId];
    if (control?.valid) {
      this.isLoading = true;
      this.postsService.addComment(postId, control.value).pipe(
        tap(() => {
          control.reset();
          this.fetchPosts();
        })
      ).subscribe(() => this.isLoading = false);
    }
  }

  onDeleteComment(postId: string, commentId: string) {
    this.isLoading = true;
    this.postsService.deleteComment(postId, commentId).pipe(
      tap(() => this.fetchPosts())
    ).subscribe(() => this.isLoading = false);
  }

  hasUserLiked(post: Post): boolean {
    return post.likedBy?.some(
      liker => typeof liker === 'string' ? liker === this.userId : liker?._id === this.userId
    ) ?? false;
  }

  getLikerEmail(liker: string | UserLike): string | undefined {
    const id = typeof liker === 'string' ? liker : liker._id;
    return id ? this.users[id] : undefined;
  }

  onLikePost(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = this.hasUserLiked(post);
    const oldLikes = post.likes ?? 0;
    const oldLikedBy = [...(post.likedBy ?? [])];

    post.likes = oldLikes + (wasLiked ? -1 : 1);
    post.likedBy = wasLiked
      ? (post.likedBy ?? []).filter(
          liker => (typeof liker === 'string' ? liker !== this.userId : liker._id !== this.userId)
        )
      : [...(post.likedBy ?? []), this.userId];

    this.posts = [...this.posts];

    this.postsService.likePost(postId).subscribe({
      error: () => {
        post.likes = oldLikes;
        post.likedBy = oldLikedBy;
        this.posts = [...this.posts];
      }
    });
  }

  ngOnDestroy() {
    this.authStatusSub?.unsubscribe();
  }
}
