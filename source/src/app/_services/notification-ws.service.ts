import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketService} from './websocket.service';
import {WindowRef} from './window.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import {AppSettings} from '../app.setting';

const CHAT_URL = 'ws://localhost:9090/ws';
const URL_SITE = 'http://localhost:8000/';
export interface NotificationModel {
    'id' : number ,
    'user_id' : number ,
    'username' : string ,
    'firstName' : string  ,
    'lastName' : string , 
    'blog_id' : number  ,
    'blog_title' : string  , 
    'comments_name' : string  , 
    'created' : string  , 
    'status' : string , 
    'comments_id' : number ,
}

@Injectable()
export class ChatService {
    public messages: Subject<any>  = new Subject<any>();

    constructor(private wsService: WebSocketService, winRef: WindowRef) {

        // 1. subscribe to chatbox
        this.messages  = <Subject<any>>this.wsService
        .connect(CHAT_URL)
        .map((response: MessageEvent): any => {
            let result = JSON.parse(response.data);
            let window = winRef.nativeWindow;
            let data = result.data;


            var url = 'http://localhost:8000/#/blog/' + data.blog_id + '#comments_' + data.comments_id;
            var body = data.comments_name;
            var title = data.firstName + ' ' + data.lastName;
            var avartar = data.created_by_image ? data.created_by_image : AppSettings.URL_IMAGE_AVATAR_DEFAULT;
            if (window.Notification && Notification.permission === "granted") {
            //if (window.Notification) {
                var options = {
                    body: body,
                    icon: URL_SITE + avartar,
                }    
                var notification = new Notification(title, options);
                notification.onclick = function(event) {
                  event.preventDefault();
                  window.open(url, '_blank');
                  this.close();
                }
                // setTimeout(notification.close.bind(notification), 5000);
            }
            return result;
        });

    }
} // end class ChatService