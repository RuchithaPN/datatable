import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCard } from "@angular/material/card";
import { MatProgressBar, MatProgressBarModule } from "@angular/material/progress-bar";
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCalendar } from "@angular/material/datepicker";
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from "@angular/material/menu";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import { CdkTableModule } from '@angular/cdk/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DragDropModule} from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDrop } from '@angular/cdk/drag-drop'; // Add this line
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ClipboardModule } from '@angular/cdk/clipboard';
import {
  MatSlideToggleModule,
  _MatSlideToggleRequiredValidatorModule,
} from '@angular/material/slide-toggle';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatStepperModule } from '@angular/material/stepper';
import { PlotlyExampleComponentComponent } from './plotly-example-component/plotly-example-component.component';
import { PlotlyViaWindowModule } from 'angular-plotly.js';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { NewComponent } from './new/new.component';
import { PdfUploadComponent } from './pdf-upload/pdf-upload.component';

PlotlyModule.plotlyjs = PlotlyJS;






@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PlotlyExampleComponentComponent,
    NewComponent,
    PdfUploadComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTableModule,
    MatFormFieldModule,
    MatMenuModule,
    MatIconModule,
    MatProgressBarModule,
    MatSortModule,
    CdkTableModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSelectModule,
    FormsModule,
    MatIconModule,
    DragDropModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatDialogModule,
    ClipboardModule,
    MatSidenavModule,
    MatSlideToggleModule,
    ColorPickerModule,
    MatStepperModule,
    AppRoutingModule,
    PlotlyViaWindowModule,
    PlotlyModule
  ],
  providers: [
    DragDrop
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
