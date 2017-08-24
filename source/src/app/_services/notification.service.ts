import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
// import { AppSettings } from '../app.setting';


@Injectable()
export class NotificationService {
    // cookie : any = JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS)) || {};
    constructor(private http: Http) { }

    count(cookie : any) {
        let url = '/api/notification/count?token=' + (cookie.token || '');
        return this.http.get(url, this.jwt(cookie));
    }


    list_all(page : any, cookie : any) {
        if(page){
            page = '&page=' + page.page + '&itemsPerPage=' + page.itemsPerPage
        }
        let url = '/api/notification/list-all?token=' + (cookie.token || '') + page;
        return this.http.get(url);
    }

    list(cookie : any) {
        let url = '/api/notification/list?token=' + (cookie.token || '');
        return this.http.get(url, this.jwt(cookie));
    }

    mask_read(id: any, cookie : any) {
        let url = '/api/notification/mask-read';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', id);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    mask_all_read(cookie : any, ids : any) {
        ids = JSON.stringify(ids);
        let url = '/api/notification/mask-all-read';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('ids', ids);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    contact(model: any) {
        let url = '/api/contact';
        let fd = new FormData();
        fd.append('email', model.email);
        fd.append('title', model.title);
        fd.append('content', model.content);
        return this.http.post(url, fd);
    }



    edit_profile(model: any, cookie : any) {
        let url = '/api/profile/edit';
        let form = new FormData();
        form.append('token', cookie.token);
        form.append('first_name', model.firstName);
        form.append('last_name', model.lastName);
        form.append('info', model.info);
        form.append('email', model.email);
        form.append('roles', model.roles);
        form.append('file', model.file);
        return this.http.post(url, form, this.jwt(cookie));
    }
   

    private jwt(cookie : any) {
        // create authorization header with jwt token
        if (cookie && cookie.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + cookie.token });
            return new RequestOptions({ headers: headers });
        }
    }
}