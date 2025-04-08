import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component.js';
import { PostCreateComponent } from './posts/post-create/post-create.component.js';
import { PostYoursComponent } from './posts/post-yours/post-yours.component.js';
import { AuthGuard } from './auth/auth.guard.js';

const routes: Routes = [
  {path : '' , component : PostListComponent},
  {path: 'create', component : PostCreateComponent , canActivate: [AuthGuard]},
  {path: 'edit/:postId', component : PostCreateComponent , canActivate: [AuthGuard]},
  {path: 'my-posts',component: PostYoursComponent,canActivate: [AuthGuard] },
  {path : "auth",loadChildren : () => import('./auth/auth.module').then(m => m.AuthModule)}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes , { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers : [AuthGuard]
})
export class AppRoutingModule { }
