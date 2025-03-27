import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component.js';
import { PostCreateComponent } from './posts/post-create/post-create.component.js';
import { LoginComponent } from './auth/login/login.component.js';
import { SignupComponent } from './auth/signUp/signup.component.js';

const routes: Routes = [
  {path : '' , component : PostListComponent},
  {path: 'create', component : PostCreateComponent},
  {path: 'edit/:postId', component : PostCreateComponent},
  {path : 'login', component : LoginComponent},
  {path : 'signup',component : SignupComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
