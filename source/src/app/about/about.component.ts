import { Component, OnInit } from '@angular/core';
// import {ChatService} from '../_services/notification-ws.service'
// import {Subject} from 'rxjs/Rx'
// import { AlertService, AuthenticationService, NotificationService, SnackBarService, UserService } from '../_services/index';
// import { User } from '../_models/index';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
	
	constructor() {

	}

	ngOnInit() {
		// this.userService.getUsers().subscribe((value) => {
		// 	this.cookie = value;
		// });
		// this.chatService.messages.subscribe(msg => {
		// 	this.messages.push(msg);
		// });

		// this.message = {
		// 	'token' : this.cookie['token'] || '',
		//     'data' :  {},
		// }
		// if(Object.keys(this.cookie).length > 0){
		// 	setTimeout(() => {
		// 		this.message.data = null;
		// 		this.chatService.messages.next(this.message);
		// 	}, 1000);
		// }
		
	}

	sendMsg() {
		// this.chatService.messages.next(this.message);
	}

}
