import { Injectable } from '@angular/core';
// import { Http } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { AppSettings } from '../app.setting';


@Injectable()
export class GlobalService {
    cookie : any;
    constructor() { 
        this.cookie  = JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS)) || {};
    }

    get_current_user(){
        return this.cookie;
    }
    
}