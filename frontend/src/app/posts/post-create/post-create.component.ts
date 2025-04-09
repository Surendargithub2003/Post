import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostsService } from '../post.service.js';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model.js';
import { mimeType } from './mime-type.validator.js';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service.js';

@Component({
  selector: 'app-post-create',
  standalone: false,
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css',
})
export class PostCreateComponent implements OnInit , OnDestroy{
  public mode = 'create';
  imagePreview: string = '';
  public postId: string | null = '';
  post: Post = { id: '', title: '', content: '', imagePath: '' , creator : "" , comments : []};
  selectedFile: File | null = null;
  form!: FormGroup;
  isLoading = false;
  private authStatusSub : Subscription | undefined;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService : AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(
      authSatus =>{
        this.isLoading = false;
      }
    );
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId ?? '').subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
            comments : []
          };
          this.form.patchValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
          this.imagePreview = this.post.imagePath?? '';
          this.form.get('image')?.clearValidators();
          this.form.get('image')?.updateValueAndValidity();
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }


  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    this.form.patchValue({ image: file });
    this.form.get("image")?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      console.log("Form is invalid!", this.form.value);
      return;
    }
  
    this.isLoading = true;
    if (this.mode === 'create') {
      console.log("Creating Post: ", this.form.value);
      this.postsService.addPost(
        this.form.value.title, 
        this.form.value.content, 
        this.form.value.image
      );
    } else {
      console.log("Updating Post: ", this.form.value);
      this.postsService.updatePost(
        this.postId ?? '',
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
  ngOnDestroy(){
    this.authStatusSub?.unsubscribe();
  }
}
