import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component.js';
import { PostCreateComponent } from './posts/post-create/post-create.component.js';

import { AuthGuard } from './auth/auth.guard.js';
import { RenderMode } from '@angular/ssr';

const routes: Routes = [
  {path : '' , component : PostListComponent},
  {path: 'create', component : PostCreateComponent , canActivate: [AuthGuard]},
  {path: 'edit/:postId', component : PostCreateComponent , canActivate: [AuthGuard], data : {RenderMode : 'dynamic'}},
  {path : "auth",loadChildren : () => import('./auth/auth.module').then(m => m.AuthModule)}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers : [AuthGuard]
})
export class AppRoutingModule { }
