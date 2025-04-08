import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
  standalone: false,
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  currentPage = 1;
  postPerPage = 5;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string = '';
  postIdToDelete: string = '';
  commentToDelete: { postId: string; commentIndex: number } | null = null;

  private postsSub!: Subscription;
  private authStatusSub: Subscription | undefined;

  @ViewChild('confirmDeletePostDialog') confirmDeletePostDialog!: TemplateRef<any>;
  @ViewChild('confirmDeleteCommentDialog') confirmDeleteCommentDialog!: TemplateRef<any>;

  constructor(
    public postsService: PostsService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.userId = this.authService.getUserId() as string;

    this.postsSub = this.postsService.getPostUpdateListener().subscribe(
      (postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts.map((post) => ({
          ...post,
          showComments: false,
          newComment: '',
          comments: post.comments || [],
        }));
      }
    );

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      (isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }

  openDeletePostDialog(postId: string) {
    this.postIdToDelete = postId;
    this.dialog.open(this.confirmDeletePostDialog);
  }

  confirmDeletePost(): void {
    this.isLoading = true;
    this.dialog.closeAll();
    this.postsService.deletePost(this.postIdToDelete).subscribe(
      () => {
        this.postsService.getPosts(this.postPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  openDeleteCommentDialog(postId: string, commentIndex: number): void {
    this.commentToDelete = { postId, commentIndex };
    this.dialog.open(this.confirmDeleteCommentDialog);
  }

  confirmDeleteComment(): void {
    if (!this.commentToDelete) {
      return;
    }

    this.isLoading = true;
    this.dialog.closeAll();

    const { postId, commentIndex } = this.commentToDelete;

    this.postsService.deleteComment(postId, commentIndex).subscribe(
      () => {
        const post = this.posts.find((p) => p.id === postId);
        if (post && post.comments) {
          post.comments.splice(commentIndex, 1); // Remove comment locally after successful delete
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error deleting comment:', error);
        this.isLoading = false;
      }
    );

    this.commentToDelete = null;
  }

  cancelDeleteDialog(): void {
    this.dialog.closeAll();
    this.postIdToDelete = '';
    this.commentToDelete = null;
  }

  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
  }

  addComment(post: Post) {
    if (!post.newComment || post.newComment.trim() === '') return;

    const newComment = {
      text: post.newComment.trim(),
      timestamp: new Date(),
    };

    this.postsService.addComment(post.id, newComment).subscribe(
      () => {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(newComment); // Update UI after successful backend save
        post.newComment = ''; // Clear input field
      },
      (err) => {
        console.error('Error saving comment:', err);
      }
    );
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub?.unsubscribe();
  }
}
