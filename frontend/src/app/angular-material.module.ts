import { NgModule } from "@angular/core";
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon'
import {MatDividerModule} from '@angular/material/divider'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {MatListModule} from '@angular/material/list'
@NgModule({
    imports : [ MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        FormsModule,
        MatListModule],
    exports : [
            MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatIconModule,
        MatDividerModule,
        FormsModule,
        MatListModule
        ]
})
export class AngularMaterialModule {}