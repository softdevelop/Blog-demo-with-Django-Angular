import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { AlertService, UserService, NotificationService, SnackBarService } from '../_services/index';
// import { AppSettings } from '../app.setting';
// import { FormGroup} from '@angular/forms';



@Component({
	selector: 'app-contact',
	templateUrl: './contact.component.html',
	styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

	contact: any = {};
	cookie :any;
	load = false;
	constructor(
		private notificationService : NotificationService,
		private alertService: AlertService,
		private userService : UserService,
		private snackBar:SnackBarService,
		) {
		this.userService.getUsers().subscribe((value) => {
			this.cookie = value;
		});
	}

	ngOnInit() {}


	add_contact(){
		this.load = true;
		// console.log(this.contact)
		this.notificationService.contact(this.contact)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					// this.router.navigate(['/dashboard']);
					this.snackBar.open(response.message);
				}else{
					this.snackBar.open(response.message);
				}
				this.load = false;
			},
			error => {
				this.load = false;
				this.alertService.error(error.message);
			});
		
	}

}
