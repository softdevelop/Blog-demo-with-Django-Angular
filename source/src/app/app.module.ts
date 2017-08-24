import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import 'hammerjs';

import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { MomentModule } from 'angular2-moment';


import { CKEditorModule } from 'ng2-ckeditor';

import { BsDropdownModule, PaginationModule } from 'ng2-bootstrap';

import { routing } from './app.routing';
import {
	// PlatformLocation,
	// Location,
    LocationStrategy,
    HashLocationStrategy,
	// PathLocationStrategy,
	// APP_BASE_HREF
}
from '@angular/common'; 

import { AppComponent } from './app.component'; 
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component'; 
import { SingupComponent } from './singup/singup.component';
import { DashboardComponent, BlogAddComponent, BlogEditComponent, ProfileComponent, NotificationsComponent } from './dashboard/index';

import { AuthGuard } from './_guards/index';

// used to create fake backend
// import { BaseRequestOptions } from '@angular/http';
 

 
import { AlertComponent, ConfirmDelete, BreadcrumbComponent } from './_directives/index';
import { 
  AlertService, AuthenticationService, UserService, BlogService, SnackBarService, NotificationService, GlobalService,
  WebSocketService, ChatService, WindowRef
} from './_services/index';


import { BlogComponent } from './blog/blog.component';

import { FileSelectDirective } from 'ng2-file-upload';
import { ContactComponent } from './contact/contact.component';


import { LazyLoadImageModule } from 'ng2-lazyload-image';

@NgModule({
  declarations: [
    AlertComponent,
    ConfirmDelete,
    AppComponent,
    HomeComponent,
    AboutComponent,
    LoginComponent,
    SingupComponent,
    DashboardComponent,
    BlogAddComponent,
    BlogEditComponent,
    BlogComponent,
    ProfileComponent,

    FileSelectDirective,

    NotificationsComponent,
    BreadcrumbComponent,
    ContactComponent,

  ],
  
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    CKEditorModule,

    // moment
    MomentModule,

    // angular material
    MaterialModule.forRoot(),

    // bootstrap
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    Ng2PageScrollModule.forRoot(),
    InfiniteScrollModule,
    LazyLoadImageModule

  ],

  providers: [
    Title,
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    BlogService,
    SnackBarService,
    NotificationService,
    GlobalService,
    // WebSocket
    WebSocketService,
    ChatService,
    // get window
    WindowRef,
    // add # URL
    { provide: LocationStrategy, useClass: HashLocationStrategy}
  ],

  bootstrap: [
    AppComponent
  ],

  entryComponents : [
    ConfirmDelete
  ]
})
export class AppModule { }
