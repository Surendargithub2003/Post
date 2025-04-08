import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../post.service';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-yours',
  templateUrl: './post-yours.component.html',
  styleUrls: ['./post-yours.component.css'],
  standalone : false
})
export class PostYoursComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  private postsSub!: Subscription;

  totalPosts = 0;
  postPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  userIsAuthenticated = false;
  userId!: string;
  private authStatusSub!: Subscription;

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.userId = this.authService.getUserId()!;
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe(postData => {
        this.posts = postData.posts.filter(post => post.creator === this.userId);
        this.totalPosts = postData.postCount;
        this.isLoading = false;
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId()!;
      });
  }

  onChangedPage(pageData: { pageIndex: number; pageSize: number }) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postPerPage, this.currentPage);
    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
