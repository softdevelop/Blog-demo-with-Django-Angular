import { Injectable } from '@angular/core';
// import { Http} from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'

import { AuthenticationService } from '../_services/index';
import { User } from '../_models/index';
// import { AppSettings } from '../app.setting';

@Injectable()
export class UserService {
    constructor(private authenticationService: AuthenticationService) { }

    getUsers(): Observable<User[]> {
        return  this.authenticationService.currentUser.asObservable();
    }

    isLoggedIn() : Observable<boolean> {
        return this.authenticationService.isLogin.asObservable();
    }

}