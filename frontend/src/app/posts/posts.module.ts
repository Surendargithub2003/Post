import { NgModule } from "@angular/core";
import { PostListComponent } from './post-list/post-list.component';
import { PostCreateComponent } from './post-create/post-create.component';
import { ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../angular-material.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PostYoursComponent } from './post-yours/post-yours.component';


@NgModule({
    declarations : [
        PostCreateComponent,
        PostListComponent,
        PostYoursComponent
    ],
    imports : [
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
    ]
})
export class PostsModule{}