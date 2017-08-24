import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { AppSettings } from './app.setting';
import { AlertService, AuthenticationService, NotificationService, SnackBarService, UserService, ChatService } from './_services/index';
import { User } from './_models/index';
// import { Observable, BehaviorSubject } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	//template: '<h1>AAA</h1>',
	styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
	title = '';
	cookie : User[];
	isLogin : boolean;
	isPermision : boolean = false;
	notification_list : any = [];
	notification_info : any = {};
	url_image: string = AppSettings.URL_IMAGE_PROFILE;
	loadNotification = false;
	notification_count = 0;
	notificationCount = 0;
	
	page_notification : any = {};

	constructor(
		titleService:Title, 
		private router: Router,
		// activatedRoute:ActivatedRoute, 
		private authenticationService: AuthenticationService,
		private alertService: AlertService,
		private notificationService: NotificationService,
		private snackBar:SnackBarService,
		private userService: UserService,
		private chatService: ChatService, 
		) {
		this.userService.getUsers().subscribe((value) => {
			this.cookie = value;
		});
		router.events.subscribe(event => {
			if(event instanceof NavigationEnd) {
				var title = this.getTitle(router.routerState, router.routerState.root).join('-') +' | ' +  AppSettings.TITLE_HOST ;
				titleService.setTitle(title);
				this.userService.isLoggedIn().subscribe((value) => {
					this.isLogin = value;
				});
			}
		});
	}

	ngOnInit() {
		this.userService.isLoggedIn().subscribe((value) => {
			if(value) {
				this.count_notifications();
				// notification websocket

				this.chatService.messages.subscribe(() => {
					this.notificationCount += 1;
				});

				let notificationWs = {
					'token' : this.cookie['token'] || '',
					'data' : null
				}
				setTimeout(() => {
					this.chatService.messages.next(notificationWs);
				}, 1000);
			}
		});
	}

	count_notifications(){
		this.notificationService.count(this.cookie)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.notificationCount = response.data;
				}else{
					this.snackBar.open(response.message); 
				} 
			},
			error => {
				this.alertService.error(error.message);
			});
	}



	onScrollNotifications(page){
		if(this.notification_info.next_page_number){
			this.page_notification.page = page.page + 1;
			this.get_list_notifications(this.page_notification);
		}
	}

	openDropdownNotification(open:boolean){
		if(open){
			this.notification_list = [];
			this.page_notification = {
				itemsPerPage : 5,
				page: 1
			};
			this.get_list_notifications(this.page_notification);
		}
	}

	get_list_notifications(page){
		this.loadNotification = true;
		this.notificationService.list_all(page, this.cookie)
		.subscribe(
			data => {
				let response =  data.json();
				this.loadNotification = false;
				if(response.result > 0){
					this.notification_count = response.count;
					this.notification_info = response.info;
					this.notification_list = this.addListNotification(this.notification_list, response.data)
				}else{
					this.snackBar.open(response.message); 
				} 
			},
			error => {
				this.loadNotification = false;
				this.alertService.error(error.message);
			});
	}


	addListNotification(list, dataNew){
			//dataNew.forEach((value, key) => {
		  	for (let key in dataNew) {
			    list.push(dataNew[key]);
			}; 	
		
		return list;
	}
	changeStatusNotification(list, data){
		list.forEach((value)=>{
			data.forEach((v)=>{
				if(value.id === v) {
					value.status = 0;
				}
			})
		});
		return list;
	}

	listIdsNotificationMaskAsRead (list){
		let arr = [];
		list.forEach((value)=>{
			arr.push(value.id);
		});
		return arr;
	}
	
	mask_all_read_notification(){
		let ids = this.listIdsNotificationMaskAsRead(this.notification_list);
		this.notificationService.mask_all_read(this.cookie, ids)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					if(response.data.length > 0){
						this.notification_list = this.changeStatusNotification(this.notification_list, response.data);
						this.notification_count -= response.data.length;
						this.notificationCount = 0;
					}
				}
				this.snackBar.open(response.message);  
			},
			error => {
				this.alertService.error(error.message);
			});
	}

	mask_read_notification(obj){
		// console.log(obj)
		if(obj.status > 0){
			this.notificationService.mask_read(obj.id,this.cookie)
			.subscribe(
				data => {
					let response =  data.json();
					if(response.result > 0){
						this.notification_list = this.changeStatusNotification(this.notification_list, [obj.id]);
						this.notification_count -= 1;
					}else{
						this.snackBar.open(response.message);  
					}
				},
				error => {
					this.alertService.error(error.message);
				});
		}
		// this.router.navigate([ '/blog/' + obj.blog_id ], { fragment:  'comments_' + obj.comments_id });
	}

	getTitle(state, parent) {
		var data = [];
		if(parent && parent.snapshot.data && parent.snapshot.data.title) {
			data.push(parent.snapshot.data.title);
		}

		if(state && parent) {
			data.push(... this.getTitle(state, state.firstChild(parent)));
		}
		return data;
	}


	logout(e){
		e.preventDefault();
		this.authenticationService.logout()
		.subscribe(
			result => {
				if (result === true) {
					this.router.navigate(['/login']);
				}else{
					this.snackBar.open('Error'); 
				}
			});
	}
}
