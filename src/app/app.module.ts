import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { PinchService } from 'app/pinch.service';
import { RouterModule } from '@angular/router';
import { ImageComponent } from './image.component';
import { NavComponent } from './nav.component';

@NgModule({
  declarations: [
    AppComponent,
    ImageComponent,
    NavComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
        {path: '', component: AppComponent},
        {path: 'image', component: ImageComponent},
    ])
  ],
  providers: [PinchService],
  bootstrap: [NavComponent]
})
export class AppModule { }
