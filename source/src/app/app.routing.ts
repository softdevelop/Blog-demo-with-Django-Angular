import { Routes,RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { SingupComponent } from './singup/singup.component';
import { DashboardComponent,BlogAddComponent,BlogEditComponent,ProfileComponent,NotificationsComponent } from './dashboard/index';

import { BlogComponent } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';

import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [
    { path: '',component: HomeComponent,data: {title: 'Home'}},
    { path: 'about',component: AboutComponent,data: {title: 'About',breadcrumb: "About"} },
    { path: 'login',component: LoginComponent,data: {title: 'Login',breadcrumb: "Login"} },
    { path: 'singup',component: SingupComponent,data: {title: 'Signup'} },
    { path: 'dashboard',data: {roles : ['admin']},canActivate: [AuthGuard],
		children : [
	        { path: '' ,component: DashboardComponent, data: {title: 'Dashboard',breadcrumb: "Dashboard"} },
            { path: 'notifications',component: NotificationsComponent, data: {title: 'Dashboard > Notifications',breadcrumb: "Notifications"} },
	        { path: 'blog-add',component: BlogAddComponent, data: {title: 'Dashboard > Blog > Add',breadcrumb: "Blog Add"} },
	        { path: 'blog-edit/:id',component: BlogEditComponent,data: {title: 'Dashboard > Blog > Edit',breadcrumb: "Blog Edit"} },
            { path: '**',redirectTo: 'dashboard' }
	    ]
	},
    { path: 'profile',component: ProfileComponent, data: {title: 'Profile',breadcrumb: "Profile"} ,canActivate: [AuthGuard]},
    { path: 'contact',component: ContactComponent, data: {title: 'Contact',breadcrumb: "Contact"}},
    { path: 'blog/:id',component: BlogComponent,data: {title: 'Blog',breadcrumb: "Blog"} },

    // otherwise redirect to home
    { path: '**',redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
