import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostsService } from '../post.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
  standalone: false
})
export class PostCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = false;
  imagePreview = '';
  private mode: 'create' | 'edit' = 'create';
  private postId: string | null = null;
  post: Post = { id: '', title: '', content: '', imagePath: '', creator: '', comments: [] };
  private authStatusSub?: Subscription;
  private newImagePicked = false; // Flag to track if a new image has been selected

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(() => {
      this.isLoading = false;
    });

    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      content: new FormControl(null, [Validators.required]),
      image: new FormControl(null, [], [mimeType])
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId!).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
            comments: []
          };
          this.form.patchValue(this.post);
          this.imagePreview = postData.imagePath;
          this.form.get('image')?.clearValidators();
          this.form.get('image')?.updateValueAndValidity();
        });
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      this.newImagePicked = true; 

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.newImagePicked = false; 
      this.form.patchValue({ image: null });
      this.form.get('image')?.updateValueAndValidity();
    }
  }

  onSavePost() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { title, content, image } = this.form.value;
    const formData = new FormData();
    formData.append('title', title || '');
    formData.append('content', content || '');

    if (this.mode === 'create') {
      formData.append('image', image, title);
      this.postsService.addPost(formData);
    } else {
     
      if (this.newImagePicked && image) {
        formData.append('image', image, title);
      }
    
      formData.append('imagePath', this.post.imagePath);
      this.postsService.updatePost(this.postId!, formData);
    }

    this.form.reset();
    this.newImagePicked = false; 
  }

  ngOnDestroy() {
    this.authStatusSub?.unsubscribe();
  }
}