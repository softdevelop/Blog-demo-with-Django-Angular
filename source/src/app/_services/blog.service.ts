import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
// import { AppSettings } from '../app.setting';


@Injectable()
export class BlogService {
    // cookie : any = JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS)) || {};
    constructor(private http: Http) { }

    add(model: any, cookie : any) {
        let url = '/api/blog/add';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('title', model.title);
        fd.append('content_short', model.content_short);
        fd.append('content_full', model.content_full);
        fd.append('file', model.file);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    edit(model: any, cookie : any) {
        let url = '/api/blog/edit';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', model.id);
        fd.append('title', model.title);
        fd.append('content_short', model.content_short);
        fd.append('content_full', model.content_full);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    delete(id: number, cookie : any) {
        let url = '/api/blog/delete';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', id);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    list(cookie : any, page: any) {
        if(page){
            page = '&page=' + page.page + '&itemsPerPage=' + page.itemsPerPage
        }
        let url = '/api/blog/list?token=' + (cookie.token || '') + page;
        return this.http.get(url, this.jwt(cookie));
    }
    
    get(cookie : any, id : string) {
        let url = '/api/blog/get?token=' + (cookie.token || '') + '&id=' + id;
        return this.http.get(url, this.jwt(cookie)); 
    }


    like(cookie : any, id : string) {
        let url = '/api/blog/like';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', id);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    comments(cookie : any, id : string,comments: string, comment_id: number = 0) {
        let url = '/api/blog/comments';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', id);
        fd.append('comments', comments);
        if(comment_id > 0){
            fd.append('comments_id', comment_id);
        }

        return this.http.post(url, fd, this.jwt(cookie));
    }

    list_all(page : any) {
        if(page){
            page = '?page=' + page.page + '&itemsPerPage=' + page.itemsPerPage
        }
        let url = '/api/blog/list-all' + page;
        return this.http.get(url);
    }

    list_comments(id : string, page : any) {
        if(page){
            page = '&page=' + page.page + '&itemsPerPage=' + page.itemsPerPage
        }
        let url = '/api/blog/list-comments?id=' + id + page;
        return this.http.get(url);
    }

    delete_comment(id: number, cookie : any) {
        let url = '/api/blog/list-delete-comments';
        let fd = new FormData();
        fd.append('token', (cookie.token || ''));
        fd.append('id', id);
        return this.http.post(url, fd, this.jwt(cookie));
    }

    private jwt(cookie : any) {
        // create authorization header with jwt token
        if (cookie && cookie.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + cookie.token });
            return new RequestOptions({ headers: headers });
        }
    }
}