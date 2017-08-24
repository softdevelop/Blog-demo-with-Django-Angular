import { Component, OnInit } from '@angular/core';
import { AlertService, SnackBarService, UserService, NotificationService } from '../../_services/index';
import { AppSettings } from '../../app.setting';
import { Router } from '@angular/router';
// import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
// import { User } from '../../_models/index';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
	notifications :  any = {};
	cookie : any;
	url_image : string = AppSettings.URL_IMAGE_PROFILE;
	page = {
		itemsPerPage : 10,
		page: 1
	};


	constructor(
		private notificationService : NotificationService,
		private alertService: AlertService,
		private router: Router,
		// private route: ActivatedRoute,
		private snackBar:SnackBarService,
		private userService : UserService					
	) { 
		this.userService.getUsers().subscribe((value) => {
			this.cookie = value;
		});
	}

	ngOnInit() {
		this.get_notification(this.page);
	}

	get_notification(page){
		this.notificationService.list_all(page, this.cookie)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.notifications = response;
				}else{
					this.alertService.error(response.message); 
				}
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
					if(response.result === 0){
						this.snackBar.open(response.message);  
					}
				},
				error => {
					this.alertService.error(error.message);
				});
		}
		this.router.navigate([ '/blog/' + obj.blog_id ], { fragment:  'comments_' + obj.comments_id });
	}

	pageChanged(e){
		// console.log(e)
		this.page = e;
		this.get_notification(this.page);
	}


}
