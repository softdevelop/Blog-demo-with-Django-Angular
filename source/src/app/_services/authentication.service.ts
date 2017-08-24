import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map'
import { AppSettings } from '../app.setting';
import { User } from '../_models/index';



@Injectable()
export class AuthenticationService {

    public token: string;
    public isLogin = new BehaviorSubject<boolean>(this.hasToken());
    public currentUser = new BehaviorSubject<User[]>(this.get_cookie());


    constructor(private http: Http) {
        var currentUser_get = JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS));
        this.token = currentUser_get && currentUser_get.token;
    }


    login(username: string, password: string): Observable<boolean> {
        let url = '/api/login';
        let fd = new FormData();
        fd.append('username', username);
        fd.append('password', password);
        return this.http.post(url, fd)
        .map((response: Response) => {
            let result = response.json();
            if(result.result > 0){
                let token = result && result.data.token;
                if (token) {
                    this.token = token;
                    this.set_cookie(result.data);
                    this.isLogin.next(true);
                    this.currentUser.next(result.data);
                    return true;
                } 
            }else {
                return false;
            }
        });
    }

    signup(fname: string, lname: string, username: string, password: string) {
        let url = '/api/signup';
        let fd = new FormData();
        fd.append('fname', fname);
        fd.append('lname', lname);
        fd.append('username', username);
        fd.append('password', password);
        return this.http.post(url, fd);
    }

    logout(): Observable<boolean>{
        let url = '/api/logout';
        return this.http.get(url)
        .map((response: Response) => {
            let result = response.json();
            if (result.result > 0) {
                this.token = null;
                this.remove_cookie();
                this.isLogin.next(false);
                this.currentUser.next(this.get_cookie());
                return true;
            } else {
                return false;
            }
        });
    }

    get_profile(cookie) {
        let url = '/api/profile/get?token=' + (cookie.token || '');
        return this.http.get(url, this.jwt(cookie));
    }

    list_role() {
        let url = '/api/list-roles';
        return this.http.get(url);
    }
    

    set_cookie(data : any){
        let obj : User = { 
            id: data.id,
            email : data.email,
            firstName : data.firstName,
            image : data.image,
            is_superuser : data.is_superuser,
            lastName : data.lastName,
            token : data.token,
            userName : data.userName,
            roles : data.roles,
        }
        localStorage.setItem(AppSettings.COOKIE_USERS, JSON.stringify(obj));
        this.currentUser.next(this.get_cookie());
    }

    get_cookie(){
        return JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS)) || {};
    }

    remove_cookie(){
        localStorage.removeItem(AppSettings.COOKIE_USERS);
    }


    private hasToken() : boolean {
        return !!localStorage.getItem(AppSettings.COOKIE_USERS);
    }

    private jwt(cookie : any) {
        // create authorization header with jwt token
        if (cookie && cookie.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + cookie.token });
            return new RequestOptions({ headers: headers });
        }
    }
}

